import { NextResponse } from "next/server";
import { buatKoneksiServer } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { items } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const ids = items.map((it) => parseInt(it.id, 10)).filter(Boolean);
    const supabase = buatKoneksiServer();

    const { data: dbProducts } = await supabase
      .from("produk")
      .select("id, nama, harga, stock_status, is_active")
      .in("id", ids);

    const prodMap = {};
    (dbProducts || []).forEach((p) => {
      prodMap[p.id] = p;
    });

    const verified = items.map((item) => {
      const real = prodMap[item.id];
      return {
        ...item,
        nama: real ? real.nama : item.nama,
        harga: real ? real.harga : item.harga,
        stock_status: real ? real.stock_status : "tersedia",
        is_active: real ? real.is_active : true,
      };
    });

    return NextResponse.json({ items: verified });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
