"use client";
import { useTransition } from "react";
import { ubahStatusUlasan } from "@/app/admin/actions";
import { formatRupiah } from "@/lib/format";

const BINTANG = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
const STATUS_LABEL = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };
const STATUS_CLASS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-utama/10 text-utama",
  rejected: "bg-bahaya/10 text-bahaya",
};

export default function UlasanList({ ulasan }) {
  const [isPending, startTransition] = useTransition();

  const handleAksi = (id, aksi) => {
    startTransition(async () => {
      const res = await ubahStatusUlasan(id, aksi);
      if (res?.error) alert(res.error);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {ulasan.length === 0 ? (
        <p className="text-teks-lembut text-sm">Belum ada ulasan masuk.</p>
      ) : ulasan.map((u) => (
        <div key={u.id} className="rounded-xl border border-garis bg-latar p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold">{u.nama}</p>
              <p className="text-xs text-teks-lembut">
                Produk ID: {u.product_id} &bull; {new Date(u.created_at).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[u.status] || ""}`}>
                {STATUS_LABEL[u.status] || u.status}
              </span>
              <span className="text-amber-500 font-bold">{BINTANG[u.rating] || u.rating}</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{u.komentar}</p>
          <div className="flex gap-2 pt-1">
            {u.status !== "approved" && (
              <button
                disabled={isPending}
                onClick={() => handleAksi(u.id, "approved")}
                className="rounded-lg border border-utama/30 bg-utama/5 px-3 py-1 text-xs font-bold text-utama hover:bg-utama/10"
              >✓ Setujui</button>
            )}
            {u.status !== "rejected" && (
              <button
                disabled={isPending}
                onClick={() => handleAksi(u.id, "rejected")}
                className="rounded-lg border border-garis bg-latar px-3 py-1 text-xs font-semibold text-teks-lembut hover:bg-permukaan"
              >✕ Tolak</button>
            )}
            <button
              disabled={isPending}
              onClick={() => {
                if (confirm("Hapus ulasan ini secara permanen?")) handleAksi(u.id, "delete");
              }}
              className="rounded-lg border border-garis bg-latar px-3 py-1 text-xs font-semibold text-bahaya hover:border-bahaya"
            >Hapus</button>
          </div>
        </div>
      ))}
    </div>
  );
}

