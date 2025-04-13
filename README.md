# Taplink SIJAGO Affiliate App

Aplikasi web responsif yang berfungsi sebagai portal daftar produk affiliate bagi customer untuk melihat katalog produk dan diizinkan ke link affiliate produk yang diinginkan.

## Fitur Utama

- Tampilan responsif untuk mobile dan desktop
- Katalog produk dengan berbagai kategori (Beauty, Fashion, Electronics, dll)
- Filtering produk berdasarkan kategori dan kriteria lainnya
- Menampilkan produk viral, hot, dan top rated
- Detail produk dengan informasi komisi
- Redirecting ke link affiliate ketika produk di-klik

## Teknologi yang Digunakan

- **Backend**: Node.js, Express.js
- **Database**: MongoDB dengan Mongoose ODM
- **Frontend**: EJS (Embedded JavaScript), CSS3, JavaScript
- **Arsitektur**: MVVC (Model-View-View-Controller)

## Struktur Project

```
taplink-affiliate-app/
│
├── config/           # Konfigurasi aplikasi dan database
├── controllers/      # Controller untuk logika bisnis
├── models/           # Model data dan schema
├── views/            # Template EJS untuk UI
├── public/           # Asset statis (CSS, JS, gambar)
├── routes/           # Definisi rute aplikasi
├── services/         # Business logic layer
├── utils/            # Fungsi helper
├── middlewares/      # Middleware Express
├── seed/             # Seed script untuk data dummy
│
├── app.js            # Entry point aplikasi
├── .env              # Environment variables
└── package.json      # Dependensi dan script
```

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js (versi 14 atau lebih baru)
- MongoDB (lokal atau cloud)

### Langkah-Langkah Instalasi

1. Clone repository ini:
   ```bash
   git clone https://github.com/username/taplink-affiliate-app.git
   cd taplink-affiliate-app
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Salin file `.env.example` ke `.env` dan sesuaikan konfigurasinya:
   ```bash
   cp .env.example .env
   ```

4. Sesuaikan konfigurasi database di file `.env`

5. Buat direktori gambar untuk produk:
   ```bash
   mkdir -p public/images/products
   ```

6. **Jalankan seed script untuk membuat data dummy dan user admin default**:
   ```bash
   npm run setup
   ```
   
   Atau jalankan secara terpisah:
   ```bash
   # Untuk membuat data produk dan kategori
   npm run seed
   
   # Untuk membuat user admin default
   npm run seed:admin
   ```

7. **Jalankan aplikasi**:
   ```bash
   npm start
   ```
   
   Untuk development dengan auto-reload:
   ```bash
   npm run dev
   ```

8. **Buka browser dan akses `http://localhost:3000`**

9. **Login sebagai admin**:
   - Username: admin
   - Password: admin123
   - URL: `http://localhost:3000/auth/login`

## Konfigurasi Deployment

### Untuk Production

1. Sesuaikan file `.env` untuk environment production:
   ```
   NODE_ENV=production
   PORT=80
   MONGO_URI=mongodb://your-production-mongodb-uri
   SESSION_SECRET=your-strong-session-secret
   AFFILIATE_BASE_URL=https://your-affiliate-base-url.com/redirect
   ```

2. Build dan jalankan aplikasi:
   ```bash
   npm run build
   npm start
   ```


## Fitur Utama

- Tampilan responsif untuk mobile dan desktop
- Katalog produk dengan berbagai kategori (Beauty, Fashion, Electronics, dll)
- Filtering produk berdasarkan kategori dan kriteria lainnya
- Menampilkan produk viral, hot, dan top rated
- Detail produk dengan informasi komisi
- Redirecting ke link affiliate ketika produk di-klik
- Sistem autentikasi untuk user dan admin
- Dashboard admin untuk mengelola produk, kategori, dan pengguna

## Pengembangan Selanjutnya

- Implementasi sistem autentikasi untuk admin dan user
- Dashboard admin untuk mengelola produk dan kategori
- Sistem analitik untuk melacak klik dan konversi
- Notifikasi untuk produk baru dan promo
- Integrasi dengan API affiliate marketplace

## Lisensi

[MIT License](LICENSE)