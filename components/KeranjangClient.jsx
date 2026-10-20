"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function KeranjangClient({ storeSettings }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [serverNotice, setServerNotice] = useState("");

  // Muat keranjang dari localStorage dan verifikasi dengan server
  useEffect(() => {
    try {
      const raw = localStorage.getItem("keranjang");
      const items = raw ? JSON.parse(raw) : [];
      setCart(items);
      if (items.length > 0) {
        verifikasiHarga(items);
      } else {
        setLoading(false);
      }
    } catch {
      setCart([]);
      setLoading(false);
    }
  }, []);

  const simpanDanPerbarui = (items) => {
    setCart(items);
    localStorage.setItem("keranjang", JSON.stringify(items));
    window.dispatchEvent(new Event("cart_updated"));
    window.dispatchEvent(new Event("storage"));
  };

  const verifikasiHarga = async (items) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/keranjang/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          // Update harga server & status stok
          let adaPerubahan = false;
          const updated = items.map((clientItem) => {
            const serverItem = data.items.find(
              (s) => String(s.id) === String(clientItem.id)
            );
            if (serverItem) {
              if (serverItem.harga !== clientItem.harga) {
                adaPerubahan = true;
              }
              return {
                ...clientItem,
                harga: serverItem.harga,
                stock_status: serverItem.stock_status,
                is_active: serverItem.is_active,
              };
            }
            return clientItem;
          });

          if (adaPerubahan) {
            setServerNotice("💡 Beberapa harga telah diperbarui sesuai harga terkini dari toko.");
          }
          simpanDanPerbarui(updated);
        }
      }
    } catch (err) {
      console.warn("Gagal memverifikasi harga server:", err);
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const ubahQty = (index, delta) => {
    const copy = [...cart];
    const item = copy[index];
    if (!item) return;

    const newQty = (item.qty || 1) + delta;
    if (newQty <= 0) {
      hapusItem(index);
      return;
    }

    copy[index] = { ...item, qty: newQty };
    simpanDanPerbarui(copy);
  };

  const hapusItem = (index) => {
    const copy = cart.filter((_, i) => i !== index);
    simpanDanPerbarui(copy);
  };

  const kosongkanKeranjang = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh keranjang?")) {
      simpanDanPerbarui([]);
    }
  };

  const subtotal = cart.reduce((acc, item) => {
    return acc + (item.harga || 0) * (item.qty || 1);
  }, 0);

  const handleCheckoutWa = async () => {
    if (cart.length === 0) return;

    // Periksa apakah ada barang yang habis/nonaktif
    const itemTidakTersedia = cart.find(
      (it) => it.stock_status === "habis" || it.is_active === false
    );
    if (itemTidakTersedia) {
      alert(
        `Produk "${itemTidakTersedia.nama}" saat ini sedang habis atau tidak tersedia. Harap hapus produk tersebut sebelum memesan.`
      );
      return;
    }

    setVerifying(true);
    let finalItems = cart;
    try {
      const res = await fetch("/api/keranjang/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          finalItems = data.items;
          simpanDanPerbarui(finalItems);
        }
      }
    } catch {
      // lanjut dengan item saat ini
    } finally {
      setVerifying(false);
    }

    const nomor = (storeSettings.nomorWhatsApp || "").replace(/\D/g, "");
    const nomorWa = nomor.startsWith("0") ? "62" + nomor.slice(1) : nomor;

    const barisProduk = finalItems.map((item, idx) => {
      const variantStr = item.variant ? ` (${item.variant})` : "";
      const itemSubtotal = item.harga * item.qty;
      return `${idx + 1}. ${item.nama}${variantStr} x ${item.qty} = ${formatRupiah(itemSubtotal)}`;
    });

    const finalSubtotal = finalItems.reduce(
      (acc, it) => acc + (it.harga || 0) * (it.qty || 1),
      0
    );

    const pesan = `Halo ${storeSettings.nama}, saya ingin memesan barang berikut:

${barisProduk.join("\n")}

Total: ${formatRupiah(finalSubtotal)}

Mohon konfirmasi ketersediaan dan cara pembayaran. Terima kasih!`;

    const waUrl = `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-teks-lembut">
        <p className="animate-pulse">Memuat keranjang belanja...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-latar border border-garis text-4xl shadow-sm">
          🛒
        </div>
        <h1 className="text-2xl font-bold text-teks mb-2">Keranjang Anda Kosong</h1>
        <p className="text-teks-lembut mb-6 max-w-md mx-auto text-sm">
          Belum ada produk yang ditambahkan ke keranjang. Jelajahi katalog kami untuk menemukan berbagai produk menarik!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-utama px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          ← Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-teks">Keranjang Belanja</h1>
          <p className="text-sm text-teks-lembut mt-1">
            {cart.reduce((a, b) => a + (b.qty || 1), 0)} item dalam keranjang
          </p>
        </div>
        <button
          onClick={kosongkanKeranjang}
          className="self-start sm:self-auto text-xs font-semibold text-bahaya hover:underline"
        >
          Kosongkan Keranjang
        </button>
      </div>

      {serverNotice && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900">
          {serverNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Produk Keranjang */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => {
            const isHabis = item.stock_status === "habis" || item.is_active === false;
            return (
              <div
                key={item.key || `${item.id}-${index}`}
                className="flex gap-4 rounded-2xl border border-garis bg-latar p-4 shadow-sm items-center"
              >
                {/* Foto */}
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-garis bg-permukaan">
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-permukaan flex items-center justify-center text-xs text-teks-lembut">
                      Foto
                    </div>
                  )}
                  {isHabis && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase">Habis</span>
                    </div>
                  )}
                </div>

                {/* Info & Harga */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/produk/${item.id}`}
                      className="text-sm font-bold text-teks hover:text-utama truncate"
                    >
                      {item.nama}
                    </Link>
                    <button
                      onClick={() => hapusItem(index)}
                      className="text-teks-lembut hover:text-bahaya text-sm p-1"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>

                  {item.variant && (
                    <p className="text-xs text-teks-lembut mt-0.5">Varian: {item.variant}</p>
                  )}

                  <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-extrabold text-harga">
                      {formatRupiah(item.harga)}
                    </span>

                    {/* Stepper Jumlah */}
                    <div className="flex items-center rounded-lg border border-garis bg-permukaan">
                      <button
                        onClick={() => ubahQty(index, -1)}
                        className="px-2.5 py-1 text-sm font-bold text-teks hover:bg-latar"
                        title="Kurangi"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-teks">
                        {item.qty || 1}
                      </span>
                      <button
                        onClick={() => ubahQty(index, 1)}
                        className="px-2.5 py-1 text-sm font-bold text-teks hover:bg-latar"
                        title="Tambah"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {isHabis && (
                    <p className="mt-1 text-xs font-semibold text-bahaya">
                      ⚠️ Produk ini sedang tidak tersedia. Mohon hapus untuk melanjutkan.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ringkasan Belanja */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-garis bg-latar p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-bold text-teks mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-2.5 text-sm pb-4 border-b border-garis">
              <div className="flex justify-between text-teks-lembut">
                <span>Total Item</span>
                <span>{cart.reduce((a, b) => a + (b.qty || 1), 0)} unit</span>
              </div>
              <div className="flex justify-between text-teks-lembut">
                <span>Verifikasi Harga</span>
                <span className="text-xs font-bold text-emerald-600">✓ Resmi Server</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between mb-6">
              <span className="font-bold text-teks">Total Belanja</span>
              <span className="text-xl font-black text-harga">{formatRupiah(subtotal)}</span>
            </div>

            <button
              onClick={handleCheckoutWa}
              disabled={verifying}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <span>💬</span>
              {verifying ? "Memverifikasi..." : "Pesan via WhatsApp"}
            </button>

            <p className="mt-3 text-center text-[11px] text-teks-lembut leading-relaxed">
              Pesanan akan dirangkum rapi dan diteruskan langsung ke WhatsApp toko untuk konfirmasi pembayaran & pengiriman.
            </p>

            <div className="mt-4 pt-4 border-t border-garis">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center text-xs font-semibold text-teks-lembut hover:text-utama"
              >
                ← Tambah Produk Lain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
