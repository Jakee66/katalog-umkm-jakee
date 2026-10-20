import { NextResponse } from "next/server";

export async function GET() {
  const headers = ["Nama Produk", "Harga", "Kategori", "Status Stok", "Deskripsi"];
  const samples = [
    ['"Keripik Pisang Madu"', "20000", '"Camilan"', '"tersedia"', '"Keripik pisang manis gurih"'],
    ['"Kopi Arabika 200g"', "55000", '"Minuman"', '"tersedia"', '"Biji kopi arabika gayo asli"'],
  ];

  const csvContent =
    "\uFEFF" +
    headers.join(",") +
    "\r\n" +
    samples.map((s) => s.join(",")).join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template_impor_produk.csv"',
    },
  });
}

