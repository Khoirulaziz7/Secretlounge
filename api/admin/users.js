const jwt = require('jsonwebtoken');
const db = require('../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const OWNER_ID = parseInt(process.env.OWNER_ID);

function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  
  return jwt.verify(token, JWT_SECRET);
}

module.exports = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    
    if (!decoded.isAdmin && !decoded.isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.method === 'GET') {
      // Get users list
      const { page = 1, limit = 20, search = '', filter = 'all' } = req.query;
      
      await db.connect();
      
      let users = [];
      let total = 0;
      
      if (db.type === 'mongodb') {
        const query = {};
        
        if (search) {
          query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { first_name: { $regex: search, $options: 'i' } },
            { id: isNaN(search) ? undefined : parseInt(search) }
          ].filter(Boolean);
        }
        
        if (filter === 'active') query.is_active = true;
        if (filter === 'banned') query.is_banned = true;
        if (filter === 'admin') query.is_admin = true;
        
        total = await db.User.countDocuments(query);
        users = await db.User.find(query)
          .sort({ join_date: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
          
      } else {
        const client = await db.pgPool.connect();
        try {
          let whereClause = 'WHERE 1=1';
          const params = [];
          let paramCount = 0;
          
          if (search) {
            paramCount++;
            whereClause += ` AND (username ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR id = $${paramCount + 1})`;
            params.push(`%${search}%`, isNaN(search) ? 0 : parseInt(search));
            paramCount++;
          }
          
          if (filter === 'active') {
            whereClause += ' AND is_active = TRUE';
          } else if (filter === 'banned') {
            whereClause += ' AND is_banned = TRUE';
          } else if (filter === 'admin') {
            whereClause += ' AND is_admin = TRUE';
          }
          
          // Get total count
          const countResult = await client.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
          total = parseInt(countResult.rows[0].total);
          
          // Get users
          const offset = (page - 1) * limit;
          const usersResult = await client.query(`
            SELECT * FROM users ${whereClause}
            ORDER BY join_date DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
          `, [...params, limit, offset]);
          
          users = usersResult.rows;
          
        } finally {
          client.release();
        }
      }
      
      res.status(200).json({
        success: true,
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } else if (req.method === 'POST') {
      // User actions (ban, unban, promote, demote)
      const { action, userId, reason } = req.body;
      
      if (!action || !userId) {
        return res.status(400).json({ error: 'Action and userId required' });
      }
      
      let result;
      
      switch (action) {
        case 'ban':
          if (!decoded.isAdmin && !decoded.isOwner) {
            return res.status(403).json({ error: 'Admin privileges required' });
          }
          result = await db.banUser(parseInt(userId), reason || 'Banned by admin', decoded.userId);
          break;
          
        case 'unban':
          if (!decoded.isAdmin && !decoded.isOwner) {
            return res.status(403).json({ error: 'Admin privileges required' });
          }
          result = await db.unbanUser(parseInt(userId));
          break;
          
        case 'promote':
          if (!decoded.isOwner) {
            return res.status(403).json({ error: 'Owner privileges required' });
          }
          result = await db.promoteUser(parseInt(userId));
          break;
          
        case 'demote':
          if (!decoded.isOwner) {
            return res.status(403).json({ error: 'Owner privileges required' });
          }
          if (parseInt(userId) === OWNER_ID) {
            return res.status(400).json({ error: 'Cannot demote owner' });
          }
          result = await db.demoteUser(parseInt(userId));
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
      
      res.status(200).json({
        success: true,
        message: `User ${action} successful`,
        user: result
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};