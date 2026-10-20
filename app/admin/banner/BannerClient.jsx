"use client";
import { useActionState, useTransition } from "react";
import { simpanBanner, hapusBanner } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

export function BannerList({ banners }) {
  const [isPending, startTransition] = useTransition();

  const handleHapus = (id, judul) => {
    if (confirm(`Hapus banner "${judul}"?`)) {
      startTransition(async () => {
        const res = await hapusBanner(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {banners.length === 0 ? (
        <p className="text-teks-lembut text-sm">Belum ada banner promo.</p>
      ) : banners.map((b) => (
        <div key={b.id} className="flex items-center gap-4 rounded-xl border border-garis bg-latar p-4">
          <img src={b.gambar_url} alt={b.judul} className="h-14 w-20 rounded-lg object-cover bg-permukaan flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{b.judul}</p>
            <p className="text-xs text-teks-lembut truncate">{b.teks}</p>
            <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${b.is_active ? "bg-utama/10 text-utama" : "bg-gray-100 text-gray-500"}`}>
              {b.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleHapus(b.id, b.judul)}
            className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-bahaya hover:border-bahaya flex-shrink-0"
          >Hapus</button>
        </div>
      ))}
    </div>
  );
}

export function FormBanner() {
  const [state, formAction, isPending] = useActionState(simpanBanner, null);
  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4 max-w-lg">
      {state?.error && <p className="rounded-lg border border-bahaya/20 bg-bahaya/5 p-3 text-sm text-bahaya">{state.error}</p>}
      {state?.sukses && <p className="rounded-lg border border-utama/20 bg-utama/5 p-3 text-sm text-utama">Banner berhasil disimpan!</p>}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Judul *
        <input name="judul" required className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Teks / Deskripsi
        <textarea name="teks" rows={2} className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Gambar (Upload)
        <input type="file" name="gambar_file" accept="image/png,image/jpeg,image/webp" className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-utama file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Atau URL Gambar
        <input name="gambar_url" placeholder="https://..." className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Tautan (Link)
        <input name="tautan" placeholder="/#judul-produk atau /kategori/camilan" className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
        <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 accent-utama" />
        Tampilkan di beranda (Aktif)
      </label>
      <Tombol type="submit" disabled={isPending} className="self-start">
        {isPending ? "Menyimpan..." : "Simpan Banner"}
      </Tombol>
    </form>
  );
}

