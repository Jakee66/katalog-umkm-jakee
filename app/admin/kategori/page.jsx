import NavAdmin from "@/components/NavAdmin";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { KategoriList, FormTambahKategori } from "./KategoriClient";

export const dynamic = "force-dynamic";

export default async function HalamanKategori() {
  const supabase = buatKoneksiServer();
  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama, slug, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola Kategori (US-31)</h1>
        <p className="text-sm text-teks-lembut">Tambah, ubah, atau hapus kategori produk.</p>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Tambah Kategori Baru</h2>
        <FormTambahKategori />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Daftar Kategori</h2>
        <KategoriList kategoriList={kategoriList || []} />
      </section>
    </div>
  );
}

