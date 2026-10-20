import { NextResponse } from "next/server";
import { buatKoneksiAdmin, buatKoneksiServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const adminClient = await buatKoneksiAdmin();
    const {
      data: { user },
      error: authError,
    } = await adminClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = buatKoneksiServer();
    const { data: produkList, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fungsi netralkan CSV Injection (US-35)
    const sanitizeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      // Netralkan jika diawali karakter formula berbahaya: = + - @ \t \r
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      "ID",
      "Nama Produk",
      "Harga",
      "Kategori",
      "Status Stok",
      "Harga Coret",
      "Badge",
      "Status Aktif",
      "Deskripsi",
      "Foto URL",
    ];

    const rows = (produkList || []).map((p) => [
      sanitizeCsvCell(p.id),
      sanitizeCsvCell(p.nama),
      sanitizeCsvCell(p.harga),
      sanitizeCsvCell(p.kategori),
      sanitizeCsvCell(p.stock_status || "tersedia"),
      sanitizeCsvCell(p.harga_coret || ""),
      sanitizeCsvCell(p.badge || ""),
      sanitizeCsvCell(p.is_active !== false ? "Aktif" : "Nonaktif"),
      sanitizeCsvCell(p.deskripsi || ""),
      sanitizeCsvCell(p.foto_url || ""),
    ]);

    // Tambahkan UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel (US-35)
    const csvContent =
      "\uFEFF" +
      headers.map(sanitizeCsvCell).join(",") +
      "\r\n" +
      rows.map((r) => r.join(",")).join("\r\n");

    const tanggal = new Date().toISOString().split("T")[0];
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="katalog_produk_${tanggal}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

