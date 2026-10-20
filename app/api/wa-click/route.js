import { NextResponse } from "next/server";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anon";

    // Rate limit K-12
    const rate = await checkRateLimit(`waclick_${ip}`, 30, 60000);
    if (!rate.allowed) {
      return NextResponse.json({ ok: true }); // Tetap kembalikan ok agar tidak menghambat WhatsApp
    }

    const body = await request.json().catch(() => ({}));
    const { productId } = body || {};

    if (productId) {
      const supabase = buatKoneksiServer();
      await supabase.from("wa_clicks").insert({
        product_id: parseInt(productId, 10),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

