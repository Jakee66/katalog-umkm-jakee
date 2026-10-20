import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const kataKunci = params?.q || "";
  const halaman = parseInt(params?.halaman || "1", 10);
  const perHalaman = 10;
  const offset = (halaman - 1) * perHalaman;

  const supabase = buatKoneksiServer();

  // 1. Ambil Statistik Dashboard Ringkasan (US-30)
  let totalProduk = 0;
  let totalAktif = 0;
  let totalKategori = 0;
  let totalUlasanPending = 0;
  let totalKlikWa = 0;
  let topProduk = [];

  try {
    const { count: countSemua } = await supabase
      .from("produk")
      .select("id", { count: "exact", head: true });
    totalProduk = countSemua || 0;

    const { count: countAktif } = await supabase
      .from("produk")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    totalAktif = countAktif !== null ? countAktif : totalProduk;

    const { count: countKat } = await supabase
      .from("kategori")
      .select("id", { count: "exact", head: true });
    totalKategori = countKat || 0;

    const { count: countUlasan } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    totalUlasanPending = countUlasan || 0;

    const tujuhHariLalu = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: countWa } = await supabase
      .from("wa_clicks")
      .select("id", { count: "exact", head: true })
      .gte("created_at", tujuhHariLalu);
    totalKlikWa = countWa || 0;

    // US-41: Produk terlaris (top 5 berdasarkan klik WA 30 hari terakhir)
    const tigaPuluhHariLalu = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: clicks } = await supabase
      .from("wa_clicks")
      .select("product_id")
      .gte("created_at", tigaPuluhHariLalu);

    if (clicks && clicks.length > 0) {
      const clickMap = {};
      clicks.forEach((c) => {
        if (c.product_id) clickMap[c.product_id] = (clickMap[c.product_id] || 0) + 1;
      });
      const sortedIds = Object.keys(clickMap)
        .sort((a, b) => clickMap[b] - clickMap[a])
        .slice(0, 5);

      if (sortedIds.length > 0) {
        const { data: prodData } = await supabase
          .from("produk")
          .select("id, nama, harga, foto_url")
          .in("id", sortedIds);

        topProduk = (prodData || []).map((p) => ({
          ...p,
          jumlahKlik: clickMap[p.id] || 0,
        }));
      }
    }
  } catch {
    // Fallback jika sebagian tabel belum dibuat
  }

  // 2. Ambil Daftar Produk dengan Pencarian & Paginasi (US-07 & US-33)
  let query = supabase
    .from("produk")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (kataKunci) {
    query = query.ilike("nama", `%${kataKunci}%`);
  }

  query = query.range(offset, offset + perHalaman - 1);

  const { data: produkList, count: totalHasil, error } = await query;
  const daftarProduk = produkList || [];
  const totalItem = totalHasil || daftarProduk.length;
  const totalHalaman = Math.max(1, Math.ceil(totalItem / perHalaman));

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />

      {/* US-30: Dashboard Ringkasan Toko */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-extrabold text-teks">Ringkasan Toko (US-30)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-garis bg-latar p-4 shadow-sm">
            <span className="text-xs font-semibold text-teks-lembut">Total Produk</span>
            <p className="mt-1 text-2xl font-black text-teks">{totalProduk}</p>
            <span className="text-xs text-utama font-medium">({totalAktif} aktif)</span>
          </div>

          <div className="rounded-xl border border-garis bg-latar p-4 shadow-sm">
            <span className="text-xs font-semibold text-teks-lembut">Total Kategori</span>
            <p className="mt-1 text-2xl font-black text-teks">{totalKategori}</p>
            <Link href="/admin/kategori" className="text-xs text-utama underline">
              Kelola kategori
            </Link>
          </div>

          <div className="rounded-xl border border-garis bg-latar p-4 shadow-sm">
            <span className="text-xs font-semibold text-teks-lembut">Ulasan Menunggu</span>
            <p className="mt-1 text-2xl font-black text-teks">{totalUlasanPending}</p>
            <Link href="/admin/ulasan" className="text-xs text-utama underline">
              Moderasi ulasan
            </Link>
          </div>

          <div className="rounded-xl border border-garis bg-latar p-4 shadow-sm">
            <span className="text-xs font-semibold text-teks-lembut">Klik WhatsApp (7hr)</span>
            <p className="mt-1 text-2xl font-black text-harga">{totalKlikWa}</p>
            <span className="text-xs text-teks-lembut">interaksi pembeli</span>
          </div>
        </div>

        {/* US-41: Produk Terlaris di Dashboard */}
        {topProduk.length > 0 && (
          <div className="mt-2 rounded-xl border border-garis bg-permukaan/60 p-4">
            <h3 className="text-sm font-bold text-teks mb-2">🔥 5 Produk Paling Sering Dipesan (30 Hari Terakhir)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {topProduk.map((tp, idx) => (
                <div key={tp.id} className="flex items-center gap-2 rounded-lg bg-latar p-2 border border-garis">
                  <span className="text-xs font-bold text-utama">#{idx + 1}</span>
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate">{tp.nama}</p>
                    <p className="text-[11px] text-teks-lembut">{tp.jumlahKlik}x klik WA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* US-07: List Produk dari Database */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Daftar Produk (US-07)</h1>
            <p className="text-sm text-teks-lembut">Kelola katalog dan urutan tampil produk.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/admin/export-csv"
              className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-3 py-2 text-xs font-semibold text-teks hover:bg-permukaan"
            >
              📥 Ekspor CSV (US-35)
            </a>
            <Tombol href="/admin/produk/impor" varian="garis" className="py-2 text-xs">
              📤 Impor CSV (US-46)
            </Tombol>
            <Tombol href="/admin/produk/baru" className="py-2 text-xs">
              + Tambah Produk (US-08)
            </Tombol>
          </div>
        </div>

        {/* US-33: Cari dan Filter di List Admin */}
        <form method="GET" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={kataKunci}
            placeholder="Cari nama produk..."
            className="w-full max-w-sm rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
          >
            Cari
          </button>
          {kataKunci && (
            <Link
              href="/admin"
              className="rounded-lg border border-garis px-3 py-2 text-sm text-teks-lembut hover:bg-permukaan"
            >
              Reset
            </Link>
          )}
        </form>

        {error && (
          <p className="rounded-xl border border-bahaya/20 bg-bahaya/5 p-4 text-sm text-bahaya">
            Gagal mengambil produk: {error.message}
          </p>
        )}

        <TabelProduk daftarProduk={daftarProduk} />

        {/* US-33: Paginasi List Admin */}
        {totalHalaman > 1 && (
          <div className="flex items-center justify-between border-t border-garis pt-4 text-sm">
            <span className="text-teks-lembut">
              Halaman {halaman} dari {totalHalaman} ({totalItem} produk)
            </span>
            <div className="flex gap-2">
              {halaman > 1 && (
                <Link
                  href={`/admin?q=${encodeURIComponent(kataKunci)}&halaman=${halaman - 1}`}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:bg-permukaan"
                >
                  ← Sebelumnya
                </Link>
              )}
              {halaman < totalHalaman && (
                <Link
                  href={`/admin?q=${encodeURIComponent(kataKunci)}&halaman=${halaman + 1}`}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:bg-permukaan"
                >
                  Berikutnya →
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
