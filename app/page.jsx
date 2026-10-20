import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import BannerCarousel from "@/components/BannerCarousel";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const store = await getStoreSettings();
  const supabase = buatKoneksiServer();

  const kataKunci = params?.q || "";
  const kategoriAktif = params?.kategori || "";
  const urutan = params?.urut || "default";
  const halaman = parseInt(params?.hal || "1", 10);
  const perHalaman = 12;
  const offset = (halaman - 1) * perHalaman;

  // 1. Ambil Banner Promo Aktif (US-42)
  let banners = [];
  try {
    const { data: bannerData } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    banners = bannerData || [];
  } catch {
    // Abaikan
  }

  // 2. Ambil Daftar Kategori untuk Filter Tab (US-11)
  let kategoriList = [];
  try {
    const { data: katData } = await supabase
      .from("kategori")
      .select("id, nama, slug")
      .order("sort_order", { ascending: true });
    kategoriList = katData || [];
  } catch {
    // Abaikan
  }

  // 3. Query Produk dengan Filter, Cari, dan Urut (US-11, US-15, US-16, US-32)
  let query = supabase
    .from("produk")
    .select("*", { count: "exact" })
    .neq("is_active", false); // Hanya tampilkan produk aktif (US-32)

  if (kataKunci) {
    query = query.ilike("nama", `%${kataKunci}%`);
  }

  if (kategoriAktif) {
    query = query.eq("kategori", kategoriAktif);
  }

  // US-15: Pengurutan di level query database
  if (urutan === "termurah") {
    query = query.order("harga", { ascending: true });
  } else if (urutan === "termahal") {
    query = query.order("harga", { ascending: false });
  } else if (urutan === "nama-az") {
    query = query.order("nama", { ascending: true });
  } else if (urutan === "terbaru") {
    query = query.order("created_at", { ascending: false });
  } else {
    // Default: berdasarkan sort_order yang diatur admin (US-47)
    query = query.order("sort_order", { ascending: true }).order("id", { ascending: true });
  }

  query = query.range(offset, offset + perHalaman - 1);

  const { data: produkList, count: totalProduk, error } = await query;
  const daftarProduk = produkList || [];
  const totalItem = totalProduk || daftarProduk.length;
  const totalHalaman = Math.max(1, Math.ceil(totalItem / perHalaman));

  const buatUrl = (key, value) => {
    const next = new URLSearchParams();
    if (kataKunci) next.set("q", kataKunci);
    if (kategoriAktif) next.set("kategori", kategoriAktif);
    if (urutan !== "default") next.set("urut", urutan);
    if (halaman > 1) next.set("hal", halaman.toString());

    if (value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const qStr = next.toString();
    return qStr ? `/?${qStr}` : "/";
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Section */}
      <section className="py-8 sm:py-12">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-teks">
          {store.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{store.tagline}</p>
        <p className="mt-2 text-sm text-teks-lembut">{store.jamBuka}</p>
      </section>

      {/* US-42: Banner Promo di Beranda */}
      <BannerCarousel banners={banners} />

      {/* Kontrol Katalog: Cari, Kategori, Urut (US-11 & US-15) */}
      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 id="judul-produk" className="text-2xl font-black text-teks">
            Produk Kami
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Form Pencarian (US-11) */}
            <form method="GET" action="/" className="flex items-center gap-1.5">
              {kategoriAktif && <input type="hidden" name="kategori" value={kategoriAktif} />}
              {urutan !== "default" && <input type="hidden" name="urut" value={urutan} />}
              <input
                type="search"
                name="q"
                defaultValue={kataKunci}
                placeholder="Cari produk..."
                className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none w-44 sm:w-56"
              />
              <button
                type="submit"
                className="rounded-lg bg-utama px-3 py-1.5 text-sm font-semibold text-white hover:bg-utama-gelap"
              >
                Cari
              </button>
            </form>

            {/* Pilihan Urutan (US-15) */}
            <form method="GET" action="/">
              {kataKunci && <input type="hidden" name="q" value={kataKunci} />}
              {kategoriAktif && <input type="hidden" name="kategori" value={kategoriAktif} />}
              <select
                name="urut"
                defaultValue={urutan}
                onChange={(e) => e.target.form.submit()}
                className="rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-sm font-medium text-teks focus:border-utama focus:outline-none cursor-pointer"
              >
                <option value="default">Urutan: Rekomendasi</option>
                <option value="terbaru">Urutan: Terbaru</option>
                <option value="termurah">Urutan: Termurah</option>
                <option value="termahal">Urutan: Termahal</option>
                <option value="nama-az">Urutan: Nama A-Z</option>
              </select>
            </form>
          </div>
        </div>

        {/* Tab Filter Kategori (US-11) */}
        {kategoriList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Link
              href={buatUrl("kategori", "")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                !kategoriAktif
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks-lembut hover:text-utama"
              }`}
            >
              Semua
            </Link>
            {kategoriList.map((k) => (
              <Link
                key={k.id}
                href={buatUrl("kategori", k.nama)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                  kategoriAktif === k.nama
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks-lembut hover:text-utama"
                }`}
              >
                {k.nama}
              </Link>
            ))}
          </div>
        )}

        {/* Daftar Produk Grid */}
        {error ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center">
            <p className="font-semibold text-bahaya">Gagal memuat produk</p>
            <p className="mt-1 text-sm text-teks-lembut">{error.message}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="rounded-2xl border border-garis bg-permukaan/50 p-12 text-center flex flex-col items-center gap-3">
            <span className="text-3xl">🔍</span>
            <p className="font-bold text-teks">Tidak ada produk ditemukan</p>
            <p className="text-sm text-teks-lembut max-w-sm">
              {kataKunci || kategoriAktif
                ? "Coba gunakan kata kunci lain atau pilih kategori berbeda."
                : "Belum ada produk yang tersedia saat ini."}
            </p>
            {(kataKunci || kategoriAktif) && (
              <Link
                href="/"
                className="mt-2 rounded-lg bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap"
              >
                Reset Semua Filter
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}

        {/* Paginasi Katalog (US-16) */}
        {totalHalaman > 1 && (
          <div className="flex items-center justify-between border-t border-garis pt-6 text-sm">
            <span className="text-teks-lembut text-xs sm:text-sm">
              Halaman {halaman} dari {totalHalaman} ({totalItem} produk)
            </span>
            <div className="flex gap-2">
              {halaman > 1 && (
                <Link
                  href={buatUrl("hal", (halaman - 1).toString())}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:bg-permukaan"
                >
                  ← Sebelumnya
                </Link>
              )}
              {halaman < totalHalaman && (
                <Link
                  href={buatUrl("hal", (halaman + 1).toString())}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:bg-permukaan"
                >
                  Berikutnya →
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Widget Terakhir Dilihat (US-36) */}
      <TerakhirDilihat />
    </div>
  );
}
