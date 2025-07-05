const jwt = require('jsonwebtoken');
const db = require('../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  
  return jwt.verify(token, JWT_SECRET);
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    
    if (!decoded.isAdmin && !decoded.isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await db.getStats();
    
    // Get additional stats
    await db.connect();
    
    let dailyStats = [];
    let recentUsers = [];
    let recentBroadcasts = [];
    
    if (db.type === 'mongodb') {
      // Get daily message stats for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyMessages = await db.Message.aggregate([
        {
          $match: {
            created_at: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      dailyStats = dailyMessages.map(item => ({
        date: item._id,
        messages: item.count
      }));
      
      // Get recent users
      recentUsers = await db.User.find({ is_active: true })
        .sort({ join_date: -1 })
        .limit(10)
        .select('id username first_name join_date');
      
      // Get recent broadcasts
      recentBroadcasts = await db.Broadcast.find()
        .sort({ sent_at: -1 })
        .limit(5)
        .select('message sent_at total_users success_count failed_count status');
        
    } else {
      // PostgreSQL queries
      const client = await db.pgPool.connect();
      try {
        // Daily stats
        const dailyResult = await client.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as messages
          FROM messages 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `);
        
        dailyStats = dailyResult.rows;
        
        // Recent users
        const usersResult = await client.query(`
          SELECT id, username, first_name, join_date
          FROM users 
          WHERE is_active = TRUE
          ORDER BY join_date DESC
          LIMIT 10
        `);
        
        recentUsers = usersResult.rows;
        
        // Recent broadcasts
        const broadcastsResult = await client.query(`
          SELECT message, sent_at, total_users, success_count, failed_count, status
          FROM broadcasts
          ORDER BY sent_at DESC
          LIMIT 5
        `);
        
        recentBroadcasts = broadcastsResult.rows;
        
      } finally {
        client.release();
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        dailyStats,
        recentUsers,
        recentBroadcasts
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};