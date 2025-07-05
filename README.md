# Bot Telegram Chat Anonim Indonesia v3.0

Bot Telegram untuk chat anonim berbahasa Indonesia dengan UI admin panel yang modern dan database MongoDB/PostgreSQL.

## 🚀 Fitur Utama

### Bot Features
- **Chat Anonim**: Semua pesan diteruskan tanpa menampilkan identitas pengirim
- **Multi Database**: Support MongoDB dan PostgreSQL
- **Validasi Channel**: Pengguna harus join channel tertentu untuk menggunakan bot
- **Sistem Admin**: Perintah khusus untuk owner dan admin
- **Broadcast**: Kirim pesan ke semua pengguna dengan opsi delay
- **Moderasi**: Ban/unban pengguna, sistem peringatan
- **UI Admin Panel**: Interface web modern untuk mengelola bot

### Admin Panel Features
- **Dashboard**: Statistik real-time dengan grafik
- **User Management**: Kelola pengguna, ban/unban, promote/demote
- **Broadcast System**: Kirim pesan massal dengan antarmuka yang mudah
- **Settings**: Konfigurasi bot dan pesan welcome
- **Responsive Design**: Optimized untuk desktop dan mobile

## 📋 Persyaratan

1. **Bot Telegram**: Buat bot baru di [@BotFather](https://t.me/BotFather)
2. **Database**: Pilih salah satu:
   - [MongoDB Atlas](https://www.mongodb.com/atlas) (Gratis)
   - [Supabase PostgreSQL](https://supabase.com/) (Gratis)
   - [Railway PostgreSQL](https://railway.app/) (Gratis tier)
3. **Vercel Account**: Untuk hosting bot dan admin panel

## 🛠️ Setup dan Deployment

### 1. Persiapan Bot Telegram

1. Chat [@BotFather](https://t.me/BotFather)
2. Buat bot baru: `/newbot`
3. Ikuti instruksi dan simpan token bot
4. Set privacy mode: `/setprivacy` → `Disable`
5. Allow groups: `/setjoingroups` → `Enable`

### 2. Setup Database

#### MongoDB Atlas (Recommended)
1. Daftar di [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Buat cluster baru (pilih free tier)
3. Buat database user dan password
4. Whitelist IP address (0.0.0.0/0 untuk semua IP)
5. Dapatkan connection string

#### PostgreSQL (Supabase)
1. Daftar di [Supabase](https://supabase.com/)
2. Buat project baru
3. Dapatkan database URL dari Settings → Database

### 3. Deploy ke Vercel

1. Fork repository ini
2. Connect ke Vercel
3. Set environment variables:

```bash
# Bot Configuration
BOT_TOKEN=your_bot_token_from_botfather
WEBHOOK_URL=https://your-app.vercel.app
OWNER_ID=your_telegram_user_id
REQUIRED_CHANNEL=your_channel_username
SECRET_SALT=random_32_char_string

# Database Configuration
DATABASE_TYPE=mongodb
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret for Admin Panel
JWT_SECRET=your_jwt_secret_here

# Next.js Configuration
NEXT_PUBLIC_DATABASE_TYPE=mongodb
NEXT_PUBLIC_OWNER_ID=your_telegram_user_id
```

4. Deploy project

### 4. Setup Webhook

Setelah deploy berhasil, akses:
```
POST https://your-app.vercel.app/api/setup
```

## 🎯 Perintah Bot

### Pengguna Umum
- `/start` - Mulai menggunakan bot
- `/help` - Bantuan dan panduan
- `/info` - Informasi akun Anda
- `/users` - Jumlah pengguna aktif
- `/keluar` - Keluar dari chat
- `/ping` - Cek status bot

### Owner/Admin
- `/ban [user_id] [alasan]` - Ban pengguna
- `/unban [user_id]` - Unban pengguna
- `/promote [user_id]` - Angkat admin (khusus owner)
- `/demote [user_id]` - Turunkan admin (khusus owner)
- `/broadcast [pesan]` - Kirim pesan ke semua
- `/broadcast_delay [detik] [pesan]` - Broadcast dengan jeda
- `/setwelcome [pesan]` - Set pesan welcome
- `/stats` - Statistik lengkap bot
- `/adminpanel` - Akses panel admin web

## 🎛️ Admin Panel

Akses admin panel di: `https://your-app.vercel.app/admin`

### Login
- Masukkan Telegram ID Anda
- Hanya owner dan admin yang dapat mengakses

### Features
1. **Dashboard**: Lihat statistik real-time
2. **User Management**: Kelola semua pengguna
3. **Broadcast**: Kirim pesan massal
4. **Settings**: Konfigurasi bot

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
| `DATABASE_TYPE` | Jenis database | `mongodb` atau `postgresql` |
| `DATABASE_URL` | URL koneksi database | `mongodb+srv://...` |
| `WEBHOOK_URL` | URL aplikasi Vercel | `https://app.vercel.app` |
| `OWNER_ID` | ID Telegram owner | `123456789` |
| `REQUIRED_CHANNEL` | Channel wajib join | `mychannel` |
| `SECRET_SALT` | Salt untuk enkripsi | `random32chars` |
| `JWT_SECRET` | Secret untuk admin panel | `jwt_secret_key` |

### Mendapatkan User ID

Untuk mendapatkan Telegram User ID:
1. Chat [@userinfobot](https://t.me/userinfobot)
2. Kirim pesan apapun
3. Bot akan reply dengan info termasuk User ID

## 🛡️ Keamanan

- **ID Anonim**: Berubah setiap hari untuk privasi
- **Validasi Channel**: Cegah spam dengan validasi membership
- **JWT Authentication**: Secure admin panel access
- **Rate Limiting**: Sistem cooldown untuk mencegah spam
- **Enkripsi ID**: Menggunakan bcrypt dengan salt

## 📊 Database Schema

### MongoDB Collections / PostgreSQL Tables

#### Users
- `id`: Telegram user ID
- `username`: Username Telegram
- `first_name`: Nama depan
- `last_name`: Nama belakang
- `is_active`: Status aktif
- `is_banned`: Status banned
- `is_admin`: Status admin
- `join_date`: Tanggal bergabung
- `last_activity`: Aktivitas terakhir
- `warning_count`: Jumlah peringatan
- `karma`: Poin karma
- `ban_reason`: Alasan ban
- `banned_by`: ID yang melakukan ban
- `banned_at`: Waktu ban

#### Messages
- `user_id`: ID pengguna
- `message_id`: ID pesan Telegram
- `content`: Isi pesan
- `message_type`: Jenis pesan
- `created_at`: Waktu dibuat

#### Settings
- `key_name`: Nama setting
- `value`: Nilai setting
- `updated_at`: Waktu update

#### Broadcasts
- `message`: Isi broadcast
- `sent_by`: ID pengirim
- `sent_at`: Waktu kirim
- `total_users`: Total penerima
- `success_count`: Jumlah berhasil
- `failed_count`: Jumlah gagal
- `status`: Status broadcast

## 🚨 Troubleshooting

### Bot tidak merespon
1. Cek webhook: `GET https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Pastikan environment variables benar
3. Cek logs di Vercel dashboard

### Database error
1. Pastikan connection string benar
2. Cek firewall database
3. Verifikasi credentials

### Admin panel tidak bisa login
1. Pastikan JWT_SECRET sudah diset
2. Cek apakah user adalah admin/owner
3. Verifikasi Telegram ID

### Channel validation gagal
1. Pastikan bot adalah admin di channel
2. Channel harus public atau bot di-invite
3. Username channel tanpa @

## 🔄 Migration dari v2.0

Jika Anda mengupgrade dari versi sebelumnya:

1. Backup data lama
2. Update environment variables
3. Deploy versi baru
4. Jalankan migration script (jika diperlukan)

## 📈 Performance

- **Database**: Optimized queries dengan indexing
- **Caching**: Redis untuk session management (opsional)
- **Rate Limiting**: Built-in spam protection
- **Scalability**: Horizontal scaling ready

## 🤝 Kontribusi

Pull requests dan issues sangat diterima!

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` ke `.env.local`
4. Set environment variables
5. Run development server: `npm run dev`

## 📄 Lisensi

MIT License - Bebas digunakan dan dimodifikasi.

## 📞 Support

Jika ada pertanyaan atau butuh bantuan setup:
- Buat issue di repository ini
- Contact: [Your Contact Info]

## 🎉 Changelog

### v3.0.0
- ✨ Added modern admin panel UI
- ✨ MongoDB and PostgreSQL support
- ✨ Real-time statistics dashboard
- ✨ Enhanced user management
- ✨ Improved broadcast system
- ✨ JWT authentication for admin panel
- 🔧 Better error handling
- 🔧 Performance optimizations
- 🔧 Mobile-responsive design

### v2.0.0
- Basic admin commands
- MySQL database support
- Simple webhook system

---

**Made with ❤️ for Indonesian Telegram community**