import { NextResponse } from "next/server";
import { buatKoneksiServer } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const idsStr = searchParams.get("ids") || "";
  const ids = idsStr
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))
    .slice(0, 2);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const supabase = buatKoneksiServer();
    const { data: products, error } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, foto_url, deskripsi, stock_status, badge")
      .in("id", ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
