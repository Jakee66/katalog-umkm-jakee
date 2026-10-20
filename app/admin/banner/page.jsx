import NavAdmin from "@/components/NavAdmin";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { BannerList, FormBanner } from "./BannerClient";

export const dynamic = "force-dynamic";

export default async function HalamanBanner() {
  const supabase = buatKoneksiServer();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola Banner Promo (US-42)</h1>
        <p className="text-sm text-teks-lembut">Banner aktif akan tampil di bagian atas halaman katalog.</p>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Tambah Banner Baru</h2>
        <FormBanner />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Banner yang Ada</h2>
        <BannerList banners={banners || []} />
      </section>
    </div>
  );
}

