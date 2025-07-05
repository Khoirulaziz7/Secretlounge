const mongoose = require('mongoose');
const { Pool } = require('pg');

// MongoDB Schema
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: String,
  first_name: String,
  last_name: String,
  is_active: { type: Boolean, default: true },
  is_banned: { type: Boolean, default: false },
  is_admin: { type: Boolean, default: false },
  join_date: { type: Date, default: Date.now },
  last_activity: { type: Date, default: Date.now },
  warning_count: { type: Number, default: 0 },
  karma: { type: Number, default: 0 },
  ban_reason: String,
  banned_by: Number,
  banned_at: Date
});

const messageSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  message_id: Number,
  content: String,
  message_type: String,
  created_at: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  key_name: { type: String, required: true, unique: true },
  value: String,
  updated_at: { type: Date, default: Date.now }
});

const broadcastSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sent_by: { type: Number, required: true },
  sent_at: { type: Date, default: Date.now },
  total_users: Number,
  success_count: Number,
  failed_count: Number,
  status: { type: String, enum: ['pending', 'sending', 'completed', 'failed'], default: 'pending' }
});

let User, Message, Settings, Broadcast;
let pgPool;

class Database {
  constructor() {
    this.type = process.env.DATABASE_TYPE || 'mongodb';
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      if (this.type === 'mongodb') {
        await this.connectMongoDB();
      } else if (this.type === 'postgresql') {
        await this.connectPostgreSQL();
      } else {
        throw new Error('Unsupported database type');
      }
      this.isConnected = true;
      console.log(`Connected to ${this.type} database`);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async connectMongoDB() {
    await mongoose.connect(process.env.DATABASE_URL);
    User = mongoose.model('User', userSchema);
    Message = mongoose.model('Message', messageSchema);
    Settings = mongoose.model('Settings', settingsSchema);
    Broadcast = mongoose.model('Broadcast', broadcastSchema);
  }

  async connectPostgreSQL() {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Create tables if they don't exist
    await this.createPostgreSQLTables();
  }

  async createPostgreSQLTables() {
    const client = await pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY,
          username VARCHAR(255),
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          is_banned BOOLEAN DEFAULT FALSE,
          is_admin BOOLEAN DEFAULT FALSE,
          join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          warning_count INTEGER DEFAULT 0,
          karma INTEGER DEFAULT 0,
          ban_reason TEXT,
          banned_by BIGINT,
          banned_at TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          user_id BIGINT REFERENCES users(id),
          message_id INTEGER,
          content TEXT,
          message_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          key_name VARCHAR(255) PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS broadcasts (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          sent_by BIGINT NOT NULL,
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          total_users INTEGER,
          success_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending'
        )
      `);

      // Create indexes
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_banned ON users(is_banned)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status)');
    } finally {
      client.release();
    }
  }

  // User operations
  async getUser(userId) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await User.findOne({ id: userId });
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    }
  }

  async createUser(userInfo) {
    await this.connect();
    
    const isOwner = userInfo.id === parseInt(process.env.OWNER_ID);
    
    if (this.type === 'mongodb') {
      return await User.findOneAndUpdate(
        { id: userInfo.id },
        {
          ...userInfo,
          is_admin: isOwner,
          last_activity: new Date()
        },
        { upsert: true, new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query(`
          INSERT INTO users (id, username, first_name, last_name, is_admin, last_activity) 
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET 
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            last_activity = CURRENT_TIMESTAMP
          RETURNING *
        `, [userInfo.id, userInfo.username, userInfo.first_name, userInfo.last_name, isOwner]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  async getAllActiveUsers() {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await User.find({ is_active: true, is_banned: false });
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query('SELECT * FROM users WHERE is_active = TRUE AND is_banned = FALSE');
        return result.rows;
      } finally {
        client.release();
      }
    }
  }

  async getUserCount() {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await User.countDocuments({ is_active: true, is_banned: false });
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE AND is_banned = FALSE');
        return parseInt(result.rows[0].count);
      } finally {
        client.release();
      }
    }
  }

  async banUser(userId, reason, bannedBy) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await User.findOneAndUpdate(
        { id: userId },
        { 
          is_banned: true, 
          ban_reason: reason,
          banned_by: bannedBy,
          banned_at: new Date()
        },
        { new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query(`
          UPDATE users SET 
            is_banned = TRUE, 
            ban_reason = $2,
            banned_by = $3,
            banned_at = CURRENT_TIMESTAMP
          WHERE id = $1 
          RETURNING *
        `, [userId, reason, bannedBy]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  async unbanUser(userId) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await User.findOneAndUpdate(
        { id: userId },
        { 
          is_banned: false, 
          ban_reason: null,
          banned_by: null,
          banned_at: null
        },
        { new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query(`
          UPDATE users SET 
            is_banned = FALSE, 
            ban_reason = NULL,
            banned_by = NULL,
            banned_at = NULL
          WHERE id = $1 
          RETURNING *
        `, [userId]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  async promoteUser(userId) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await User.findOneAndUpdate(
        { id: userId },
        { is_admin: true },
        { new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query('UPDATE users SET is_admin = TRUE WHERE id = $1 RETURNING *', [userId]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  async demoteUser(userId) {
    await this.connect();
    
    const ownerId = parseInt(process.env.OWNER_ID);
    if (userId === ownerId) return null; // Can't demote owner
    
    if (this.type === 'mongodb') {
      return await User.findOneAndUpdate(
        { id: userId },
        { is_admin: false },
        { new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query('UPDATE users SET is_admin = FALSE WHERE id = $1 AND id != $2 RETURNING *', [userId, ownerId]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  // Broadcast operations
  async createBroadcast(message, sentBy, totalUsers) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      const broadcast = new Broadcast({
        message,
        sent_by: sentBy,
        total_users: totalUsers
      });
      return await broadcast.save();
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query(`
          INSERT INTO broadcasts (message, sent_by, total_users) 
          VALUES ($1, $2, $3) 
          RETURNING *
        `, [message, sentBy, totalUsers]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  async updateBroadcastStats(broadcastId, successCount, failedCount, status) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await Broadcast.findByIdAndUpdate(
        broadcastId,
        { success_count: successCount, failed_count: failedCount, status },
        { new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query(`
          UPDATE broadcasts SET 
            success_count = $2, 
            failed_count = $3, 
            status = $4 
          WHERE id = $1 
          RETURNING *
        `, [broadcastId, successCount, failedCount, status]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  // Settings operations
  async getSetting(key) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      const setting = await Settings.findOne({ key_name: key });
      return setting ? setting.value : null;
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query('SELECT value FROM settings WHERE key_name = $1', [key]);
        return result.rows[0] ? result.rows[0].value : null;
      } finally {
        client.release();
      }
    }
  }

  async setSetting(key, value) {
    await this.connect();
    
    if (this.type === 'mongodb') {
      return await Settings.findOneAndUpdate(
        { key_name: key },
        { value, updated_at: new Date() },
        { upsert: true, new: true }
      );
    } else {
      const client = await pgPool.connect();
      try {
        const result = await client.query(`
          INSERT INTO settings (key_name, value) VALUES ($1, $2)
          ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [key, value]);
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  // Statistics
  async getStats() {
    await this.connect();
    
    if (this.type === 'mongodb') {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ is_active: true, is_banned: false });
      const bannedUsers = await User.countDocuments({ is_banned: true });
      const adminUsers = await User.countDocuments({ is_admin: true });
      const totalMessages = await Message.countDocuments();
      const todayMessages = await Message.countDocuments({
        created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      });
      
      return {
        totalUsers,
        activeUsers,
        bannedUsers,
        adminUsers,
        totalMessages,
        todayMessages
      };
    } else {
      const client = await pgPool.connect();
      try {
        const stats = {};
        
        const userStats = await client.query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE is_active = TRUE AND is_banned = FALSE) as active_users,
            COUNT(*) FILTER (WHERE is_banned = TRUE) as banned_users,
            COUNT(*) FILTER (WHERE is_admin = TRUE) as admin_users
          FROM users
        `);
        
        const messageStats = await client.query(`
          SELECT 
            COUNT(*) as total_messages,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_messages
          FROM messages
        `);
        
        return {
          totalUsers: parseInt(userStats.rows[0].total_users),
          activeUsers: parseInt(userStats.rows[0].active_users),
          bannedUsers: parseInt(userStats.rows[0].banned_users),
          adminUsers: parseInt(userStats.rows[0].admin_users),
          totalMessages: parseInt(messageStats.rows[0].total_messages),
          todayMessages: parseInt(messageStats.rows[0].today_messages)
        };
      } finally {
        client.release();
      }
    }
  }
}

module.exports = new Database();