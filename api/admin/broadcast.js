const jwt = require('jsonwebtoken');
const TelegramBot = require('node-telegram-bot-api');
const db = require('../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN);

function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  
  return jwt.verify(token, JWT_SECRET);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    
    if (!decoded.isAdmin && !decoded.isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.method === 'POST') {
      const { message, delay = 0 } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Get all active users
      const users = await db.getAllActiveUsers();
      
      if (users.length === 0) {
        return res.status(400).json({ error: 'No active users found' });
      }
      
      // Create broadcast record
      const broadcast = await db.createBroadcast(message, decoded.userId, users.length);
      
      // Start broadcasting in background
      setImmediate(async () => {
        let success = 0;
        let failed = 0;
        
        await db.updateBroadcastStats(broadcast.id || broadcast._id, 0, 0, 'sending');
        
        for (const user of users) {
          try {
            await bot.sendMessage(
              user.id, 
              `📢 <b>Pengumuman:</b>\n\n${escapeHtml(message)}`, 
              { parse_mode: 'HTML' }
            );
            success++;
            
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, delay * 1000));
            }
          } catch (error) {
            console.error(`Failed to send broadcast to ${user.id}:`, error.message);
            failed++;
          }
          
          // Update progress every 10 users
          if ((success + failed) % 10 === 0) {
            await db.updateBroadcastStats(broadcast.id || broadcast._id, success, failed, 'sending');
          }
        }
        
        // Final update
        await db.updateBroadcastStats(broadcast.id || broadcast._id, success, failed, 'completed');
      });
      
      res.status(200).json({
        success: true,
        message: 'Broadcast started',
        broadcastId: broadcast.id || broadcast._id,
        totalUsers: users.length
      });
      
    } else if (req.method === 'GET') {
      // Get broadcast history
      const { page = 1, limit = 10 } = req.query;
      
      await db.connect();
      
      let broadcasts = [];
      let total = 0;
      
      if (db.type === 'mongodb') {
        total = await db.Broadcast.countDocuments();
        broadcasts = await db.Broadcast.find()
          .sort({ sent_at: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .populate('sent_by', 'username first_name');
          
      } else {
        const client = await db.pgPool.connect();
        try {
          const countResult = await client.query('SELECT COUNT(*) as total FROM broadcasts');
          total = parseInt(countResult.rows[0].total);
          
          const offset = (page - 1) * limit;
          const broadcastsResult = await client.query(`
            SELECT b.*, u.username, u.first_name
            FROM broadcasts b
            LEFT JOIN users u ON b.sent_by = u.id
            ORDER BY b.sent_at DESC
            LIMIT $1 OFFSET $2
          `, [limit, offset]);
          
          broadcasts = broadcastsResult.rows;
          
        } finally {
          client.release();
        }
      }
      
      res.status(200).json({
        success: true,
        broadcasts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Broadcast API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};