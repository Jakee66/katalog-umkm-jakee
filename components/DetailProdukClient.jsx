"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function DetailProdukClient({
  produk,
  galleryImages = [],
  variants = [],
  reviews = [],
  storeSettings,
  relatedProducts = [],
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(produk.foto_url);
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [qty, setQty] = useState(1);
  const [shareFeedback, setShareFeedback] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");

  // State untuk form ulasan (US-38)
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewHoneypot, setReviewHoneypot] = useState("");
  const [reviewStatus, setReviewStatus] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // State untuk Asisten AI (US-50)
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Harga aktif berdasarkan varian terpilih (US-48)
  const activeHarga = selectedVariant ? selectedVariant.harga : produk.harga;
  const isHabis = produk.stock_status === "habis";

  // Semua foto galeri (US-18)
  const allImages = [produk.foto_url, ...galleryImages.map((g) => g.foto_url)].filter(Boolean);

  // US-23: Bagikan atau Salin Link
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: produk.nama,
          text: `Lihat produk ${produk.nama} seharga ${formatRupiah(activeHarga)} di ${storeSettings.nama}!`,
          url,
        });
        return;
      } catch {
        // User membatalkan
      }
    }
    // Fallback salin ke clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback("Tautan produk berhasil disalin!");
      setTimeout(() => setShareFeedback(""), 3000);
    } catch {
      setShareFeedback("Gagal menyalin link.");
    }
  };

  // US-21: Tambah ke Keranjang
  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("keranjang") || "[]");
      const cartItemId = selectedVariant
        ? `${produk.id}_var_${selectedVariant.id || selectedVariant.nama}`
        : `${produk.id}`;

      const existingIndex = cart.findIndex((item) => item.key === cartItemId);
      if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
      } else {
        cart.push({
          key: cartItemId,
          id: produk.id,
          nama: produk.nama,
          harga: activeHarga,
          foto_url: produk.foto_url,
          variant: selectedVariant?.nama || null,
          qty,
        });
      }

      localStorage.setItem("keranjang", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart_updated"));
      setCartFeedback("✓ Berhasil ditambahkan ke keranjang!");
      setTimeout(() => setCartFeedback(""), 3000);
    } catch {
      setCartFeedback("Gagal menambahkan ke keranjang.");
    }
  };

  // US-03 & US-12 & US-40: Pesan via WhatsApp
  const handlePesanWa = async () => {
    if (isHabis) return;

    // Catat klik ke server sebelum membuka WA (US-40)
    try {
      fetch("/api/wa-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: produk.id }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    const nomor = (storeSettings.nomorWhatsApp || "").replace(/\D/g, "");
    const nomorWa = nomor.startsWith("0") ? "62" + nomor.slice(1) : nomor;

    const variantText = selectedVariant ? ` (Varian: ${selectedVariant.nama})` : "";
    const totalHarga = activeHarga * qty;
    const pesan = `Halo ${storeSettings.nama}, saya ingin memesan:
- Produk: ${produk.nama}${variantText}
- Jumlah: ${qty}
- Total: ${formatRupiah(totalHarga)}

Apakah produk ini masih tersedia? Terima kasih!`;

    const waUrl = `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // US-38: Kirim Ulasan
  const handleKirimUlasan = async (e) => {
    e.preventDefault();
    if (reviewHoneypot) return; // Spam terdeteksi
    setReviewSubmitting(true);
    setReviewStatus(null);

    try {
      const res = await fetch("/api/ulasan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: produk.id,
          nama: reviewName,
          rating: reviewRating,
          komentar: reviewComment,
          honeypot: reviewHoneypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewStatus({ error: data?.error || "Gagal mengirim ulasan." });
      } else {
        setReviewStatus({
          sukses: "Ulasan berhasil dikirim! Ulasan akan tampil setelah disetujui admin.",
        });
        setReviewName("");
        setReviewComment("");
      }
    } catch (err) {
      setReviewStatus({ error: err.message || "Gagal menghubungi server." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  // US-50: Tanya Asisten AI
  const handleTanyaAi = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: produk.id, pertanyaan: aiQuestion }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || "Gagal mendapatkan jawaban AI.");
      } else {
        setAiAnswer(data?.reply || "");
      }
    } catch (err) {
      setAiError(err.message || "Gagal terhubung ke asisten AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-12 py-6">
      {/* Detail Atas: Galeri Foto + Info Produk */}
      <article className="grid gap-8 md:grid-cols-2 md:py-4">
        {/* Galeri Foto (US-18) */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-garis bg-permukaan">
            {selectedPhoto ? (
              <img
                src={selectedPhoto}
                alt={produk.nama}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-permukaan" />
            )}
            {isHabis && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="rounded-md bg-bahaya px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
                  Stok Habis
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Foto Tambahan (US-18) */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPhoto(img)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedPhoto === img ? "border-utama" : "border-garis opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Opsi Pemesanan */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link
              href="/"
              className="text-xs text-teks-lembut underline underline-offset-4 hover:text-utama"
            >
              ← Kembali ke katalog
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/bandingkan"
                onClick={() => {
                  try {
                    const saved = JSON.parse(localStorage.getItem("bandingkan") || "[]");
                    const updated = [produk.id, ...saved.filter(id => id !== produk.id)].slice(0, 2);
                    localStorage.setItem("bandingkan", JSON.stringify(updated));
                  } catch {}
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-teks hover:border-utama"
                title="Bandingkan dengan produk lain"
              >
                <span>⚖️ Bandingkan</span>
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-teks hover:border-utama"
              >
                <span>🔗 Bagikan</span>
              </button>
            </div>
          </div>
          {shareFeedback && (
            <p className="text-xs font-bold text-utama">{shareFeedback}</p>
          )}

          {/* Kategori, Nama & Badge (US-20) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teks-lembut">
                {produk.kategori || "Umum"}
              </span>
              {produk.badge && (
                <span className="rounded bg-utama px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  {produk.badge}
                </span>
              )}
              {/* Status Stok Badge (US-19) */}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  produk.stock_status === "habis"
                    ? "bg-bahaya/10 text-bahaya"
                    : produk.stock_status === "terbatas"
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-utama/10 text-utama"
                }`}
              >
                {produk.stock_status === "habis"
                  ? "Stok Habis"
                  : produk.stock_status === "terbatas"
                  ? "Stok Terbatas"
                  : "Stok Tersedia"}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-teks">
              {produk.nama}
            </h1>

            {/* Rata-rata Rating (US-38) */}
            {avgRating && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-amber-500 font-black">★ {avgRating}</span>
                <span className="text-teks-lembut">({reviews.length} ulasan)</span>
              </div>
            )}
          </div>

          {/* Harga (US-20 & US-48) */}
          <div className="flex items-baseline gap-2">
            <span className="rounded-md bg-harga-latar px-3 py-1 text-2xl font-black text-harga">
              {formatRupiah(activeHarga)}
            </span>
            {produk.harga_coret && produk.harga_coret > activeHarga && (
              <span className="text-sm text-teks-lembut line-through">
                {formatRupiah(produk.harga_coret)}
              </span>
            )}
          </div>

          {/* Pilihan Varian Produk (US-12, US-48) */}
          {variants.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-garis">
              <label className="text-xs font-bold text-teks">Pilih Varian / Ukuran:</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id || v.nama}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedVariant?.id === v.id || selectedVariant?.nama === v.nama
                        ? "border-utama bg-utama/10 text-utama"
                        : "border-garis bg-latar text-teks hover:border-utama"
                    }`}
                  >
                    {v.nama} - {formatRupiah(v.harga)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Jumlah / Qty (US-12) */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-bold text-teks">Jumlah:</span>
            <div className="flex items-center rounded-lg border border-garis bg-latar">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                className="px-3 py-1 text-sm font-bold text-teks hover:bg-permukaan disabled:opacity-30"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="px-3 py-1 text-sm font-bold text-teks hover:bg-permukaan"
              >
                +
              </button>
            </div>
          </div>

          <p className="max-w-prose leading-relaxed text-sm text-teks-lembut pt-1">
            {produk.deskripsi || "Tidak ada deskripsi detail produk."}
          </p>

          {/* Tombol Aksi: Tambah ke Keranjang (US-21) & Pesan WA (US-03) */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handlePesanWa}
              disabled={isHabis}
              className={`inline-flex w-full items-center justify-center rounded-lg px-5 py-3 font-semibold text-white shadow-sm transition-colors ${
                isHabis
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-utama hover:bg-utama-gelap"
              }`}
            >
              {isHabis ? "Produk Sedang Habis" : "💬 Pesan via WhatsApp"}
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isHabis}
              className="inline-flex w-full items-center justify-center rounded-lg border border-garis bg-latar px-5 py-2.5 text-sm font-semibold text-teks hover:border-utama hover:text-utama transition-colors"
            >
              🛒 Tambah ke Keranjang (US-21)
            </button>

            {cartFeedback && (
              <p className="text-center text-xs font-bold text-utama">{cartFeedback}</p>
            )}
          </div>
        </div>
      </article>

      {/* Widget Asisten AI Tanya Jawab Produk (US-50) */}
      <section className="rounded-2xl border border-garis bg-permukaan/50 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h2 className="text-base font-bold text-teks">Tanya Asisten AI (US-50)</h2>
            <p className="text-xs text-teks-lembut">
              Punya pertanyaan seputar produk ini? Tanyakan langsung ke asisten AI kami.
            </p>
          </div>
        </div>

        <form onSubmit={handleTanyaAi} className="flex gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Misal: Apakah cocok untuk kopi tubruk? Berapa beratnya?"
            maxLength={300}
            className="flex-1 rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="rounded-lg bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-50"
          >
            {aiLoading ? "Berpikir..." : "Kirim"}
          </button>
        </form>

        {aiError && (
          <p className="rounded-lg border border-bahaya/20 bg-bahaya/5 p-3 text-xs text-bahaya">
            {aiError}
          </p>
        )}

        {aiAnswer && (
          <div className="rounded-xl border border-utama/20 bg-latar p-4 text-sm leading-relaxed text-teks">
            <span className="block text-xs font-bold text-utama mb-1">Jawaban AI:</span>
            {aiAnswer}
          </div>
        )}
      </section>

      {/* Ulasan Pembeli & Form (US-38) */}
      <section className="flex flex-col gap-6 border-t border-garis pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-teks">Ulasan Pembeli (US-38)</h2>
            <p className="text-xs text-teks-lembut">
              {reviews.length} ulasan yang telah diverifikasi
            </p>
          </div>
        </div>

        {/* List Ulasan Approved */}
        {reviews.length === 0 ? (
          <p className="text-sm text-teks-lembut italic">
            Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-garis bg-latar p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{r.nama}</span>
                  <span className="text-xs text-amber-500 font-bold">
                    {"★".repeat(r.rating)}
                  </span>
                </div>
                <p className="text-xs text-teks leading-relaxed">{r.komentar}</p>
                <span className="text-[10px] text-teks-lembut">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form Tambah Ulasan */}
        <form
          onSubmit={handleKirimUlasan}
          className="rounded-2xl border border-garis bg-latar p-5 max-w-lg flex flex-col gap-3"
        >
          <h3 className="text-sm font-bold text-teks">Tulis Ulasan Anda</h3>

          {reviewStatus?.error && (
            <p className="rounded-lg border border-bahaya/20 bg-bahaya/5 p-2 text-xs text-bahaya">
              {reviewStatus.error}
            </p>
          )}
          {reviewStatus?.sukses && (
            <p className="rounded-lg border border-utama/20 bg-utama/5 p-2 text-xs text-utama">
              {reviewStatus.sukses}
            </p>
          )}

          {/* Honeypot field (tersembunyi untuk bot anti-spam) */}
          <input
            type="text"
            name="website_url"
            value={reviewHoneypot}
            onChange={(e) => setReviewHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <label className="flex flex-col gap-1 text-xs font-semibold">
            Nama Anda *
            <input
              type="text"
              required
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold">
            Rating *
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 - Sangat Puas)</option>
              <option value={4}>⭐⭐⭐⭐ (4 - Bagus)</option>
              <option value={3}>⭐⭐⭐ (3 - Cukup)</option>
              <option value={2}>⭐⭐ (2 - Kurang)</option>
              <option value={1}>⭐ (1 - Kecewa)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold">
            Komentar / Pengalaman *
            <textarea
              required
              rows={3}
              maxLength={500}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm focus:border-utama focus:outline-none"
              placeholder="Ceritakan kualitas produk, rasa, atau ketahanan..."
            />
          </label>

          <button
            type="submit"
            disabled={reviewSubmitting}
            className="rounded-lg bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap self-start disabled:opacity-50"
          >
            {reviewSubmitting ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </form>
      </section>

      {/* Produk Terkait (US-17) */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-garis pt-8">
          <h2 className="text-xl font-bold text-teks">Produk Terkait (US-17)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/produk/${p.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-garis bg-latar p-2.5 hover:shadow-md transition-shadow"
              >
                <img
                  src={p.foto_url || "/produk/kopi.svg"}
                  alt=""
                  className="aspect-square w-full rounded-lg object-cover bg-permukaan mb-2"
                />
                <p className="text-xs font-semibold text-teks truncate group-hover:text-utama">
                  {p.nama}
                </p>
                <p className="text-xs font-bold text-harga">{formatRupiah(p.harga)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
