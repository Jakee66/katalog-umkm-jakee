/**
 * Modul AI Terpusat untuk US-14 (Deskripsi Produk) & US-50 (Tanya Jawab Produk)
 * Menggunakan Gemini API secara server-side.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateProductDescription({ nama, kategori }) {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error:
        "Kunci API AI (GEMINI_API_KEY) belum diisi di environment variable (.env.local). Silakan tambahkan kunci API dari Google AI Studio untuk mengaktifkan fitur ini.",
    };
  }

  const prompt = `Anda adalah copywriter profesional untuk katalog produk UMKM lokal Indonesia.
Buatlah deskripsi produk yang menarik, ramah, dan menggugah selera/minat pembeli dalam Bahasa Indonesia (maksimal 2-3 kalimat ringkas).
Nama Produk: ${nama}
Kategori: ${kategori || "Umum"}

Langsung berikan hasil teks deskripsinya tanpa tanda kutip pembuka/penutup atau teks pengantar.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData?.error?.message ||
          `Terjadi kesalahan saat memanggil Gemini API (Status: ${res.status}).`,
      };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return { success: false, error: "AI tidak mengembalikan teks deskripsi." };
    }

    return { success: true, text };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Gagal menghubungi layanan AI.",
    };
  }
}

export async function answerProductQuestion({ pertanyaan, produk }) {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error:
        "Fitur asisten tanya jawab AI memerlukan GEMINI_API_KEY di environment variable. Silakan hubungi pengelola toko untuk aktivasi.",
    };
  }

  const systemInstruction = `Anda adalah asisten virtual ramah untuk toko UMKM.
Tugas Anda adalah HANYA menjawab pertanyaan seputar produk berikut berdasarkan data yang diberikan:
Nama Produk: ${produk.nama}
Kategori: ${produk.kategori || "-"}
Harga: Rp ${produk.harga}
Deskripsi: ${produk.deskripsi || "Tidak ada deskripsi detail"}
Status Stok: ${produk.stock_status || "tersedia"}

ATURAN KETAT:
1. Jawab HANYA berdasarkan informasi produk di atas secara singkat, padat, dan sopan dalam Bahasa Indonesia.
2. Jika ditanya hal di luar produk ini (misalnya tentang coding, resep lain, politik, topik umum di luar produk), tolaklah dengan sopan: "Maaf, saya hanya dapat membantu menjawab pertanyaan seputar produk ${produk.nama}."
3. Jangan pernah mengarang informasi yang tidak tertera pada data produk di atas.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nPertanyaan Pembeli: ${pertanyaan}` }],
            },
          ],
          generationConfig: { maxOutputTokens: 250, temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData?.error?.message ||
          "Gagal memproses jawaban AI. Silakan coba kembali nanti.",
      };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return {
      success: true,
      text: text || "Maaf, tidak dapat menghasilkan jawaban saat ini.",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Gagal menghubungi server asisten AI.",
    };
  }
}

