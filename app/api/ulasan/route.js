import { NextResponse } from "next/server";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anon";

    // Rate limit K-12: maksimal 5 ulasan per 10 menit per IP
    const rate = await checkRateLimit(`review_${ip}`, 5, 600000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak kiriman ulasan. Silakan tunggu ${rate.retryAfter} detik.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { productId, nama, rating, komentar, honeypot } = body || {};

    // Anti-spam honeypot (US-38)
    if (honeypot) {
      return NextResponse.json({ ok: true }); // Tolak diam-diam
    }

    if (!productId || !nama?.trim() || !komentar?.trim()) {
      return NextResponse.json(
        { error: "Nama dan komentar wajib diisi." },
        { status: 400 }
      );
    }

    const cleanRating = Math.max(1, Math.min(5, parseInt(rating || "5", 10)));
    const cleanKomentar = komentar.trim().slice(0, 500);
    const cleanNama = nama.trim().slice(0, 80);

    const supabase = buatKoneksiServer();
    const { error } = await supabase.from("reviews").insert({
      product_id: parseInt(productId, 10),
      nama: cleanNama,
      rating: cleanRating,
      komentar: cleanKomentar,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: "Gagal menyimpan ulasan. Coba beberapa saat lagi." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan pada sistem." }, { status: 500 });
  }
}
