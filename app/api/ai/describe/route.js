import { NextResponse } from "next/server";
import { generateProductDescription } from "@/lib/ai";
import { buatKoneksiAdmin } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const adminClient = await buatKoneksiAdmin();
    const { data: { user }, error: authErr } = await adminClient.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama, kategori } = body || {};

    if (!nama) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi sebelum membuat deskripsi AI." },
        { status: 400 }
      );
    }

    const result = await generateProductDescription({ nama, kategori });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ text: result.text });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

