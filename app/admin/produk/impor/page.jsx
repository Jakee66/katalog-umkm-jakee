"use client";

import { useState } from "react";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";

export default function HalamanImporProduk() {
  const [csvRows, setCsvRows] = useState([]);
  const [report, setReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result?.toString() || "";
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert("File CSV kosong atau hanya berisi baris header.");
        return;
      }

      // Parsing CSV sederhana
      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        // Regex split untuk koma dengan tanda kutip
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) =>
          c.replace(/^"(.*)"$/, "$1").replace(/""/g, '"').trim()
        );
        dataRows.push({
          baris: i + 1,
          nama: cols[0] || "",
          harga: cols[1] || "",
          kategori: cols[2] || "",
          stock_status: cols[3] || "tersedia",
          deskripsi: cols[4] || "",
        });
      }
      setCsvRows(dataRows);
      setReport(null);
    };
    reader.readAsText(file);
  };

  const handleProsesImpor = async () => {
    if (csvRows.length === 0) return;
    setIsProcessing(true);

    const validRows = [];
    const failedRows = [];

    csvRows.forEach((row) => {
      const hargaNum = parseInt(row.harga, 10);
      if (!row.nama || isNaN(hargaNum) || hargaNum < 0) {
        failedRows.push({
          baris: row.baris,
          nama: row.nama || "(Kosong)",
          alasan: !row.nama ? "Nama wajib diisi" : "Harga harus angka valid positif",
        });
      } else {
        validRows.push({
          nama: row.nama,
          harga: hargaNum,
          kategori: row.kategori || "Umum",
          stock_status: row.stock_status || "tersedia",
          deskripsi: row.deskripsi || "",
          foto_url: "/produk/kopi.svg",
          is_active: true,
        });
      }
    });

    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: validRows }),
      });
      const resData = await res.json();

      setReport({
        berhasil: validRows.length,
        gagal: failedRows.length,
        failedRows,
        errorServer: res.ok ? null : resData?.error,
      });
    } catch (err) {
      alert("Gagal mengimpor: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Impor Produk dari CSV (US-46)</h1>
          <p className="text-sm text-teks-lembut">
            Masukkan banyak produk sekaligus melalui file spreadsheet CSV.
          </p>
        </div>
        <a
          href="/api/admin/template-csv"
          className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs font-semibold hover:bg-permukaan"
        >
          ⬇ Unduh Template CSV
        </a>
      </div>

      <div className="rounded-xl border border-garis bg-latar p-6 flex flex-col gap-4">
        <label className="text-sm font-semibold">Pilih File CSV Produk</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-utama file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-utama-gelap"
        />

        {csvRows.length > 0 && !report && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                Pratinjau Data ({csvRows.length} baris terbaca):
              </span>
              <Tombol onClick={handleProsesImpor} disabled={isProcessing}>
                {isProcessing ? "Mengimpor..." : "✓ Jalankan Impor"}
              </Tombol>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-garis">
              <table className="w-full text-left text-xs">
                <thead className="bg-permukaan text-teks-lembut">
                  <tr>
                    <th className="p-2">Baris</th>
                    <th className="p-2">Nama</th>
                    <th className="p-2">Harga</th>
                    <th className="p-2">Kategori</th>
                    <th className="p-2">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {csvRows.slice(0, 15).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono">{r.baris}</td>
                      <td className="p-2 font-semibold">{r.nama}</td>
                      <td className="p-2">{r.harga}</td>
                      <td className="p-2">{r.kategori}</td>
                      <td className="p-2">{r.stock_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {report && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-garis bg-permukaan/50 p-4">
            <h3 className="font-bold text-sm">Hasil Ringkasan Impor:</h3>
            <div className="flex gap-4 text-sm">
              <span className="font-semibold text-utama">✓ {report.berhasil} baris berhasil diimpor</span>
              <span className="font-semibold text-bahaya">✕ {report.gagal} baris gagal</span>
            </div>

            {report.failedRows && report.failedRows.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-bold text-bahaya">Rincian baris bermasalah:</span>
                <ul className="mt-1 list-disc pl-5 text-xs text-bahaya space-y-1">
                  {report.failedRows.map((fr, idx) => (
                    <li key={idx}>
                      Baris {fr.baris} ("{fr.nama}"): {fr.alasan}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2">
              <Tombol href="/admin">Kembali ke Daftar Produk</Tombol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

