# Bot Telegram Chat Anonim Indonesia

Bot Telegram untuk chat anonim berbahasa Indonesia yang dapat di-deploy ke Vercel.

## 🚀 Fitur Utama

- **Chat Anonim**: Semua pesan diteruskan tanpa menampilkan identitas pengirim
- **Bahasa Indonesia**: Interface dan pesan dalam bahasa Indonesia
- **Validasi Channel**: Pengguna harus join channel tertentu untuk menggunakan bot
- **Sistem Admin**: Perintah khusus untuk owner dan admin
- **Broadcast**: Kirim pesan ke semua pengguna dengan opsi delay
- **Moderasi**: Ban/unban pengguna, sistem peringatan
- **Database MySQL**: Kompatibel dengan layanan cloud database

## 📋 Persyaratan

1. **Bot Telegram**: Buat bot baru di [@BotFather](https://t.me/BotFather)
2. **Database MySQL**: Gunakan layanan seperti:
   - [PlanetScale](https://planetscale.com/) (Gratis)
   - [Railway](https://railway.app/) (Gratis tier)
   - [Supabase](https://supabase.com/) (Gratis)
3. **Vercel Account**: Untuk hosting bot

## 🛠️ Setup dan Deployment

### 1. Persiapan Bot Telegram

1. Chat [@BotFather](https://t.me/BotFather)
2. Buat bot baru: `/newbot`
3. Ikuti instruksi dan simpan token bot
4. Set privacy mode: `/setprivacy` → `Disable`
5. Allow groups: `/setjoingroups` → `Enable`

### 2. Setup Database

Contoh menggunakan PlanetScale:

1. Daftar di [PlanetScale](https://planetscale.com/)
2. Buat database baru
3. Dapatkan connection string MySQL
4. Format: `mysql://username:password@host:port/database`

### 3. Deploy ke Vercel

1. Fork repository ini
2. Connect ke Vercel
3. Set environment variables:

```bash
BOT_TOKEN=your_bot_token_from_botfather
DATABASE_URL=mysql://user:pass@host:port/db
WEBHOOK_URL=https://your-app.vercel.app
OWNER_ID=your_telegram_user_id
REQUIRED_CHANNEL=your_channel_username
SECRET_SALT=random_32_char_string
```

4. Deploy project

### 4. Setup Webhook

Setelah deploy berhasil, akses:
```
POST https://your-app.vercel.app/api/setup
```

Atau gunakan curl:
```bash
curl -X POST https://your-app.vercel.app/api/setup
```

## 🎯 Perintah Bot

### Pengguna Umum
- `/start` - Mulai menggunakan bot
- `/help` - Bantuan dan panduan
- `/info` - Informasi akun Anda
- `/users` - Jumlah pengguna aktif
- `/keluar` - Keluar dari chat
- `/ping` - Cek status bot

### Admin
- `/ban [user_id] [alasan]` - Ban pengguna
- `/unban [user_id]` - Unban pengguna
- `/admin [user_id]` - Angkat admin (khusus owner)
- `/broadcast [pesan]` - Kirim pesan ke semua
- `/broadcast_delay [detik] [pesan]` - Broadcast dengan jeda
- `/setwelcome [pesan]` - Set pesan welcome

## 📱 Cara Menggunakan

1. **Join Channel**: Pengguna harus join channel yang ditentukan
2. **Start Bot**: Ketik `/start` untuk bergabung
3. **Kirim Pesan**: Semua pesan akan diteruskan secara anonim
4. **ID Anonim**: Setiap pengguna mendapat ID anonim yang berubah harian

## 🔧 Konfigurasi

### Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|---------|
| `BOT_TOKEN` | Token dari @BotFather | `123456:ABC-DEF...` |
| `DATABASE_URL` | URL koneksi MySQL | `mysql://user:pass@host/db` |
| `WEBHOOK_URL` | URL aplikasi Vercel | `https://app.vercel.app` |
| `OWNER_ID` | ID Telegram owner | `123456789` |
| `REQUIRED_CHANNEL` | Channel wajib join | `mychannel` |
| `SECRET_SALT` | Salt untuk enkripsi | `random32chars` |

### Mendapatkan User ID

Untuk mendapatkan Telegram User ID:
1. Chat [@userinfobot](https://t.me/userinfobot)
2. Kirim pesan apapun
3. Bot akan reply dengan info termasuk User ID

## 🛡️ Keamanan

- **ID Anonim**: Berubah setiap hari untuk privasi
- **Validasi Channel**: Cegah spam dengan validasi membership
- **Rate Limiting**: Sistem cooldown untuk mencegah spam
- **Enkripsi ID**: Menggunakan bcrypt dengan salt

## 📊 Database Schema

Bot akan otomatis membuat tabel:

- `users`: Data pengguna dan status
- `messages`: Log pesan (opsional)
- `settings`: Pengaturan bot

## 🚨 Troubleshooting

### Bot tidak merespon
1. Cek webhook: `GET https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Pastikan environment variables benar
3. Cek logs di Vercel dashboard

### Database error
1. Pastikan connection string benar
2. Cek firewall database
3. Verifikasi credentials

### Channel validation gagal
1. Pastikan bot adalah admin di channel
2. Channel harus public atau bot di-invite
3. Username channel tanpa @

## 📄 Lisensi

MIT License - Bebas digunakan dan dimodifikasi.

## 🤝 Kontribusi

Pull requests dan issues sangat diterima!

## 📞 Support

Jika ada pertanyaan atau butuh bantuan setup, buat issue di repository ini.