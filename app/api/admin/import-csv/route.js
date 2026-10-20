import { NextResponse } from "next/server";
import { buatKoneksiAdmin, buatKoneksiServer } from "@/lib/supabase/server";
import { logAdminActivity } from "@/lib/logs";

export async function POST(request) {
  try {
    const adminClient = await buatKoneksiAdmin();
    const { data: { user }, error: authErr } = await adminClient.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Tidak ada data produk yang valid." }, { status: 400 });
    }

    const supabase = buatKoneksiServer();
    const { data, error } = await supabase.from("produk").insert(items).select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "IMPOR_CSV",
      detail: `Berhasil mengimpor ${items.length} produk dari file CSV.`,
    });

    return NextResponse.json({ success: true, count: data?.length || items.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

