import Link from "next/link";
import { keluarAdmin } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis pb-4 text-sm">
      <Link href="/admin" className="font-semibold hover:text-utama">
        Dashboard & Produk
      </Link>
      <Link href="/admin/kategori" className="font-semibold hover:text-utama">
        Kategori
      </Link>
      <Link href="/admin/banner" className="font-semibold hover:text-utama">
        Banner
      </Link>
      <Link href="/admin/ulasan" className="font-semibold hover:text-utama">
        Ulasan
      </Link>
      <Link href="/admin/pengaturan" className="font-semibold hover:text-utama">
        Pengaturan
      </Link>
      <Link href="/admin/akun" className="font-semibold hover:text-utama">
        Akun Admin
      </Link>
      <Link href="/admin/log" className="font-semibold hover:text-utama">
        Log Aktivitas
      </Link>
      <Link href="/admin/password" className="font-semibold hover:text-utama">
        Ganti Password
      </Link>
      <form action={keluarAdmin} className="ml-auto">
        <button type="submit" className="text-teks-lembut hover:text-bahaya font-medium">
          Keluar
        </button>
      </form>
    </nav>
  );
}
