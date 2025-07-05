const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const bot = new TelegramBot(BOT_TOKEN);
    
    // Set webhook
    const webhookUrl = `${WEBHOOK_URL}/api/webhook`;
    await bot.setWebHook(webhookUrl);
    
    // Set bot commands
    await bot.setMyCommands([
      { command: 'start', description: 'Mulai menggunakan bot' },
      { command: 'help', description: 'Bantuan dan panduan' },
      { command: 'info', description: 'Informasi akun Anda' },
      { command: 'users', description: 'Jumlah pengguna aktif' },
      { command: 'keluar', description: 'Keluar dari chat' },
      { command: 'ping', description: 'Cek status bot' }
    ]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook dan commands berhasil diatur',
      webhook: webhookUrl
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: error.message });
  }
};