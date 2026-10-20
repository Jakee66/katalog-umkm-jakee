import { buatKoneksiServer } from "@/lib/supabase/server";
import { toko as fallbackToko } from "@/lib/toko";

export async function getStoreSettings() {
  try {
    const supabase = buatKoneksiServer();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      return {
        nama: data.nama_toko || fallbackToko.nama,
        tagline: data.tagline || fallbackToko.tagline,
        nomorWhatsApp: data.no_wa || fallbackToko.nomorWhatsApp,
        alamat: data.alamat || fallbackToko.alamat,
        jamBuka: data.jam_buka || fallbackToko.jamBuka,
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        templatePesanWa:
          data.template_pesan_wa ||
          "Halo, saya ingin memesan {nama_produk} seharga {harga_produk}. Apakah masih tersedia?",
      };
    }
  } catch (err) {
    // Abaikan jika tabel belum dimigrasi
  }

  return {
    nama: fallbackToko.nama,
    tagline: fallbackToko.tagline,
    nomorWhatsApp: fallbackToko.nomorWhatsApp,
    alamat: fallbackToko.alamat,
    jamBuka: fallbackToko.jamBuka,
    instagram: "",
    facebook: "",
    templatePesanWa:
      "Halo, saya ingin memesan {nama_produk} seharga {harga_produk}. Apakah masih tersedia?",
  };
}

