import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = buatKoneksiServer();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama")
    .order("sort_order", { ascending: true });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id);

  const boundUbahProduk = ubahProduk.bind(null, id);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ubah Produk (US-09)</h1>
        <p className="text-sm text-teks-lembut">Perbarui informasi produk: {produk.nama}</p>
      </div>
      <FormProduk
        produk={{ ...produk, variants: variants || [] }}
        kategoriList={kategoriList || []}
        action={boundUbahProduk}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
