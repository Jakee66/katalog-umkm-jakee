"use server";

import { buatKoneksiAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAdmin(prevState, formData) {
  const form =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const email = form?.get("email")?.toString()?.trim() || "";
  const password = form?.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let errorMessage = null;

  try {
    const supabase = await buatKoneksiAdmin();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid grant")
      ) {
        errorMessage = "Email atau password salah.";
      } else {
        errorMessage = error.message || "Gagal masuk. Periksa kembali akun Anda.";
      }
    }
  } catch (err) {
    errorMessage = err.message || "Terjadi kesalahan pada server.";
  }

  if (errorMessage) {
    return { error: errorMessage };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function keluarAdmin() {
  try {
    const supabase = await buatKoneksiAdmin();
    await supabase.auth.signOut();
  } catch (err) {
    // Abaikan jika sudah keluar atau sesi kadaluarsa
  }

  revalidatePath("/", "layout");
  redirect("/admin/login");
}

