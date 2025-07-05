const TelegramBot = require('node-telegram-bot-api');
const bcrypt = require('bcryptjs');
const db = require('../lib/database');

// Konfigurasi
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const OWNER_ID = parseInt(process.env.OWNER_ID);
const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL;
const SECRET_SALT = process.env.SECRET_SALT;

// Inisialisasi bot
const bot = new TelegramBot(BOT_TOKEN);

// Fungsi utilitas
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateObfuscatedId(userId) {
  const today = new Date().toDateString();
  const hash = bcrypt.hashSync(`${userId}${today}${SECRET_SALT}`, 10);
  return hash.substring(hash.length - 8);
}

// Cek membership channel
async function checkChannelMembership(userId) {
  if (!REQUIRED_CHANNEL) return true;
  
  try {
    const member = await bot.getChatMember(`@${REQUIRED_CHANNEL}`, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    return false;
  }
}

// Pesan-pesan bot
const messages = {
  welcome: `🎭 <b>Selamat datang di Chat Anonim Indonesia!</b>

Bot ini memungkinkan Anda untuk berbicara secara anonim dengan pengguna lain. Semua pesan yang Anda kirim akan diteruskan ke semua anggota tanpa menampilkan identitas Anda.

<b>📋 Aturan Penting:</b>
• Dilarang spam atau flood
• Dilarang konten SARA, pornografi, atau kekerasan
• Dilarang promosi tanpa izin
• Hormati sesama pengguna

<b>🎯 Fitur Utama:</b>
• Chat anonim dengan semua anggota
• Sistem karma (like/dislike)
• Moderasi otomatis
• Peringatan dan cooldown

<b>⚡ Perintah Tersedia:</b>
/help - Bantuan lengkap
/info - Info akun Anda
/users - Jumlah pengguna aktif
/keluar - Keluar dari chat

Mulai kirim pesan untuk bergabung dalam percakapan!`,

  help: `🔧 <b>Bantuan Bot Chat Anonim</b>

<b>📱 Perintah Umum:</b>
/start - Memulai bot dan bergabung
/help - Menampilkan bantuan ini
/info - Melihat informasi akun Anda
/users - Melihat jumlah pengguna aktif
/keluar - Keluar dari chat anonim
/ping - Cek status bot

<b>💬 Cara Menggunakan:</b>
• Kirim pesan apapun untuk diteruskan ke semua anggota
• Balas pesan dengan 👍 untuk memberi karma
• Gunakan /tanda untuk menandatangani pesan

<b>⚠️ Peringatan:</b>
• Pesan yang melanggar aturan akan dihapus
• Spam berlebihan akan mendapat cooldown
• Pelanggaran serius bisa berujung ban

<b>🆘 Butuh Bantuan?</b>
Hubungi admin jika ada masalah atau pertanyaan.`,

  adminHelp: `👑 <b>Perintah Owner/Admin</b>

<b>🔨 Moderasi:</b>
/ban [user_id] [alasan] - Ban pengguna
/unban [user_id] - Unban pengguna
/promote [user_id] - Angkat admin
/demote [user_id] - Turunkan admin

<b>📢 Broadcast:</b>
/broadcast [pesan] - Kirim pesan ke semua
/broadcast_delay [detik] [pesan] - Broadcast dengan jeda

<b>⚙️ Pengaturan:</b>
/setwelcome [pesan] - Set pesan welcome
/stats - Statistik lengkap bot
/adminpanel - Akses panel admin web

<b>📊 Info:</b>
/admininfo [reply] - Info detail pengguna`,

  notMember: `❌ <b>Akses Ditolak</b>

Untuk menggunakan bot ini, Anda harus bergabung dengan channel resmi kami terlebih dahulu:

👉 @${REQUIRED_CHANNEL}

Setelah bergabung, ketik /start lagi untuk memulai.`,

  banned: `🚫 <b>Akun Diblokir</b>

Akun Anda telah diblokir dari menggunakan bot ini karena melanggar aturan.

Jika Anda merasa ini adalah kesalahan, hubungi admin.`,

  notInChat: `❌ Anda belum bergabung dalam chat. Ketik /start untuk bergabung.`,

  leftChat: `👋 Anda telah keluar dari chat anonim. Ketik /start jika ingin bergabung kembali.`,

  userInfo: (user, obfuscatedId) => `👤 <b>Informasi Akun Anda</b>

🆔 ID Anonim: <code>${obfuscatedId}</code>
👤 Status: ${user.is_admin ? '👑 Admin' : '👤 Pengguna'}
⭐ Karma: ${user.karma}
⚠️ Peringatan: ${user.warning_count}
📅 Bergabung: ${new Date(user.join_date).toLocaleDateString('id-ID')}
🕐 Aktif Terakhir: ${new Date(user.last_activity).toLocaleString('id-ID')}

<i>ID anonim berubah setiap hari untuk menjaga privasi.</i>`,

  userCount: (count) => `👥 <b>Statistik Pengguna</b>\n\nTotal pengguna aktif: <b>${count}</b> orang`,

  broadcastStart: (total) => `📢 Memulai broadcast ke ${total} pengguna...`,
  broadcastComplete: (success, failed) => `✅ Broadcast selesai!\n\n✅ Berhasil: ${success}\n❌ Gagal: ${failed}`,
  
  userBanned: (reason) => `🔨 Pengguna telah dibanned.\nAlasan: ${reason || 'Tidak disebutkan'}`,
  userUnbanned: `✅ Pengguna telah di-unban.`,
  userPromoted: `👑 Pengguna telah diangkat menjadi admin.`,
  userDemoted: `👤 Admin telah diturunkan menjadi pengguna biasa.`,
  
  welcomeSet: `✅ Pesan welcome telah diperbarui.`,
  
  invalidCommand: `❌ Perintah tidak valid. Ketik /help untuk bantuan.`,
  noPermission: `❌ Anda tidak memiliki izin untuk perintah ini.`,
  userNotFound: `❌ Pengguna tidak ditemukan.`,
  
  messageReceived: `✅ Pesan Anda telah dikirim ke semua anggota.`,
  karmaGiven: `⭐ Anda telah memberi karma pada pesan ini.`,
  karmaReceived: `🎉 Seseorang memberi karma pada pesan Anda! (+1)`,
  
  cooldown: (minutes) => `⏰ Anda terkena cooldown selama ${minutes} menit karena spam.`,
  
  pong: `🏓 Pong! Bot berjalan normal.`,
  
  adminPanel: `🎛️ <b>Panel Admin</b>\n\nAkses panel admin web di:\n${process.env.WEBHOOK_URL}/admin\n\n<i>Gunakan ID Telegram Anda untuk login.</i>`
};

// Handler perintah
async function handleStart(msg) {
  const userId = msg.from.id;
  
  // Cek membership channel
  if (!await checkChannelMembership(userId)) {
    return bot.sendMessage(userId, messages.notMember, { parse_mode: 'HTML' });
  }
  
  // Buat atau update user
  await db.createUser(msg.from);
  
  const user = await db.getUser(userId);
  if (user && user.is_banned) {
    return bot.sendMessage(userId, messages.banned, { parse_mode: 'HTML' });
  }
  
  // Kirim pesan welcome
  const welcomeMsg = await db.getSetting('welcome_message') || messages.welcome;
  bot.sendMessage(userId, welcomeMsg, { parse_mode: 'HTML' });
}

async function handleHelp(msg) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || !user.is_active) {
    return bot.sendMessage(userId, messages.notInChat);
  }
  
  let helpText = messages.help;
  
  if (user.is_admin || userId === OWNER_ID) {
    helpText += '\n\n' + messages.adminHelp;
  }
  
  bot.sendMessage(userId, helpText, { parse_mode: 'HTML' });
}

async function handleInfo(msg) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || !user.is_active) {
    return bot.sendMessage(userId, messages.notInChat);
  }
  
  const obfuscatedId = generateObfuscatedId(userId);
  bot.sendMessage(userId, messages.userInfo(user, obfuscatedId), { parse_mode: 'HTML' });
}

async function handleUsers(msg) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || !user.is_active) {
    return bot.sendMessage(userId, messages.notInChat);
  }
  
  const count = await db.getUserCount();
  bot.sendMessage(userId, messages.userCount(count), { parse_mode: 'HTML' });
}

async function handleLeave(msg) {
  const userId = msg.from.id;
  
  // Update user status to inactive
  if (db.type === 'mongodb') {
    await db.User.findOneAndUpdate({ id: userId }, { is_active: false });
  } else {
    const client = await db.pgPool.connect();
    try {
      await client.query('UPDATE users SET is_active = FALSE WHERE id = $1', [userId]);
    } finally {
      client.release();
    }
  }
  
  bot.sendMessage(userId, messages.leftChat);
}

async function handleBan(msg, args) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || (!user.is_admin && userId !== OWNER_ID)) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  if (args.length < 1) {
    return bot.sendMessage(userId, '❌ Format: /ban [user_id] [alasan]');
  }
  
  const targetId = parseInt(args[0]);
  const reason = args.slice(1).join(' ') || 'Tidak disebutkan';
  
  await db.banUser(targetId, reason, userId);
  bot.sendMessage(userId, messages.userBanned(reason));
  
  // Notify target
  try {
    bot.sendMessage(targetId, messages.banned);
  } catch (e) {}
}

async function handleUnban(msg, args) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || (!user.is_admin && userId !== OWNER_ID)) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  if (args.length !== 1) {
    return bot.sendMessage(userId, '❌ Format: /unban [user_id]');
  }
  
  const targetId = parseInt(args[0]);
  await db.unbanUser(targetId);
  bot.sendMessage(userId, messages.userUnbanned);
}

async function handlePromote(msg, args) {
  const userId = msg.from.id;
  
  if (userId !== OWNER_ID) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  if (args.length !== 1) {
    return bot.sendMessage(userId, '❌ Format: /promote [user_id]');
  }
  
  const targetId = parseInt(args[0]);
  await db.promoteUser(targetId);
  bot.sendMessage(userId, messages.userPromoted);
}

async function handleDemote(msg, args) {
  const userId = msg.from.id;
  
  if (userId !== OWNER_ID) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  if (args.length !== 1) {
    return bot.sendMessage(userId, '❌ Format: /demote [user_id]');
  }
  
  const targetId = parseInt(args[0]);
  const result = await db.demoteUser(targetId);
  
  if (result) {
    bot.sendMessage(userId, messages.userDemoted);
  } else {
    bot.sendMessage(userId, '❌ Tidak dapat menurunkan owner atau user tidak ditemukan');
  }
}

async function handleBroadcast(msg, args, delay = 0) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || (!user.is_admin && userId !== OWNER_ID)) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  if (args.length === 0) {
    return bot.sendMessage(userId, '❌ Format: /broadcast [pesan]');
  }
  
  const message = args.join(' ');
  const users = await db.getAllActiveUsers();
  
  // Create broadcast record
  const broadcast = await db.createBroadcast(message, userId, users.length);
  
  bot.sendMessage(userId, messages.broadcastStart(users.length));
  
  let success = 0;
  let failed = 0;
  
  for (const targetUser of users) {
    try {
      await bot.sendMessage(targetUser.id, `📢 <b>Pengumuman:</b>\n\n${escapeHtml(message)}`, { parse_mode: 'HTML' });
      success++;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    } catch (e) {
      failed++;
    }
  }
  
  // Update broadcast stats
  await db.updateBroadcastStats(broadcast.id || broadcast._id, success, failed, 'completed');
  
  bot.sendMessage(userId, messages.broadcastComplete(success, failed));
}

async function handleSetWelcome(msg, args) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || (!user.is_admin && userId !== OWNER_ID)) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  if (args.length === 0) {
    return bot.sendMessage(userId, '❌ Format: /setwelcome [pesan]');
  }
  
  const welcomeMessage = args.join(' ');
  await db.setSetting('welcome_message', welcomeMessage);
  bot.sendMessage(userId, messages.welcomeSet);
}

async function handleStats(msg) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || (!user.is_admin && userId !== OWNER_ID)) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  const stats = await db.getStats();
  
  const statsMessage = `📊 <b>Statistik Bot</b>

👥 Total Pengguna: ${stats.totalUsers}
✅ Pengguna Aktif: ${stats.activeUsers}
🚫 Pengguna Banned: ${stats.bannedUsers}
👑 Admin: ${stats.adminUsers}
💬 Total Pesan: ${stats.totalMessages}
📅 Pesan Hari Ini: ${stats.todayMessages}

🕐 Diperbarui: ${new Date().toLocaleString('id-ID')}`;

  bot.sendMessage(userId, statsMessage, { parse_mode: 'HTML' });
}

async function handleAdminPanel(msg) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || (!user.is_admin && userId !== OWNER_ID)) {
    return bot.sendMessage(userId, messages.noPermission);
  }
  
  bot.sendMessage(userId, messages.adminPanel, { parse_mode: 'HTML' });
}

async function relayMessage(msg) {
  const userId = msg.from.id;
  const user = await db.getUser(userId);
  
  if (!user || !user.is_active || user.is_banned) {
    return;
  }
  
  // Update user activity
  if (db.type === 'mongodb') {
    await db.User.findOneAndUpdate({ id: userId }, { last_activity: new Date() });
  } else {
    const client = await db.pgPool.connect();
    try {
      await client.query('UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
    } finally {
      client.release();
    }
  }
  
  // Relay ke semua user aktif
  const users = await db.getAllActiveUsers();
  const obfuscatedId = generateObfuscatedId(userId);
  
  let relayText = '';
  if (msg.text) {
    relayText = escapeHtml(msg.text);
  } else if (msg.caption) {
    relayText = escapeHtml(msg.caption);
  }
  
  const finalMessage = `👤 <code>${obfuscatedId}</code>: ${relayText}`;
  
  for (const targetUser of users) {
    if (targetUser.id !== userId) {
      try {
        if (msg.text) {
          await bot.sendMessage(targetUser.id, finalMessage, { parse_mode: 'HTML' });
        } else {
          // Handle media messages
          if (msg.photo) {
            await bot.sendPhoto(targetUser.id, msg.photo[msg.photo.length - 1].file_id, {
              caption: finalMessage,
              parse_mode: 'HTML'
            });
          } else if (msg.document) {
            await bot.sendDocument(targetUser.id, msg.document.file_id, {
              caption: finalMessage,
              parse_mode: 'HTML'
            });
          } else if (msg.video) {
            await bot.sendVideo(targetUser.id, msg.video.file_id, {
              caption: finalMessage,
              parse_mode: 'HTML'
            });
          } else if (msg.voice) {
            await bot.sendVoice(targetUser.id, msg.voice.file_id, {
              caption: finalMessage,
              parse_mode: 'HTML'
            });
          } else if (msg.sticker) {
            await bot.sendSticker(targetUser.id, msg.sticker.file_id);
            await bot.sendMessage(targetUser.id, `👤 <code>${obfuscatedId}</code> mengirim sticker`, { parse_mode: 'HTML' });
          }
        }
      } catch (e) {
        console.error(`Failed to send to ${targetUser.id}:`, e.message);
      }
    }
  }
  
  // Konfirmasi ke pengirim
  bot.sendMessage(userId, messages.messageReceived);
}

// Main webhook handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const update = req.body;
    
    if (update.message) {
      const msg = update.message;
      const text = msg.text || '';
      
      // Handle commands
      if (text.startsWith('/')) {
        const [command, ...args] = text.slice(1).split(' ');
        
        switch (command.toLowerCase()) {
          case 'start':
            await handleStart(msg);
            break;
          case 'help':
          case 'bantuan':
            await handleHelp(msg);
            break;
          case 'info':
            await handleInfo(msg);
            break;
          case 'users':
          case 'pengguna':
            await handleUsers(msg);
            break;
          case 'keluar':
          case 'leave':
            await handleLeave(msg);
            break;
          case 'ban':
            await handleBan(msg, args);
            break;
          case 'unban':
            await handleUnban(msg, args);
            break;
          case 'promote':
            await handlePromote(msg, args);
            break;
          case 'demote':
            await handleDemote(msg, args);
            break;
          case 'broadcast':
            await handleBroadcast(msg, args);
            break;
          case 'broadcast_delay':
            const delay = parseInt(args[0]) || 1;
            await handleBroadcast(msg, args.slice(1), delay);
            break;
          case 'setwelcome':
            await handleSetWelcome(msg, args);
            break;
          case 'stats':
            await handleStats(msg);
            break;
          case 'adminpanel':
            await handleAdminPanel(msg);
            break;
          case 'ping':
            await bot.sendMessage(msg.from.id, messages.pong);
            break;
          default:
            await bot.sendMessage(msg.from.id, messages.invalidCommand);
        }
      } else {
        // Relay regular messages
        await relayMessage(msg);
      }
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};