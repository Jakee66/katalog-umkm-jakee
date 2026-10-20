import { NextResponse } from "next/server";
import { answerProductQuestion } from "@/lib/ai";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    // Rate limit K-12: maksimal 10 pertanyaan per 2 menit per IP
    const rate = await checkRateLimit(`ai_chat_${ip}`, 10, 120000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak pertanyaan. Silakan tunggu ${rate.retryAfter} detik lagi.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pertanyaan, productId } = body || {};

    if (!pertanyaan || !productId) {
      return NextResponse.json(
        { error: "Pertanyaan dan ID produk wajib disertakan." },
        { status: 400 }
      );
    }

    if (pertanyaan.length > 300) {
      return NextResponse.json(
        { error: "Pertanyaan terlalu panjang. Maksimal 300 karakter." },
        { status: 400 }
      );
    }

    const supabase = buatKoneksiServer();
    const { data: produk } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, deskripsi, stock_status")
      .eq("id", productId)
      .maybeSingle();

    if (!produk) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

    const result = await answerProductQuestion({ pertanyaan, produk });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ reply: result.text });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

