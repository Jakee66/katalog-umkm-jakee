import { buatKoneksiServer } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadProductImage(file) {
  if (!file || typeof file === "string" || !file.size) {
    return { success: false, error: "File tidak ditemukan." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Format file tidak didukung. Harap unggah format JPG, PNG, atau WEBP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "Ukuran file terlalu besar. Maksimal 5 MB.",
    };
  }

  try {
    const supabase = buatKoneksiServer();
    const extension = file.name.split(".").pop() || "jpg";
    const uniqueName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("produk")
      .upload(uniqueName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("produk").getPublicUrl(uniqueName);

    return { success: true, url: publicUrl, fileName: uniqueName };
  } catch (err) {
    return { success: false, error: err.message || "Gagal mengunggah foto ke storage." };
  }
}

export async function deleteProductImage(fileUrl) {
  if (!fileUrl) return;
  try {
    const supabase = buatKoneksiServer();
    const urlParts = fileUrl.split("/produk/");
    if (urlParts.length > 1) {
      const fileName = urlParts[1];
      await supabase.storage.from("produk").remove([fileName]);
    }
  } catch {
    // Abaikan jika bukan gambar di bucket produk
  }
}

