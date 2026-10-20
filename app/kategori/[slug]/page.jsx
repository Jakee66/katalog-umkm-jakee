import { notFound } from "next/navigation";
import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { buatKoneksiServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = buatKoneksiServer();
  const { data: kat } = await supabase
    .from("kategori")
    .select("nama")
    .eq("slug", slug)
    .maybeSingle();

  return {
    title: kat ? `Kategori: ${kat.nama}` : "Kategori Produk",
    description: `Daftar produk kategori ${kat?.nama || ""} di katalog toko.`,
  };
}

export default async function HalamanPerKategori({ params }) {
  const { slug } = await params;
  const supabase = buatKoneksiServer();

  // Cari kategori berdasarkan slug
  const { data: kategori, error: katErr } = await supabase
    .from("kategori")
    .select("id, nama, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (katErr || !kategori) {
    notFound();
  }

  // Ambil produk aktif kategori ini
  const { data: produkList } = await supabase
    .from("produk")
    .select("*")
    .or(`kategori.eq.${kategori.nama},category_id.eq.${kategori.id}`)
    .neq("is_active", false)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  const daftarProduk = produkList || [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <nav className="flex items-center gap-2 text-xs text-teks-lembut">
        <Link href="/" className="hover:text-utama">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-teks">Kategori: {kategori.nama}</span>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold text-teks">{kategori.nama}</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Menampilkan {daftarProduk.length} produk pilihan dalam kategori ini.
        </p>
      </div>

      {daftarProduk.length === 0 ? (
        <div className="rounded-2xl border border-garis bg-permukaan/50 p-12 text-center flex flex-col items-center gap-3">
          <p className="font-bold text-teks">Belum ada produk di kategori ini</p>
          <Link
            href="/"
            className="rounded-lg bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap"
          >
            Kembali ke Katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {daftarProduk.map((p) => (
            <KartuProduk key={p.id} produk={p} />
          ))}
        </div>
      )}
    </div>
  );
}
