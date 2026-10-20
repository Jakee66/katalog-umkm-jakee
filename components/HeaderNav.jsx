"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function HeaderNav() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("keranjang") || "[]");
        const total = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("cart_updated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cart_updated", updateCount);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
      <Link href="/" className="hover:text-utama text-teks">
        Katalog
      </Link>
      <Link href="/favorit" className="hover:text-utama text-teks hidden sm:inline">
        Favorit
      </Link>
      <Link href="/bandingkan" className="hover:text-utama text-teks hidden sm:inline">
        Bandingkan
      </Link>
      <Link href="/tentang" className="hover:text-utama text-teks">
        Tentang
      </Link>

      <Link
        href="/keranjang"
        className="relative inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-xs font-bold text-teks hover:border-utama transition-colors"
        title="Keranjang Belanja"
      >
        <span>🛒</span>
        <span className="hidden sm:inline">Keranjang</span>
        {cartCount > 0 && (
          <span className="rounded-full bg-utama px-1.5 py-0.2 text-[10px] font-black text-white">
            {cartCount}
          </span>
        )}
      </Link>

      <ThemeToggle />
    </div>
  );
}

