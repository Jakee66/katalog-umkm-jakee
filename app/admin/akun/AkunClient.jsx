"use client";
import { useActionState, useTransition } from "react";
import NavAdmin from "@/components/NavAdmin";
import { tambahAkunAdmin, toggleAkunAdmin } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

function DaftarAkun({ akunList }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Nama</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {akunList.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-teks-lembut">Belum ada akun admin terdaftar di tabel ini.</td></tr>
          ) : akunList.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 font-mono text-xs">{a.email}</td>
              <td className="px-4 py-3">{a.nama || "-"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.is_active ? "bg-utama/10 text-utama" : "bg-gray-100 text-gray-500"}`}>
                  {a.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await toggleAkunAdmin(a.id, a.email, a.is_active);
                      if (res?.error) alert(res.error);
                    });
                  }}
                  className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-teks-lembut hover:bg-permukaan"
                >
                  {a.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormTambahAkun() {
  const [state, formAction, isPending] = useActionState(tambahAkunAdmin, null);
  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      {state?.error && <p className="rounded-lg border border-bahaya/20 bg-bahaya/5 p-3 text-sm text-bahaya">{state.error}</p>}
      {state?.sukses && <p className="rounded-lg border border-utama/20 bg-utama/5 p-3 text-sm text-utama">Akun admin baru berhasil ditambahkan.</p>}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Email *
        <input name="email" type="email" required className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Password * (min 8 karakter)
        <input name="password" type="password" minLength={8} required className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Nama Tampil
        <input name="nama" className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
      </label>
      <Tombol type="submit" disabled={isPending} className="self-start">
        {isPending ? "Menyimpan..." : "Tambah Akun Admin"}
      </Tombol>
    </form>
  );
}

export default function HalamanAkun({ akunList }) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola Akun Admin (US-44)</h1>
        <p className="text-sm text-teks-lembut">Tambah atau nonaktifkan akun admin. Anda tidak bisa menonaktifkan akun sendiri.</p>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Daftar Akun</h2>
        <DaftarAkun akunList={akunList} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Tambah Akun Admin Baru</h2>
        <FormTambahAkun />
      </section>
    </div>
  );
}

