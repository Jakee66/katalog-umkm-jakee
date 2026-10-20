import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import { buatKoneksiServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const AKSI_ICON = {
  LOGIN: "🔐", LOGOUT: "🚪", TAMBAH_PRODUK: "➕", UBAH_PRODUK: "✏️",
  HAPUS_PRODUK: "🗑️", TOGGLE_PRODUK: "🔄", URUTAN_PRODUK: "↕️",
  TAMBAH_KATEGORI: "📁", UBAH_KATEGORI: "📝", HAPUS_KATEGORI: "🗑️",
  TAMBAH_BANNER: "🖼️", UBAH_BANNER: "🖼️", HAPUS_BANNER: "🗑️",
  UBAH_PENGATURAN: "⚙️", MODERASI_ULASAN: "💬", IMPOR_CSV: "📤",
  GANTI_PASSWORD: "🔑", TAMBAH_ADMIN: "👤", TOGGLE_ADMIN: "👤",
};

export default async function HalamanLog({ searchParams }) {
  const params = await searchParams;
  const halaman = parseInt(params?.hal || "1", 10);
  const perHal = 50;

  const supabase = buatKoneksiServer();
  const { data: logs, count } = await supabase
    .from("admin_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((halaman - 1) * perHal, halaman * perHal - 1);

  const totalHal = Math.max(1, Math.ceil((count || 0) / perHal));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Log Aktivitas Admin (US-45)</h1>
        <p className="text-sm text-teks-lembut">Riwayat semua aksi yang dilakukan admin.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Aksi</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Detail</th>
              <th className="px-4 py-3 font-semibold">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-garis">
            {(logs || []).length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-teks-lembut">Belum ada aktivitas tercatat.</td></tr>
            ) : (logs || []).map((log) => (
              <tr key={log.id} className="hover:bg-permukaan/40">
                <td className="px-4 py-3 font-mono text-xs">
                  {AKSI_ICON[log.aksi] || "📋"} {log.aksi}
                </td>
                <td className="px-4 py-3 text-teks-lembut text-xs">{log.admin_email || "-"}</td>
                <td className="px-4 py-3 text-xs max-w-xs truncate">{log.detail}</td>
                <td className="px-4 py-3 text-teks-lembut text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalHal > 1 && (
        <div className="flex items-center gap-3 text-sm">
          {halaman > 1 && <Link href={`/admin/log?hal=${halaman - 1}`} className="rounded-lg border border-garis px-3 py-1.5 hover:bg-permukaan">← Sebelumnya</Link>}
          <span className="text-teks-lembut">Hal {halaman}/{totalHal}</span>
          {halaman < totalHal && <Link href={`/admin/log?hal=${halaman + 1}`} className="rounded-lg border border-garis px-3 py-1.5 hover:bg-permukaan">Berikutnya →</Link>}
        </div>
      )}
    </div>
  );
}

