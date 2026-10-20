"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { useEffect, useState } from "react";

export default function KartuProduk({ produk }) {
  const [isFavorit, setIsFavorit] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("favorit") || "[]");
      setIsFavorit(favs.some((item) => item.id === produk.id));
    } catch {
      // Abaikan
    }
  }, [produk.id]);

  const toggleFavorit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem("favorit") || "[]");
      let updated;
      if (isFavorit) {
        updated = favs.filter((item) => item.id !== produk.id);
        setIsFavorit(false);
      } else {
        updated = [...favs, { id: produk.id, nama: produk.nama, harga: produk.harga, foto_url: produk.foto_url, kategori: produk.kategori }];
        setIsFavorit(true);
      }
      localStorage.setItem("favorit", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Abaikan
    }
  };

  const handleKlikProduk = () => {
    try {
      const list = JSON.parse(localStorage.getItem("terakhirDilihat") || "[]");
      const filtered = list.filter((item) => item.id !== produk.id);
      const updated = [{ id: produk.id, nama: produk.nama, harga: produk.harga, foto_url: produk.foto_url, kategori: produk.kategori }, ...filtered].slice(0, 8);
      localStorage.setItem("terakhirDilihat", JSON.stringify(updated));
    } catch {
      // Abaikan
    }
  };

  const hitungDiskon = () => {
    if (produk.harga_coret && produk.harga_coret > produk.harga) {
      return Math.round(((produk.harga_coret - produk.harga) / produk.harga_coret) * 100);
    }
    return 0;
  };

  const diskon = hitungDiskon();

  return (
    <Link
      href={`/produk/${produk.id}`}
      onClick={handleKlikProduk}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar hover:shadow-md transition-shadow"
    >
      {/* Badge Produk (US-20) */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {produk.badge && (
          <span className="rounded-md bg-utama px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {produk.badge}
          </span>
        )}
        {diskon > 0 && (
          <span className="rounded-md bg-bahaya px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Hemat {diskon}%
          </span>
        )}
      </div>

      {/* Tombol Favorit (US-24) */}
      <button
        type="button"
        onClick={toggleFavorit}
        title={isFavorit ? "Hapus dari Favorit" : "Tambah ke Favorit"}
        className="absolute top-2.5 right-2.5 z-10 rounded-full bg-latar/80 p-1.5 shadow-sm backdrop-blur hover:bg-latar transition-colors"
      >
        <span className="text-sm">{isFavorit ? "❤️" : "🤍"}</span>
      </button>

      <div className="relative aspect-square w-full overflow-hidden bg-permukaan">
        {produk.foto_url ? (
          <img
            src={produk.foto_url}
            alt={produk.nama}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-permukaan" />
        )}
        {produk.stock_status === "habis" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="rounded-md bg-bahaya px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Habis
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p className="text-xs text-teks-lembut">{produk.kategori || "Umum"}</p>
        <h3 className="font-semibold text-sm sm:text-base leading-snug text-teks group-hover:text-utama line-clamp-2">
          {produk.nama}
        </h3>

        <div className="mt-auto pt-2 flex flex-col gap-0.5">
          {produk.harga_coret && produk.harga_coret > produk.harga && (
            <span className="text-xs text-teks-lembut line-through">
              {formatRupiah(produk.harga_coret)}
            </span>
          )}
          <span className="self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
            {formatRupiah(produk.harga)}
          </span>
        </div>
      </div>
    </Link>
  );
}
