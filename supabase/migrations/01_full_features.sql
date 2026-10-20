-- ==============================================================================
-- FASE 1: FONDASI DATA - SKEMA LENGKAP SEMUA FITUR (US-07 SAMPAI US-50 & K-12)
-- Aman dijalankan ulang (idempotent: if not exists / or replace).
-- Cara pakai: Salin ke Supabase Dashboard > SQL Editor > New query > Run.
-- ==============================================================================

-- 1. Tabel Kategori Produk (US-31, US-11, US-49)
create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Penyesuaian Tabel Produk (US-07 s/d US-50)
-- Tambahkan kolom pendukung fitur baru jika belum ada
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'category_id') then
    alter table public.produk add column category_id bigint references public.kategori(id) on delete set null;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'slug') then
    alter table public.produk add column slug text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'is_active') then
    alter table public.produk add column is_active boolean not null default true;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'sort_order') then
    alter table public.produk add column sort_order integer not null default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'stock_status') then
    alter table public.produk add column stock_status text not null default 'tersedia' check (stock_status in ('tersedia', 'terbatas', 'habis'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'harga_coret') then
    alter table public.produk add column harga_coret integer check (harga_coret is null or harga_coret >= 0);
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'produk' and column_name = 'badge') then
    alter table public.produk add column badge text check (badge in ('Baru', 'Promo', 'Terlaris', null));
  end if;
end $$;

-- 3. Galeri Foto Produk (US-18, US-29)
create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.produk(id) on delete cascade,
  foto_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Varian Produk (US-12, US-48)
create table if not exists public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  harga integer not null check (harga >= 0),
  stok integer not null default 0 check (stok >= 0),
  created_at timestamptz not null default now()
);

-- 5. Ulasan dan Rating Produk (US-38, US-39)
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  komentar text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- 6. Pencatatan Klik WhatsApp (US-40, US-41)
create table if not exists public.wa_clicks (
  id bigint generated always as identity primary key,
  product_id bigint references public.produk(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7. Pengaturan Toko (US-43)
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  nama_toko text not null,
  tagline text,
  no_wa text not null,
  alamat text,
  jam_buka text,
  instagram text,
  facebook text,
  template_pesan_wa text,
  updated_at timestamptz not null default now()
);

-- 8. Banner Promo (US-42)
create table if not exists public.banners (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text,
  gambar_url text not null,
  tautan text,
  is_active boolean not null default true,
  tgl_mulai timestamptz,
  tgl_selesai timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 9. Log Aktivitas Admin (US-45)
create table if not exists public.admin_logs (
  id bigint generated always as identity primary key,
  admin_id text,
  admin_email text,
  aksi text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- 10. Pengelolaan Akun Admin Internal (US-44)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  nama text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 11. Rate Limiting Terdistribusi (K-12)
create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  key text not null,
  count integer not null default 1,
  reset_at timestamptz not null
);
create index if not exists idx_rate_limits_key on public.rate_limits(key);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.kategori enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.wa_clicks enable row level security;
alter table public.store_settings enable row level security;
alter table public.banners enable row level security;
alter table public.admin_logs enable row level security;
alter table public.admin_users enable row level security;
alter table public.rate_limits enable row level security;

-- Policy Publik (Baca data yang diizinkan)
drop policy if exists "publik_baca_kategori" on public.kategori;
create policy "publik_baca_kategori" on public.kategori for select using (true);

drop policy if exists "publik_baca_product_images" on public.product_images;
create policy "publik_baca_product_images" on public.product_images for select using (true);

drop policy if exists "publik_baca_product_variants" on public.product_variants;
create policy "publik_baca_product_variants" on public.product_variants for select using (true);

drop policy if exists "publik_baca_reviews_approved" on public.reviews;
create policy "publik_baca_reviews_approved" on public.reviews for select using (status = 'approved');

drop policy if exists "publik_tambah_reviews" on public.reviews;
create policy "publik_tambah_reviews" on public.reviews for insert with check (status = 'pending');

drop policy if exists "publik_tambah_wa_clicks" on public.wa_clicks;
create policy "publik_tambah_wa_clicks" on public.wa_clicks for insert with check (true);

drop policy if exists "publik_baca_store_settings" on public.store_settings;
create policy "publik_baca_store_settings" on public.store_settings for select using (true);

drop policy if exists "publik_baca_banners_active" on public.banners;
create policy "publik_baca_banners_active" on public.banners for select using (is_active = true);

-- Policy Admin Authenticated (Akses penuh untuk data toko)
drop policy if exists "admin_all_kategori" on public.kategori;
create policy "admin_all_kategori" on public.kategori for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_product_images" on public.product_images;
create policy "admin_all_product_images" on public.product_images for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_product_variants" on public.product_variants;
create policy "admin_all_product_variants" on public.product_variants for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_reviews" on public.reviews;
create policy "admin_all_reviews" on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_wa_clicks" on public.wa_clicks;
create policy "admin_all_wa_clicks" on public.wa_clicks for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_store_settings" on public.store_settings;
create policy "admin_all_store_settings" on public.store_settings for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_banners" on public.banners;
create policy "admin_all_banners" on public.banners for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_logs" on public.admin_logs;
create policy "admin_all_logs" on public.admin_logs for all to authenticated using (true) with check (true);

drop policy if exists "admin_all_users" on public.admin_users;
create policy "admin_all_users" on public.admin_users for all to authenticated using (true) with check (true);

-- ==============================================================================
-- SEED DATA AWAL
-- ==============================================================================

-- 1. Seed Kategori dari kategori produk yang ada
insert into public.kategori (nama, slug, sort_order)
values
  ('Minuman', 'minuman', 1),
  ('Camilan', 'camilan', 2),
  ('Bumbu', 'bumbu', 3),
  ('Kue kering', 'kue-kering', 4),
  ('Kerajinan', 'kerajinan', 5),
  ('Kain', 'kain', 6)
on conflict (nama) do nothing;

-- Hubungkan category_id dan slug pada produk lama jika belum terisi
update public.produk p
set
  category_id = k.id,
  slug = lower(regexp_replace(regexp_replace(p.nama, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || p.id,
  sort_order = coalesce(p.sort_order, p.id::int)
from public.kategori k
where p.kategori = k.nama and (p.category_id is null or p.slug is null);

-- 2. Seed Pengaturan Toko Awal
insert into public.store_settings (id, nama_toko, tagline, no_wa, alamat, jam_buka, instagram, facebook, template_pesan_wa)
values (
  1,
  'Toko bangkrut',
  'Produk rumahan dari dapur dan perajin lokal, siap dipesan lewat WhatsApp.',
  '088899221',
  'Jl. Contoh No. 1, Kota Anda',
  'Setiap hari, 08.00–20.00',
  '@tokobangkrut',
  'Toko Bangkrut Official',
  'Halo, saya ingin memesan {nama_produk} seharga {harga_produk}. Apakah masih tersedia?'
)
on conflict (id) do nothing;

-- 3. Seed Banner Contoh
insert into public.banners (judul, teks, gambar_url, tautan, is_active, sort_order)
values (
  'Diskon Spesial UMKM Lokal!',
  'Dapatkan potongan harga spesial untuk pembelian produk pilihan hari ini.',
  '/produk/kopi.svg',
  '/#judul-produk',
  true,
  1
)
on conflict do nothing;

-- 4. Supabase Storage Bucket 'produk' (US-29)
-- Buka Dashboard Supabase > Storage > New bucket: nama "produk" (Public bucket).

