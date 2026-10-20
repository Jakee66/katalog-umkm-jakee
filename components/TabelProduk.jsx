"use client";

import { useTransition } from "react";
import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import {
  hapusProduk,
  toggleStatusProduk,
  ubahUrutanProduk,
} from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk = [] }) {
  const [isPending, startTransition] = useTransition();

  const handleHapus = (id, nama) => {
    if (confirm(`Yakin ingin menghapus produk "${nama}"? Foto terkait di storage juga akan dihapus.`)) {
      startTransition(async () => {
        const res = await hapusProduk(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  const handleToggle = (id, currentStatus) => {
    startTransition(async () => {
      const res = await toggleStatusProduk(id, currentStatus);
      if (res?.error) alert(res.error);
    });
  };

  const handleUrut = (id, delta) => {
    startTransition(async () => {
      const res = await ubahUrutanProduk(id, delta);
      if (res?.error) alert(res.error);
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Urutan</th>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {daftarProduk.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-teks-lembut">
                Belum ada produk ditemukan.
              </td>
            </tr>
          ) : (
            daftarProduk.map((produk) => {
              const isAktif = produk.is_active !== false;
              return (
                <tr key={produk.id} className="hover:bg-permukaan/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUrut(produk.id, -1)}
                        disabled={isPending}
                        title="Naikkan urutan"
                        className="rounded px-1.5 py-0.5 border border-garis bg-latar text-xs font-bold hover:bg-permukaan"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUrut(produk.id, 1)}
                        disabled={isPending}
                        title="Turunkan urutan"
                        className="rounded px-1.5 py-0.5 border border-garis bg-latar text-xs font-bold hover:bg-permukaan"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-garis bg-permukaan">
                        {produk.foto_url ? (
                          <img
                            src={produk.foto_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-garis" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-teks">{produk.nama}</span>
                        {produk.badge && (
                          <span className="inline-block w-fit text-[10px] font-bold uppercase tracking-wider text-utama">
                            {produk.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-teks-lembut">{produk.kategori || "-"}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatRupiah(produk.harga)}
                    {produk.harga_coret && (
                      <span className="ml-1 text-xs text-teks-lembut line-through">
                        {formatRupiah(produk.harga_coret)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        produk.stock_status === "habis"
                          ? "bg-bahaya/10 text-bahaya"
                          : produk.stock_status === "terbatas"
                          ? "bg-amber-500/10 text-amber-700"
                          : "bg-utama/10 text-utama"
                      }`}
                    >
                      {produk.stock_status || "tersedia"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(produk.id, isAktif)}
                      disabled={isPending}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ${
                        isAktif
                          ? "bg-utama/10 text-utama hover:bg-utama/20"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {isAktif ? "● Aktif" : "○ Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Tombol
                        href={`/admin/produk/${produk.id}/ubah`}
                        varian="garis"
                        className="py-1 px-2.5 text-xs"
                      >
                        Ubah
                      </Tombol>
                      <button
                        type="button"
                        onClick={() => handleHapus(produk.id, produk.nama)}
                        disabled={isPending}
                        className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-bahaya hover:border-bahaya transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
