"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";

export default function FavoritClient() {
  const [favorit, setFavorit] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorit = () => {
    try {
      const raw = localStorage.getItem("favorit");
      const items = raw ? JSON.parse(raw) : [];
      setFavorit(items);
    } catch {
      setFavorit([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorit();
    window.addEventListener("storage", loadFavorit);
    return () => window.removeEventListener("storage", loadFavorit);
  }, []);

  const kosongkanFavorit = () => {
    if (confirm("Hapus semua produk dari daftar favorit?")) {
      localStorage.setItem("favorit", JSON.stringify([]));
      setFavorit([]);
      window.dispatchEvent(new Event("storage"));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-teks-lembut">
        <p className="animate-pulse">Memuat daftar favorit...</p>
      </div>
    );
  }

  if (favorit.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-latar border border-garis text-4xl shadow-sm">
          ❤️
        </div>
        <h1 className="text-2xl font-bold text-teks mb-2">Belum Ada Favorit</h1>
        <p className="text-teks-lembut mb-6 text-sm">
          Simpan produk-produk yang Anda sukai dengan menekan tombol hati agar mudah ditemukan kembali nanti.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-utama px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          ← Jelajahi Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-teks flex items-center gap-2">
            <span>❤️</span> Produk Favorit Saya
          </h1>
          <p className="text-sm text-teks-lembut mt-1">
            {favorit.length} produk tersimpan di daftar favorit Anda
          </p>
        </div>
        <button
          onClick={kosongkanFavorit}
          className="self-start sm:self-auto text-xs font-semibold text-bahaya hover:underline"
        >
          Hapus Semua Favorit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {favorit.map((item) => (
          <KartuProduk key={item.id} produk={item} />
        ))}
      </div>
    </div>
  );
}
