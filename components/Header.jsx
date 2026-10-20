import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const store = await getStoreSettings();

  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {store.nama}
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
