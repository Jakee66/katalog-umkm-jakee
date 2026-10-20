import NavAdmin from "@/components/NavAdmin";
import { buatKoneksiServer } from "@/lib/supabase/server";
import UlasanList from "./UlasanClient";

export const dynamic = "force-dynamic";

export default async function HalamanUlasan({ searchParams }) {
  const params = await searchParams;
  const halaman = parseInt(params?.hal || "1", 10);
  const perHal = 20;

  const supabase = buatKoneksiServer();
  const { data: ulasan } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .range((halaman - 1) * perHal, halaman * perHal - 1);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Moderasi Ulasan (US-39)</h1>
        <p className="text-sm text-teks-lembut">Tinjau ulasan sebelum ditampilkan di halaman produk.</p>
      </div>
      <UlasanList ulasan={ulasan || []} />
    </div>
  );
}

