import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";

export default async function Footer() {
  const store = await getStoreSettings();

  return (
    <footer className="mt-16 border-t border-garis bg-permukaan">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-teks-lembut sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-teks">{store.nama}</p>
          <p>{store.alamat}</p>
          <p>{store.jamBuka}</p>
          {(store.instagram || store.facebook) && (
            <div className="flex gap-3 text-xs pt-1 text-utama">
              {store.instagram && <span>IG: {store.instagram}</span>}
              {store.facebook && <span>FB: {store.facebook}</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:items-end gap-2 self-start">
          <Link href="/tentang" className="underline underline-offset-4 hover:text-utama">
            Tentang Toko & Kontak
          </Link>
          <Link href="/admin" className="underline underline-offset-4 hover:text-utama text-xs">
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
