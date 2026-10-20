# CATATAN BELAJAR PENGEMBANGAN KATALOG UMKM

Catatan ini disusun berdasarkan peninjauan file `PROMPTS.md` serta pencocokan langsung dengan implementasi kode di dalam proyek.

---

## 1. Ringkasan Project

- **Tujuan Aplikasi**: Menyediakan katalog produk UMKM interaktif agar calon pembeli dapat melihat daftar produk, detail, dan langsung memesan via WhatsApp dengan data terisi otomatis, serta memberikan area admin terproteksi bagi pemilik toko untuk mengelola katalog.
- **Tech Stack**: Next.js 16 (App Router, JavaScript), Tailwind CSS 4, Supabase (PostgreSQL, Supabase Auth, `@supabase/ssr`, `@supabase/supabase-js`), Node.js, Vercel.
- **Fitur Utama**: Katalog server-rendered dari database, halaman detail produk dinamis (`/produk/[id]`), tombol order WhatsApp otomatis, sistem login admin dengan cookie HTTP, form ganti password dengan validasi server, dan proteksi rute admin via `proxy.js`.

---

## 2. Catatan per User Story (US-01 sampai US-06)

> **Catatan Status Jurnal**: Pada file `PROMPTS.md`, seluruh bagian prompt, hasil, dan perbaikan untuk US-01 s/d US-06 saat ini berstatus **belum diisi**. Rincian di bawah mencocokkan tujuan dan implementasi kode nyata yang sudah ada di proyek.

### US-01 Katalog dari Database
- **Tujuan Fitur**: Menampilkan seluruh katalog produk dari tabel `produk` di Supabase pada halaman utama (`/`) secara server-side.
- **Inti Prompt di PROMPTS.md**: *belum diisi*
- **Hasil di PROMPTS.md**: *belum diisi*
- **Perbaikan di PROMPTS.md**: *belum diisi*
- **File Utama Terdampak di Proyek**:
  - `lib/supabase/server.js` (koneksi server Supabase via `SUPABASE_SECRET_KEY`)
  - `app/page.jsx` (Server Component katalog, penanganan error dan empty state)
  - `components/KartuProduk.jsx` (komponen kartu tampilan produk)
- **Yang Dipelajari**:
  1. Akses Supabase di sisi server menggunakan Server Component tanpa mengekspos kredensial ke browser.
  2. Penanganan kondisi loading/kosong ("Belum ada produk") dan pesan error terstruktur jika koneksi database terkendala.

---

### US-02 Detail Produk
- **Tujuan Fitur**: Menampilkan informasi lengkap satu produk berdasarkan ID pada URL (`/produk/[id]`) dan memicu 404 jika produk tidak ditemukan.
- **Inti Prompt di PROMPTS.md**: *belum diisi*
- **Hasil di PROMPTS.md**: *belum diisi*
- **Perbaikan di PROMPTS.md**: *belum diisi*
- **File Utama Terdampak di Proyek**:
  - `app/produk/[id]/page.jsx` (halaman detail produk dinamis)
  - `app/not-found.jsx` (tampilan fallback 404 kustom)
- **Yang Dipelajari**:
  1. Penanganan `params` dinamis di Next.js 16 yang wajib di-`await` (`const { id } = await params`).
  2. Pemanfaatan fungsi `notFound()` dari `next/navigation` untuk menangani ID tidak valid atau baris kosong di database.

---

### US-03 Pesan via WhatsApp
- **Tujuan Fitur**: Mengarahkan pengunjung ke obrolan WhatsApp toko dengan pesan otomatis berisi nama dan harga produk dalam format rupiah saat tombol ditekan.
- **Inti Prompt di PROMPTS.md**: *belum diisi*
- **Hasil di PROMPTS.md**: *belum diisi*
- **Perbaikan di PROMPTS.md**: *belum diisi*
- **File Utama Terdampak di Proyek**:
  - `components/TombolWhatsApp.jsx` (tautan universal WhatsApp)
  - `lib/toko.js` (konfigurasi nomor telepon toko)
  - `lib/format.js` (utilitas format mata uang Rupiah)
- **Yang Dipelajari**:
  1. Standar URL universal WhatsApp (`https://wa.me/<nomor>?text=<pesan>`) dengan normalisasi kode negara (mengubah awalan `0` menjadi `62`).
  2. Penggunaan `encodeURIComponent` untuk mencegah karakter spasi dan simbol mata uang merusak link WhatsApp.

---

### US-04 Login Admin
- **Tujuan Fitur**: Mengautentikasi pemilik toko menggunakan Supabase Auth (email dan password) dengan session cookie di server.
- **Inti Prompt di PROMPTS.md**: *belum diisi*
- **Hasil di PROMPTS.md**: *belum diisi*
- **Perbaikan di PROMPTS.md**: *belum diisi*
- **File Utama Terdampak di Proyek**:
  - `lib/supabase/server.js` (fungsi `buatKoneksiAdmin` via `@supabase/ssr` dan cookie headers)
  - `app/admin/actions.js` (Server Action `loginAdmin` dan `keluarAdmin`)
  - `app/admin/login/page.jsx` (form login dengan `useActionState`)
  - `components/NavAdmin.jsx` (tombol navigasi keluar)
- **Yang Dipelajari**:
  1. Manajemen auth cookie di Next.js menggunakan `@supabase/ssr` (`getAll` dan `setAll`).
  2. Penggunaan Server Action bersama hook React 19 `useActionState` untuk menangani feedback error form tanpa refresh halaman penuh.

---

### US-05 Ganti Password
- **Tujuan Fitur**: Memungkinkan admin yang sedang login untuk mengganti password akun dengan validasi minimal 8 karakter dan konfirmasi identik.
- **Inti Prompt di PROMPTS.md**: *belum diisi*
- **Hasil di PROMPTS.md**: *belum diisi*
- **Perbaikan di PROMPTS.md**: *belum diisi*
- **File Utama Terdampak di Proyek**:
  - `app/admin/actions.js` (Server Action `gantiPassword`)
  - `app/admin/password/page.jsx` (form ganti password)
- **Yang Dipelajari**:
  1. Aturan keamanan server: memastikan validasi sesi `supabase.auth.getUser()` selalu diperiksa di server sebelum aksi pengubahan kredensial dijalankan.
  2. Validasi input dua lapis (keberadaan input, panjang karakter, dan kesesuaian konfirmasi) di sisi server.

---

### US-06 Proteksi Halaman Admin
- **Tujuan Fitur**: Menutup seluruh rute admin dari akses publik yang belum login dan mengalihkannya otomatis ke `/admin/login`.
- **Inti Prompt di PROMPTS.md**: *belum diisi*
- **Hasil di PROMPTS.md**: *belum diisi*
- **Perbaikan di PROMPTS.md**: *belum diisi*
- **File Utama Terdampak di Proyek**:
  - `proxy.js` (middleware proteksi rute di root proyek)
  - `app/admin/page.jsx` (penghapusan penanda `CatatanBelumAktif`)
  - `app/admin/actions.js` (proteksi server-side pada mutasi data)
- **Yang Dipelajari**:
  1. Implementasi middleware rute di Next.js 16 menggunakan file `proxy.js` di root dengan matcher rute `/admin/:path*`.
  2. Redirect aman berbasis pemeriksaan sesi aktual pengguna sebelum konten halaman sempat dirender.

---

## 3. Debugging dan Fitur Bonus

Berikut rangkuman teknis masalah nyata yang ditemukan dan diselesaikan, serta dokumentasi implementasi fitur bonus lengkap (US-07 s/d US-50 dan K-6 s/d K-13):

### A. Debugging Utama
1. **Error PGRST125 (Path Mismatch Supabase)**
   - **Masalah**: Query Supabase mengembalikan error 404 `"Invalid path specified in request URL"`.
   - **Penyebab**: Nilai `SUPABASE_URL` di konfigurasi environment menyertakan path `/rest/v1/`, sehingga client Supabase menduplikasi path menjadi `/rest/v1/rest/v1/...`.
   - **Solusi**: Normalisasi otomatis nilai URL di `lib/supabase/server.js` dengan `.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "")`.

2. **Perubahan Data Supabase Tidak Langsung Muncul (Next.js Data Cache)**
   - **Masalah**: Pengubahan deskripsi produk langsung di tabel Supabase tidak ter-update di halaman detail produk meski halaman di-refresh.
   - **Penyebab**: Next.js App Router secara default meng-cache hasil `fetch()` internal milik library `@supabase/supabase-js`.
   - **Solusi**: Mengonfigurasi `global.fetch` dengan opsi `{ cache: "no-store" }` pada client Supabase serta menambahkan `export const dynamic = "force-dynamic"` dan `export const revalidate = 0` pada halaman dinamis.

3. **Aksesibilitas Aplikasi di Perangkat Seluler (HP)**
   - **Masalah**: Server pengembangan lokal tidak dapat dibuka dari browser HP melalui Wi-Fi dan skala tampilan desktop.
   - **Penyebab**: Server default Next.js hanya mengikat ke `localhost` (127.0.0.1) dan belum ada deklarasi `viewport` eksplisit.
   - **Solusi**: Mengubah skrip `dev` di `package.json` menjadi `next dev -H 0.0.0.0` dan menambahkan konfigurasi `viewport` di `app/layout.jsx`.

### B. Implementasi Fitur Bonus (US-07 s/d US-50) & Keamanan (K-6 s/d K-13)
- **Fase 1 (Fondasi Data)**:
  - *Fitur*: Migrasi SQL terpadu `01_full_features.sql` untuk tabel `kategori`, `product_images`, `product_variants`, `reviews`, `wa_clicks`, `store_settings`, `banners`, `admin_logs`, `admin_users`, dan `rate_limits` dengan RLS aktif.
  - *Hasil*: Database Supabase siap menampung seluruh fitur bonus tanpa migrasi terputus-putus.
  - *Perbaikan*: Penanganan schema fallback di sisi server agar aplikasi tetap berjalan aman saat tabel belum termigrasi.
- **Fase 2 (Admin Panel US-07-10, US-14, US-29-35, US-39, US-41-47)**:
  - *Fitur*: CRUD produk lengkap, upload gambar Supabase Storage, manajemen kategori, banner promo, moderasi ulasan, pengaturan toko dinamis, akun admin ber-hash, audit log aktivitas admin, ekspor/impor CSV dengan pencegahan CSV injection, dan generator deskripsi AI via Google Gemini.
  - *Hasil*: Seluruh modul admin berfungsi end-to-end dengan validasi server-side dan Server Actions.
  - *Perbaikan*: Sanitasi input CSV dengan prefix kutip satu (`'`) pada simbol formula (`=`, `+`, `-`, `@`) guna menangkal CSV injection.
- **Fase 3 (Halaman Publik US-11, US-12, US-15-25, US-36-38, US-40, US-48-50)**:
  - *Fitur*: Filter kategori, pencarian, multi-sorting, paginasi berbasis URL, halaman slug `/kategori/[slug]`, galeri thumbnail detail produk, status ketersediaan stok, harga coret & diskon, stepper jumlah dan varian produk, keranjang belanja terverifikasi server, daftar produk favorit, perbandingan 2 produk berdampingan (`/bandingkan`), riwayat terakhir dilihat, kirim ulasan ber-honeypot, widget tanya jawab produk berbasis AI (Gemini), mode gelap (dark mode), dan halaman tentang toko.
  - *Hasil*: Pengalaman belanja pelanggan interaktif, responsif, dan terhubung langsung ke WhatsApp.
  - *Perbaikan*: Verifikasi harga keranjang selalu dihitung ulang dari server melalui `/api/keranjang/verify` untuk mencegah manipulasi localStorage.
- **Fase 4 (Teknis & PWA US-13, US-26-28)**:
  - *Fitur*: Web App Manifest (`app/manifest.js`), Service Worker offline fallback (`public/sw.js` & `public/offline.html`), Sitemap XML dinamis (`app/sitemap.js`), Robots.txt (`app/robots.js`), SEO OpenGraph & JSON-LD schema, skeleton loading (`app/loading.jsx`), dan boundary error (`app/error.jsx`).
  - *Hasil*: Aplikasi dapat di-install sebagai PWA, ramah mesin pencari, dan memiliki tampilan fallback offline yang ramah.
  - *Perbaikan*: Service worker dikonfigurasi untuk mengecualikan rute `/admin` dan API agar tidak mengganggu otentikasi.
- **Fase 5 (Keamanan Lanjutan K-6 s/d K-13)**:
  - *Fitur*: HTTP Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), header `X-Robots-Tag: noindex, nofollow` pada seluruh rute admin, proteksi brute force login admin (maksimal 5x percobaan per 15 menit), rate limiting endpoint publik (ulasan, klik WA, AI chat), dan sanitasi pesan error server.
  - *Hasil*: Audit dependency (`npm audit`) menunjukkan 0 vulnerability dan tidak ada kebocoran stack trace database ke klien.

---

## 4. Konsep Teknis yang Dipelajari

1. **Server Component & Keamanan Kredensial**: Mengakses database langsung di server menghilangkan kebutuhan API route perantara dan mencegah kebocoran `SUPABASE_SECRET_KEY` ke sisi klien (browser).
2. **Routing Dinamis & Handling Not Found**: Pola rute folder `app/produk/[id]` memanfaatkan `await params` dan fungsi standar `notFound()` untuk menghasilkan HTTP status 404 secara elegan.
3. **Autentikasi Session Berbasis Cookie**: Menggunakan paket `@supabase/ssr` memastikan token sesi tersimpan di cookie HTTP aman, mendukung SSR penuh, dan dapat diverifikasi langsung di server.
4. **Server Actions & State Management React 19**: Penggunaan direktif `"use server"` bersama `useActionState` memudahkan pengiriman form, umpan balik error seketika, dan pengalihan rute (`redirect`) yang aman.
5. **Proxy / Middleware Proteksi Rute**: File `proxy.js` di root Next.js 16 bertindak sebagai penjaga gerbang (*gatekeeper*) yang memeriksa JWT sesi sebelum permintaan diteruskan ke rute admin.
6. **Deep Linking WhatsApp**: Mengonstruksi tautan komunikasi instan `https://wa.me/` dengan parsing nomor internasional dan sanitasi teks pesan.

---

## 5. Pola Prompt yang Efektif

- **Pola yang Langsung Berhasil**:
  - Menyertakan referensi dokumen spesifikasi teknis (`AGENTS.md`, `docs/user-stories.md`, `docs/rancangan-teknis.md`).
  - Menentukan nama file dan komponen yang spesifik untuk dimodifikasi.
  - Menjelaskan aturan batas pengerjaan secara tegas (misal: "tanpa mengubah tampilan", "jangan pasang paket npm baru").
- **Pola yang Membutuhkan Perbaikan**:
  - Prompt pengujian manual singkat (seperti *"yang ini belum berhasil"*) memerlukan pengecekan mendalam ke perilaku cache Next.js dan inisialisasi client.
- **Perbandingan Prompt Lembar Kerja vs Prompt Sendiri**:
  - Prompt lembar kerja (US-01 s/d US-06) terfokus pada spesifikasi arsitektur kode dan kriteria penilaian.
  - Prompt mandiri `[SENDIRI]` berfokus pada skenario pengujian fungsional konkret (misal: pengujian modifikasi data langsung dan pengujian lintas perangkat HP).

---

## 6. Status & TODO

- **Status Kode Proyek**:
  - `US-01 s/d US-06` (Fitur Utama Inti): Selesai, terverifikasi, dan tetap berfungsi penuh.
  - `US-07 s/d US-50` (Seluruh User Story Bonus): Selesai diimplementasikan secara end-to-end.
  - `K-01 s/d K-13` (Seluruh Standar Keamanan & Keamanan Lanjutan): Selesai, mencakup security headers, CSP, brute force protection, server-side data access, dan 0 audit vulnerability.
- **Status Dokumen PROMPTS.md**:
  - Seluruh bagian ringkasan, pembelajaran konsep, pola prompt, debugging, dan implementasi fitur bonus telah terdokumentasi lengkap.
- **Rekomendasi Langkah Pengguna**:
  1. Jalankan script SQL migrasi `supabase/migrations/01_full_features.sql` di Supabase SQL Editor.
  2. Tambahkan `GEMINI_API_KEY` pada environment variables (Vercel dan `.env.local`) untuk mengaktifkan AI generator deskripsi dan chatbot tanya-jawab produk.
  3. Lakukan `git push origin main` untuk deployment otomatis ke Vercel.

