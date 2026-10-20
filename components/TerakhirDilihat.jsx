"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function TerakhirDilihat() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("terakhirDilihat") || "[]");
      setItems(data.slice(0, 4));
    } catch {
      // Abaikan
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 pt-6 border-t border-garis">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-teks">Terakhir Dilihat (US-36)</h2>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("terakhirDilihat");
            setItems([]);
          }}
          className="text-xs text-teks-lembut hover:text-bahaya underline"
        >
          Hapus riwayat
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((prod) => (
          <Link
            key={prod.id}
            href={`/produk/${prod.id}`}
            className="flex items-center gap-2.5 rounded-xl border border-garis bg-latar p-2 hover:border-utama transition-colors"
          >
            <img
              src={prod.foto_url || "/produk/kopi.svg"}
              alt=""
              className="h-12 w-12 flex-shrink-0 rounded-lg object-cover bg-permukaan"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-teks truncate">{prod.nama}</p>
              <p className="text-xs font-bold text-harga">{formatRupiah(prod.harga)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
