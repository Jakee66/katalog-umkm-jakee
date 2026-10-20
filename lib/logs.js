import { buatKoneksiServer } from "@/lib/supabase/server";

export async function logAdminActivity({ adminId = "", adminEmail = "", aksi, detail = "" }) {
  try {
    const supabase = buatKoneksiServer();
    await supabase.from("admin_logs").insert({
      admin_id: adminId || "system",
      admin_email: adminEmail || "admin",
      aksi,
      detail: typeof detail === "object" ? JSON.stringify(detail) : String(detail),
    });
  } catch (err) {
    // Log tidak boleh memutus jalannya aksi utama jika tabel belum siap
  }
}
