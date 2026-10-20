"use client";
import { useActionState, useTransition } from "react";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { simpanKategori, hapusKategori } from "@/app/admin/actions";

export function KategoriList({ kategoriList }) {
  const [isPending, startTransition] = useTransition();

  const handleHapus = (id, nama) => {
    if (confirm(`Hapus kategori "${nama}"? Kategori yang masih dipakai produk tidak akan bisa dihapus.`)) {
      startTransition(async () => {
        const res = await hapusKategori(id, nama);
        if (res?.error) alert(res.error);
      });
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Nama</th>
            <th className="px-4 py-3 font-semibold">Slug</th>
            <th className="px-4 py-3 font-semibold">Urutan</th>
            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {kategoriList.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-teks-lembut">Belum ada kategori.</td></tr>
          ) : kategoriList.map((k) => (
            <tr key={k.id} className="hover:bg-permukaan/40">
              <td className="px-4 py-3 font-semibold">{k.nama}</td>
              <td className="px-4 py-3 font-mono text-xs text-teks-lembut">{k.slug}</td>
              <td className="px-4 py-3">{k.sort_order}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleHapus(k.id, k.nama)}
                  className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-bahaya hover:border-bahaya"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormTambahKategori() {
  const [state, formAction, isPending] = useActionState(simpanKategori, null);
  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      {state?.error && <p className="rounded-lg border border-bahaya/20 bg-bahaya/5 p-3 text-sm text-bahaya">{state.error}</p>}
      {state?.sukses && <p className="rounded-lg border border-utama/20 bg-utama/5 p-3 text-sm text-utama">Kategori berhasil disimpan.</p>}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Nama Kategori *
        <input name="nama" required className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Urutan Tampil
        <input name="sort_order" type="number" defaultValue="0" className="w-24 rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <Tombol type="submit" disabled={isPending} className="self-start">
        {isPending ? "Menyimpan..." : "Simpan Kategori"}
      </Tombol>
    </form>
  );
}

