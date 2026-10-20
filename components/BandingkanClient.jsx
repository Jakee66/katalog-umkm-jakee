"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function BandingkanClient({ allProducts, storeSettings }) {
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bandingkan") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        if (saved[0]) setP1Id(String(saved[0]));
        if (saved[1]) setP2Id(String(saved[1]));
      } else if (allProducts.length >= 2) {
        setP1Id(String(allProducts[0].id));
        setP2Id(String(allProducts[1].id));
      } else if (allProducts.length === 1) {
        setP1Id(String(allProducts[0].id));
      }
    } catch {
      if (allProducts.length >= 2) {
        setP1Id(String(allProducts[0].id));
        setP2Id(String(allProducts[1].id));
      }
    }
  }, [allProducts]);

  const handleSelectP1 = (id) => {
    setP1Id(id);
    simpanBandingkan(id, p2Id);
  };

  const handleSelectP2 = (id) => {
    setP2Id(id);
    simpanBandingkan(p1Id, id);
  };

  const simpanBandingkan = (id1, id2) => {
    try {
      const arr = [id1, id2].filter(Boolean);
      localStorage.setItem("bandingkan", JSON.stringify(arr));
    } catch {
      // Abaikan
    }
  };

  const p1 = allProducts.find((p) => String(p.id) === String(p1Id));
  const p2 = allProducts.find((p) => String(p.id) === String(p2Id));

  const formatWaUrl = (prod) => {
    if (!prod) return "#";
    const nomor = (storeSettings.nomorWhatsApp || "").replace(/\D/g, "");
    const nomorWa = nomor.startsWith("0") ? "62" + nomor.slice(1) : nomor;
    const pesan = `Halo ${storeSettings.nama}, saya tertarik dengan produk ${prod.nama} seharga ${formatRupiah(prod.harga)}. Apakah masih tersedia?`;
    return `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-teks flex items-center justify-center sm:justify-start gap-2">
          <span>⚖️</span> Perbandingan Produk
        </h1>
        <p className="text-sm text-teks-lembut mt-1">
          Bandingkan spesifikasi, harga, dan ketersediaan 2 produk secara berdampingan.
        </p>
      </div>

      {/* Selector Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-latar p-4 sm:p-6 rounded-2xl border border-garis">
        <div>
          <label className="block text-xs font-bold text-teks uppercase tracking-wider mb-2">
            Pilih Produk 1:
          </label>
          <select
            value={p1Id}
            onChange={(e) => handleSelectP1(e.target.value)}
            className="w-full rounded-xl border border-garis bg-permukaan px-3 py-2.5 text-sm font-medium text-teks focus:border-utama focus:outline-none"
          >
            <option value="">-- Pilih Produk --</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} ({formatRupiah(p.harga)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-teks uppercase tracking-wider mb-2">
            Pilih Produk 2:
          </label>
          <select
            value={p2Id}
            onChange={(e) => handleSelectP2(e.target.value)}
            className="w-full rounded-xl border border-garis bg-permukaan px-3 py-2.5 text-sm font-medium text-teks focus:border-utama focus:outline-none"
          >
            <option value="">-- Pilih Produk --</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} ({formatRupiah(p.harga)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Komparasi */}
      {(!p1 && !p2) ? (
        <div className="text-center py-12 text-teks-lembut">
          Silakan pilih produk yang ingin dibandingkan di atas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-garis bg-latar shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-garis bg-permukaan">
                <th className="p-4 w-1/4 font-bold text-teks-lembut uppercase text-xs">Fitur</th>
                <th className="p-4 w-3/8 font-bold text-teks text-base">
                  {p1 ? p1.nama : "Produk 1"}
                </th>
                <th className="p-4 w-3/8 font-bold text-teks text-base">
                  {p2 ? p2.nama : "Produk 2"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {/* Foto */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase">Foto</td>
                <td className="p-4">
                  {p1?.foto_url ? (
                    <img
                      src={p1.foto_url}
                      alt={p1.nama}
                      className="h-32 w-32 object-cover rounded-xl border border-garis"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-xl bg-permukaan flex items-center justify-center text-xs text-teks-lembut">
                      Tanpa Foto
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {p2?.foto_url ? (
                    <img
                      src={p2.foto_url}
                      alt={p2.nama}
                      className="h-32 w-32 object-cover rounded-xl border border-garis"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-xl bg-permukaan flex items-center justify-center text-xs text-teks-lembut">
                      Tanpa Foto
                    </div>
                  )}
                </td>
              </tr>

              {/* Harga */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase">Harga</td>
                <td className="p-4">
                  {p1 ? (
                    <div>
                      {p1.harga_coret && p1.harga_coret > p1.harga && (
                        <p className="text-xs text-teks-lembut line-through">
                          {formatRupiah(p1.harga_coret)}
                        </p>
                      )}
                      <p className="text-lg font-black text-harga">{formatRupiah(p1.harga)}</p>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-4">
                  {p2 ? (
                    <div>
                      {p2.harga_coret && p2.harga_coret > p2.harga && (
                        <p className="text-xs text-teks-lembut line-through">
                          {formatRupiah(p2.harga_coret)}
                        </p>
                      )}
                      <p className="text-lg font-black text-harga">{formatRupiah(p2.harga)}</p>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>

              {/* Kategori */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase">Kategori</td>
                <td className="p-4 font-medium text-teks">{p1?.kategori || "-"}</td>
                <td className="p-4 font-medium text-teks">{p2?.kategori || "-"}</td>
              </tr>

              {/* Status Stok */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase">Ketersediaan</td>
                <td className="p-4">
                  {p1 ? (
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold capitalize ${
                        p1.stock_status === "habis"
                          ? "bg-red-100 text-red-700"
                          : p1.stock_status === "terbatas"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p1.stock_status || "Tersedia"}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-4">
                  {p2 ? (
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold capitalize ${
                        p2.stock_status === "habis"
                          ? "bg-red-100 text-red-700"
                          : p2.stock_status === "terbatas"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p2.stock_status || "Tersedia"}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>

              {/* Badge */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase">Badge Khusus</td>
                <td className="p-4">
                  {p1?.badge ? (
                    <span className="rounded-md bg-utama px-2 py-0.5 text-xs font-bold text-white uppercase">
                      {p1.badge}
                    </span>
                  ) : (
                    <span className="text-teks-lembut text-xs">-</span>
                  )}
                </td>
                <td className="p-4">
                  {p2?.badge ? (
                    <span className="rounded-md bg-utama px-2 py-0.5 text-xs font-bold text-white uppercase">
                      {p2.badge}
                    </span>
                  ) : (
                    <span className="text-teks-lembut text-xs">-</span>
                  )}
                </td>
              </tr>

              {/* Deskripsi */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase align-top">
                  Deskripsi
                </td>
                <td className="p-4 align-top text-xs text-teks leading-relaxed max-w-xs">
                  {p1?.deskripsi || "-"}
                </td>
                <td className="p-4 align-top text-xs text-teks leading-relaxed max-w-xs">
                  {p2?.deskripsi || "-"}
                </td>
              </tr>

              {/* Aksi */}
              <tr>
                <td className="p-4 font-semibold text-teks-lembut text-xs uppercase">Aksi</td>
                <td className="p-4 space-y-2">
                  {p1 && (
                    <>
                      <Link
                        href={`/produk/${p1.id}`}
                        className="inline-flex w-full items-center justify-center rounded-lg border border-garis bg-permukaan px-3 py-2 text-xs font-bold text-teks hover:border-utama transition-colors"
                      >
                        Lihat Detail
                      </Link>
                      {p1.stock_status !== "habis" && (
                        <a
                          href={formatWaUrl(p1)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <span>💬</span> Pesan WA
                        </a>
                      )}
                    </>
                  )}
                </td>
                <td className="p-4 space-y-2">
                  {p2 && (
                    <>
                      <Link
                        href={`/produk/${p2.id}`}
                        className="inline-flex w-full items-center justify-center rounded-lg border border-garis bg-permukaan px-3 py-2 text-xs font-bold text-teks hover:border-utama transition-colors"
                      >
                        Lihat Detail
                      </Link>
                      {p2.stock_status !== "habis" && (
                        <a
                          href={formatWaUrl(p2)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <span>💬</span> Pesan WA
                        </a>
                      )}
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
