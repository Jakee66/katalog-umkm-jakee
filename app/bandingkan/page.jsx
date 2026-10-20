import { buatKoneksiServer } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import BandingkanClient from "@/components/BandingkanClient";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: `Bandingkan Produk - ${store.nama}`,
    description: `Bandingkan spesifikasi dan harga produk di ${store.nama}.`,
  };
}

export default async function BandingkanPage() {
  const supabase = buatKoneksiServer();
  const [storeSettings, { data: products }] = await Promise.all([
    getStoreSettings(),
    supabase
      .from("produk")
      .select("id, nama, harga, harga_coret, foto_url, kategori, deskripsi, stock_status, badge")
      .eq("is_active", true)
      .order("nama", { ascending: true }),
  ]);

  return (
    <BandingkanClient
      allProducts={products || []}
      storeSettings={storeSettings}
    />
  );
}
