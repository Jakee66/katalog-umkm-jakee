import FavoritClient from "@/components/FavoritClient";
import { getStoreSettings } from "@/lib/settings";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: `Produk Favorit - ${store.nama}`,
    description: `Daftar produk favorit tersimpan di ${store.nama}.`,
  };
}

export default function FavoritPage() {
  return <FavoritClient />;
}
