const jwt = require('jsonwebtoken');
const db = require('../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const OWNER_ID = parseInt(process.env.OWNER_ID);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID required' });
    }

    // Check if user is admin or owner
    const user = await db.getUser(parseInt(telegramId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_admin && parseInt(telegramId) !== OWNER_ID) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        isAdmin: user.is_admin,
        isOwner: parseInt(telegramId) === OWNER_ID
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        is_admin: user.is_admin,
        is_owner: parseInt(telegramId) === OWNER_ID
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};