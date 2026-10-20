import { getStoreSettings } from "@/lib/settings";
import KeranjangClient from "@/components/KeranjangClient";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: `Keranjang Belanja - ${store.nama}`,
    description: `Daftar produk yang akan Anda pesan di ${store.nama}.`,
  };
}

export default async function KeranjangPage() {
  const storeSettings = await getStoreSettings();

  return <KeranjangClient storeSettings={storeSettings} />;
}

