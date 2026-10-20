import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { tambahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanTambahProduk() {
  const supabase = buatKoneksiServer();
  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama")
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Tambah Produk Baru (US-08)</h1>
        <p className="text-sm text-teks-lembut">Lengkapi detail produk untuk ditampilkan di katalog.</p>
      </div>
      <FormProduk
        kategoriList={kategoriList || []}
        action={tambahProduk}
        labelTombol="Simpan produk"
      />
    </div>
  );
}
