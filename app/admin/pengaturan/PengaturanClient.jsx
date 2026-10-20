"use client";
import { useActionState } from "react";
import NavAdmin from "@/components/NavAdmin";
import { simpanPengaturanToko } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

export default function PengaturanClient({ settings }) {
  const [state, formAction, isPending] = useActionState(simpanPengaturanToko, null);
  const s = settings || {};

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Pengaturan Toko (US-43)</h1>
        <p className="text-sm text-teks-lembut">Data ini digunakan di seluruh halaman aplikasi.</p>
      </div>
      {state?.error && <p className="max-w-xl rounded-lg border border-bahaya/20 bg-bahaya/5 p-3 text-sm text-bahaya">{state.error}</p>}
      {state?.sukses && <p className="max-w-xl rounded-lg border border-utama/20 bg-utama/5 p-3 text-sm font-semibold text-utama">Pengaturan berhasil disimpan!</p>}
      <form action={formAction} className="flex max-w-xl flex-col gap-4">
        {[
          { label: "Nama Toko *", name: "nama_toko", value: s.nama || "" },
          { label: "Tagline", name: "tagline", value: s.tagline || "" },
          { label: "Nomor WhatsApp * (format internasional, misal 6281234567)", name: "no_wa", value: s.nomorWhatsApp || "" },
          { label: "Alamat", name: "alamat", value: s.alamat || "" },
          { label: "Jam Buka", name: "jam_buka", value: s.jamBuka || "" },
          { label: "Instagram", name: "instagram", value: s.instagram || "" },
          { label: "Facebook", name: "facebook", value: s.facebook || "" },
        ].map((f) => (
          <label key={f.name} className="flex flex-col gap-1.5 text-sm font-semibold">
            {f.label}
            <input name={f.name} defaultValue={f.value} className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
          </label>
        ))}
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Template Pesan WhatsApp
          <span className="font-normal text-teks-lembut text-xs">Gunakan {"{nama_produk}"} dan {"{harga_produk}"} sebagai variabel.</span>
          <textarea name="template_pesan_wa" rows={3} defaultValue={s.templatePesanWa || "Halo, saya ingin memesan {nama_produk} seharga {harga_produk}."}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base focus:border-utama focus:outline-none" />
        </label>
        <Tombol type="submit" disabled={isPending} className="self-start">
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Tombol>
      </form>
    </div>
  );
}

