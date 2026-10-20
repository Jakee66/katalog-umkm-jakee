"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log error secara internal di konsol developer tanpa membocorkan ke tampilan
    console.error("Terjadi kesalahan pada aplikasi:", error?.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-bahaya text-4xl shadow-sm">
        ⚠️
      </div>
      <h1 className="text-2xl font-extrabold text-teks mb-2">Terjadi Kendala Teknis</h1>
      <p className="text-teks-lembut text-sm mb-6 leading-relaxed">
        Maaf, sistem mengalami kendala sementara saat memuat data halaman ini. Kami telah mencatat kejadian ini untuk segera ditangani.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto rounded-xl bg-utama px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto rounded-xl border border-garis bg-latar px-6 py-3 text-sm font-bold text-teks hover:border-utama transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
