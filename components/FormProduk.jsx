"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormProduk({
  produk = {},
  kategoriList = [],
  action,
  labelTombol = "Simpan produk",
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [variants, setVariants] = useState(produk.variants || []);

  const errors = state?.errors || {};
  const values = state?.values || {};

  const handleGenerateAi = async () => {
    setAiError("");
    const namaInput = document.querySelector('input[name="nama"]')?.value?.trim();
    const kategoriSelect = document.querySelector('select[name="kategori"]')?.value;

    if (!namaInput) {
      setAiError("Isi nama produk terlebih dahulu.");
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaInput, kategori: kategoriSelect }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || "Gagal membuat deskripsi AI.");
      } else if (data.text) {
        setDeskripsi(data.text);
      }
    } catch (err) {
      setAiError(err.message || "Gagal menghubungi layanan AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { nama: "", harga: produk.harga || 0, stok: 10 }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {state?.error && (
        <div className="rounded-xl border border-bahaya/20 bg-bahaya/5 p-4 text-sm text-bahaya">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Input
            label="Nama produk *"
            name="nama"
            defaultValue={values.nama ?? produk.nama ?? ""}
            required
          />
          {errors.nama && (
            <span className="text-xs font-semibold text-bahaya">{errors.nama}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label="Harga Jual (Rp) *"
            name="harga"
            type="number"
            min="0"
            defaultValue={values.harga ?? produk.harga ?? ""}
            required
          />
          {errors.harga && (
            <span className="text-xs font-semibold text-bahaya">{errors.harga}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label="Harga Coret / Normal (Rp) (US-20)"
            name="harga_coret"
            type="number"
            min="0"
            placeholder="Opsional, misal: 60000"
            defaultValue={values.harga_coret ?? produk.harga_coret ?? ""}
          />
          {errors.harga_coret && (
            <span className="text-xs font-semibold text-bahaya">{errors.harga_coret}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Kategori
          <select
            name="kategori"
            defaultValue={values.kategori ?? produk.kategori ?? ""}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Pilih Kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id || k.nama} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Status Stok (US-19)
          <select
            name="stock_status"
            defaultValue={values.stock_status ?? produk.stock_status ?? "tersedia"}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="tersedia">Tersedia</option>
            <option value="terbatas">Terbatas</option>
            <option value="habis">Habis (Out of Stock)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Badge Label (US-20)
          <select
            name="badge"
            defaultValue={values.badge ?? produk.badge ?? ""}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Tanpa Badge</option>
            <option value="Baru">Baru</option>
            <option value="Promo">Promo</option>
            <option value="Terlaris">Terlaris</option>
          </select>
        </label>
      </div>

      {/* Bagian Foto Produk (US-29 Upload ke Storage) */}
      <div className="rounded-xl border border-garis bg-permukaan/40 p-4 flex flex-col gap-3">
        <span className="text-sm font-bold text-teks">Foto Utama Produk (US-29)</span>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="file"
            name="foto_file"
            accept="image/png, image/jpeg, image/webp"
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-utama file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-utama-gelap cursor-pointer"
          />
          <span className="text-xs text-teks-lembut">atau gunakan URL luar:</span>
        </div>
        <Input
          label="Link URL Foto"
          name="foto_url"
          placeholder="https://... atau /produk/nama-file.svg"
          defaultValue={values.foto_url ?? produk.foto_url ?? ""}
        />
        {errors.foto_file && (
          <span className="text-xs font-semibold text-bahaya">{errors.foto_file}</span>
        )}

        <div className="mt-2 border-t border-garis pt-3">
          <span className="text-xs font-bold text-teks">Galeri Foto Tambahan (US-18)</span>
          <p className="text-xs text-teks-lembut mb-2">Bisa memilih lebih dari 1 file gambar.</p>
          <input
            type="file"
            name="galeri_files"
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-permukaan file:border file:border-garis file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-teks cursor-pointer"
          />
        </div>
      </div>

      {/* Deskripsi & Generator AI (US-14) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Deskripsi Produk</label>
          <button
            type="button"
            onClick={handleGenerateAi}
            disabled={isAiLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-1 text-xs font-bold text-utama hover:border-utama hover:bg-permukaan transition-colors"
          >
            {isAiLoading ? "Sedang membuat..." : "✨ Buat Deskripsi dengan AI (US-14)"}
          </button>
        </div>
        {aiError && (
          <p className="rounded-md border border-bahaya/20 bg-bahaya/5 p-2 text-xs text-bahaya">
            {aiError}
          </p>
        )}
        <textarea
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          placeholder="Jelaskan keunggulan dan rasa produk..."
        />
      </div>

      {/* Varian Produk (US-12, US-48) */}
      <div className="rounded-xl border border-garis bg-permukaan/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-bold text-teks">Varian Harga & Ukuran (US-12, US-48)</span>
            <p className="text-xs text-teks-lembut">Contoh: 250 gram, 500 gram, Ukuran L.</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold hover:border-utama"
          >
            + Tambah Varian
          </button>
        </div>

        {variants.length === 0 ? (
          <p className="text-xs text-teks-lembut italic">
            Belum ada varian khusus. Harga produk utama akan digunakan.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  name="varian_nama"
                  placeholder="Nama varian"
                  defaultValue={v.nama}
                  required
                  className="flex-1 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm"
                />
                <input
                  name="varian_harga"
                  type="number"
                  placeholder="Harga (Rp)"
                  defaultValue={v.harga}
                  required
                  className="w-28 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm"
                />
                <input
                  name="varian_stok"
                  type="number"
                  placeholder="Stok"
                  defaultValue={v.stok ?? 10}
                  className="w-20 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-bahaya text-xs font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
