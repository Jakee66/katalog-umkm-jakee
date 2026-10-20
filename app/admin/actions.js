"use server";

import { buatKoneksiAdmin, buatKoneksiServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateProductData } from "@/lib/validation";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";
import { logAdminActivity } from "@/lib/logs";

async function requireAdminAuth() {
  const supabase = await buatKoneksiAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Sesi login Anda tidak valid atau telah berakhir.");
  }

  return { supabase, user };
}

// -----------------------------------------------------------------------------
// US-04: LOGIN & LOGOUT
// -----------------------------------------------------------------------------
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
    const { data, error } = await supabase.auth.signInWithPassword({
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
    } else if (data?.user) {
      await logAdminActivity({
        adminId: data.user.id,
        adminEmail: data.user.email,
        aksi: "LOGIN",
        detail: "Admin berhasil masuk ke sistem.",
      });
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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logAdminActivity({
        adminId: user.id,
        adminEmail: user.email,
        aksi: "LOGOUT",
        detail: "Admin keluar dari sistem.",
      });
    }
    await supabase.auth.signOut();
  } catch {
    // Abaikan
  }

  revalidatePath("/", "layout");
  redirect("/admin/login");
}

// -----------------------------------------------------------------------------
// US-05: GANTI PASSWORD
// -----------------------------------------------------------------------------
export async function gantiPassword(prevState, formData) {
  const form =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const passwordBaru = form?.get("password_baru")?.toString() || "";
  const konfirmasiPassword = form?.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  try {
    const { supabase, user } = await requireAdminAuth();
    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "GANTI_PASSWORD",
      detail: "Password admin berhasil diperbarui.",
    });

    return { sukses: true, pesan: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan pada server." };
  }
}

// -----------------------------------------------------------------------------
// US-08: TAMBAH PRODUK + US-29 UPLOAD FOTO + US-34 VALIDASI
// -----------------------------------------------------------------------------
export async function tambahProduk(prevState, formData) {
  let userEmail = "";
  let userId = "";

  try {
    const auth = await requireAdminAuth();
    userEmail = auth.user.email;
    userId = auth.user.id;
  } catch (err) {
    return { error: err.message };
  }

  // 1. Validasi Input Server-side (US-34)
  const validation = validateProductData(formData);
  if (!validation.success) {
    return { errors: validation.errors, values: validation.values };
  }

  const { data: validatedData } = validation;
  let finalFotoUrl = validatedData.foto_url;

  // 2. Upload file foto jika disertakan (US-29)
  const file = formData.get("foto_file");
  if (file && typeof file === "object" && file.size > 0) {
    const uploadRes = await uploadProductImage(file);
    if (!uploadRes.success) {
      return { errors: { foto_file: uploadRes.error }, values: validation.values };
    }
    finalFotoUrl = uploadRes.url;
  }

  try {
    const supabase = buatKoneksiServer();
    const slug =
      validatedData.nama
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    const { data: newProd, error } = await supabase
      .from("produk")
      .insert({
        nama: validatedData.nama,
        harga: validatedData.harga,
        kategori: validatedData.kategori,
        foto_url: finalFotoUrl,
        deskripsi: validatedData.deskripsi,
        stock_status: validatedData.stock_status,
        harga_coret: validatedData.harga_coret,
        badge: validatedData.badge,
        sort_order: validatedData.sort_order,
        slug,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      return { error: "Gagal menyimpan produk ke database: " + error.message };
    }

    // Tangani galeri foto tambahan (US-18, US-29)
    const galleryFiles = formData.getAll("galeri_files");
    if (galleryFiles && galleryFiles.length > 0) {
      let urut = 1;
      for (const gFile of galleryFiles) {
        if (gFile && gFile.size > 0) {
          const gUpload = await uploadProductImage(gFile);
          if (gUpload.success) {
            await supabase.from("product_images").insert({
              product_id: newProd.id,
              foto_url: gUpload.url,
              sort_order: urut++,
            });
          }
        }
      }
    }

    // Tangani varian produk jika ada (US-12, US-48)
    const varianNamaList = formData.getAll("varian_nama");
    const varianHargaList = formData.getAll("varian_harga");
    const varianStokList = formData.getAll("varian_stok");
    if (varianNamaList && varianNamaList.length > 0) {
      for (let i = 0; i < varianNamaList.length; i++) {
        const vNama = varianNamaList[i]?.toString()?.trim();
        const vHarga = parseInt(varianHargaList[i]?.toString() || "0", 10);
        const vStok = parseInt(varianStokList[i]?.toString() || "0", 10);
        if (vNama && !isNaN(vHarga)) {
          await supabase.from("product_variants").insert({
            product_id: newProd.id,
            nama: vNama,
            harga: vHarga,
            stok: vStok,
          });
        }
      }
    }

    await logAdminActivity({
      adminId: userId,
      adminEmail: userEmail,
      aksi: "TAMBAH_PRODUK",
      detail: `Menambahkan produk baru: ${validatedData.nama} (ID: ${newProd.id})`,
    });
  } catch (err) {
    return { error: err.message || "Gagal memproses penambahan produk." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

// -----------------------------------------------------------------------------
// US-09: UBAH PRODUK
// -----------------------------------------------------------------------------
export async function ubahProduk(id, prevState, formData) {
  let userEmail = "";
  let userId = "";

  try {
    const auth = await requireAdminAuth();
    userEmail = auth.user.email;
    userId = auth.user.id;
  } catch (err) {
    return { error: err.message };
  }

  const validation = validateProductData(formData);
  if (!validation.success) {
    return { errors: validation.errors, values: validation.values };
  }

  const { data: validatedData } = validation;
  let finalFotoUrl = validatedData.foto_url;

  const file = formData.get("foto_file");
  if (file && typeof file === "object" && file.size > 0) {
    const uploadRes = await uploadProductImage(file);
    if (!uploadRes.success) {
      return { errors: { foto_file: uploadRes.error }, values: validation.values };
    }
    finalFotoUrl = uploadRes.url;
  }

  try {
    const supabase = buatKoneksiServer();
    const { error } = await supabase
      .from("produk")
      .update({
        nama: validatedData.nama,
        harga: validatedData.harga,
        kategori: validatedData.kategori,
        foto_url: finalFotoUrl,
        deskripsi: validatedData.deskripsi,
        stock_status: validatedData.stock_status,
        harga_coret: validatedData.harga_coret,
        badge: validatedData.badge,
        sort_order: validatedData.sort_order,
      })
      .eq("id", id);

    if (error) {
      return { error: "Gagal memperbarui produk: " + error.message };
    }

    // Tangani galeri foto tambahan baru jika ada
    const galleryFiles = formData.getAll("galeri_files");
    if (galleryFiles && galleryFiles.length > 0) {
      let urut = 10;
      for (const gFile of galleryFiles) {
        if (gFile && gFile.size > 0) {
          const gUpload = await uploadProductImage(gFile);
          if (gUpload.success) {
            await supabase.from("product_images").insert({
              product_id: id,
              foto_url: gUpload.url,
              sort_order: urut++,
            });
          }
        }
      }
    }

    // Tangani varian produk
    const varianNamaList = formData.getAll("varian_nama");
    const varianHargaList = formData.getAll("varian_harga");
    const varianStokList = formData.getAll("varian_stok");
    if (varianNamaList && varianNamaList.length > 0) {
      await supabase.from("product_variants").delete().eq("product_id", id);
      for (let i = 0; i < varianNamaList.length; i++) {
        const vNama = varianNamaList[i]?.toString()?.trim();
        const vHarga = parseInt(varianHargaList[i]?.toString() || "0", 10);
        const vStok = parseInt(varianStokList[i]?.toString() || "0", 10);
        if (vNama && !isNaN(vHarga)) {
          await supabase.from("product_variants").insert({
            product_id: id,
            nama: vNama,
            harga: vHarga,
            stok: vStok,
          });
        }
      }
    }

    await logAdminActivity({
      adminId: userId,
      adminEmail: userEmail,
      aksi: "UBAH_PRODUK",
      detail: `Memperbarui data produk: ${validatedData.nama} (ID: ${id})`,
    });
  } catch (err) {
    return { error: err.message || "Gagal menyimpan perubahan produk." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

// -----------------------------------------------------------------------------
// US-10: HAPUS PRODUK
// -----------------------------------------------------------------------------
export async function hapusProduk(id) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    // Dapatkan info produk untuk log & hapus foto storage
    const { data: prod } = await supabase
      .from("produk")
      .select("nama, foto_url")
      .eq("id", id)
      .maybeSingle();

    if (prod?.foto_url) {
      await deleteProductImage(prod.foto_url);
    }

    // Hapus relasi gambar galeri
    const { data: images } = await supabase
      .from("product_images")
      .select("foto_url")
      .eq("product_id", id);

    if (images && images.length > 0) {
      for (const img of images) {
        await deleteProductImage(img.foto_url);
      }
    }

    const { error } = await supabase.from("produk").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "HAPUS_PRODUK",
      detail: `Menghapus produk: ${prod?.nama || id} (ID: ${id})`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message || "Gagal menghapus produk." };
  }
}

// -----------------------------------------------------------------------------
// US-32: TOGGLE AKTIF / NONAKTIFKAN PRODUK
// -----------------------------------------------------------------------------
export async function toggleStatusProduk(id, currentStatus) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from("produk")
      .update({ is_active: newStatus })
      .eq("id", id);

    if (error) return { error: error.message };

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "TOGGLE_PRODUK",
      detail: `Mengubah status produk ID ${id} menjadi ${newStatus ? "Aktif" : "Nonaktif"}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true, is_active: newStatus };
  } catch (err) {
    return { error: err.message };
  }
}

// -----------------------------------------------------------------------------
// US-47: UBAH URUTAN TAMPIL PRODUK (NAIK / TURUN)
// -----------------------------------------------------------------------------
export async function ubahUrutanProduk(id, delta) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    const { data: prod } = await supabase
      .from("produk")
      .select("sort_order")
      .eq("id", id)
      .single();

    if (!prod) return { error: "Produk tidak ditemukan." };

    const newOrder = (prod.sort_order || 0) + delta;
    await supabase.from("produk").update({ sort_order: newOrder }).eq("id", id);

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "URUTAN_PRODUK",
      detail: `Menggeser urutan produk ID ${id} sebesar ${delta} (kini: ${newOrder})`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

// -----------------------------------------------------------------------------
// US-31: KELOLA KATEGORI
// -----------------------------------------------------------------------------
export async function simpanKategori(formData) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    const id = formData.get("id");
    const nama = formData.get("nama")?.toString()?.trim() || "";
    const sort_order = parseInt(formData.get("sort_order")?.toString() || "0", 10);

    if (!nama) return { error: "Nama kategori wajib diisi." };

    const slug = nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (id) {
      const { error } = await supabase
        .from("kategori")
        .update({ nama, slug, sort_order })
        .eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("kategori")
        .insert({ nama, slug, sort_order });
      if (error) return { error: error.message };
    }

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: id ? "UBAH_KATEGORI" : "TAMBAH_KATEGORI",
      detail: `${id ? "Memperbarui" : "Menambahkan"} kategori: ${nama}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

export async function hapusKategori(id, namaKategori) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    // Validasi: tolak hapus jika masih dipakai oleh produk (US-31)
    const { count, error: countErr } = await supabase
      .from("produk")
      .select("id", { count: "exact", head: true })
      .or(`category_id.eq.${id},kategori.eq.${namaKategori}`);

    if (count && count > 0) {
      return {
        error: `Kategori "${namaKategori}" tidak dapat dihapus karena masih digunakan oleh ${count} produk. Ubah atau hapus produk terkait terlebih dahulu.`,
      };
    }

    const { error } = await supabase.from("kategori").delete().eq("id", id);
    if (error) return { error: error.message };

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "HAPUS_KATEGORI",
      detail: `Menghapus kategori ID: ${id} (${namaKategori})`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

// -----------------------------------------------------------------------------
// US-39: MODERASI ULASAN
// -----------------------------------------------------------------------------
export async function ubahStatusUlasan(id, status) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    if (status === "delete") {
      await supabase.from("reviews").delete().eq("id", id);
    } else {
      await supabase.from("reviews").update({ status }).eq("id", id);
    }

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "MODERASI_ULASAN",
      detail: `Mengubah status ulasan ID ${id} menjadi: ${status}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

// -----------------------------------------------------------------------------
// US-42: KELOLA BANNER PROMO
// -----------------------------------------------------------------------------
export async function simpanBanner(formData) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    const id = formData.get("id");
    const judul = formData.get("judul")?.toString()?.trim() || "";
    const teks = formData.get("teks")?.toString()?.trim() || "";
    let gambar_url = formData.get("gambar_url")?.toString()?.trim() || "";
    const tautan = formData.get("tautan")?.toString()?.trim() || "";
    const is_active = formData.get("is_active") === "true" || formData.get("is_active") === "on";

    if (!judul) return { error: "Judul banner wajib diisi." };

    const file = formData.get("gambar_file");
    if (file && typeof file === "object" && file.size > 0) {
      const uploadRes = await uploadProductImage(file);
      if (uploadRes.success) {
        gambar_url = uploadRes.url;
      }
    }

    if (!gambar_url) {
      gambar_url = "/produk/kopi.svg";
    }

    if (id) {
      await supabase
        .from("banners")
        .update({ judul, teks, gambar_url, tautan, is_active })
        .eq("id", id);
    } else {
      await supabase
        .from("banners")
        .insert({ judul, teks, gambar_url, tautan, is_active });
    }

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: id ? "UBAH_BANNER" : "TAMBAH_BANNER",
      detail: `${id ? "Memperbarui" : "Menambahkan"} banner promo: ${judul}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

export async function hapusBanner(id) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();
    await supabase.from("banners").delete().eq("id", id);

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "HAPUS_BANNER",
      detail: `Menghapus banner promo ID: ${id}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

// -----------------------------------------------------------------------------
// US-43: PENGATURAN TOKO
// -----------------------------------------------------------------------------
export async function simpanPengaturanToko(formData) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    const nama_toko = formData.get("nama_toko")?.toString()?.trim() || "";
    const tagline = formData.get("tagline")?.toString()?.trim() || "";
    const no_wa = formData.get("no_wa")?.toString()?.trim() || "";
    const alamat = formData.get("alamat")?.toString()?.trim() || "";
    const jam_buka = formData.get("jam_buka")?.toString()?.trim() || "";
    const instagram = formData.get("instagram")?.toString()?.trim() || "";
    const facebook = formData.get("facebook")?.toString()?.trim() || "";
    const template_pesan_wa = formData.get("template_pesan_wa")?.toString()?.trim() || "";

    if (!nama_toko || !no_wa) {
      return { error: "Nama toko dan Nomor WhatsApp wajib diisi." };
    }

    const { error } = await supabase.from("store_settings").upsert({
      id: 1,
      nama_toko,
      tagline,
      no_wa,
      alamat,
      jam_buka,
      instagram,
      facebook,
      template_pesan_wa,
      updated_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "UBAH_PENGATURAN",
      detail: `Memperbarui pengaturan identitas toko (${nama_toko})`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

// -----------------------------------------------------------------------------
// US-44: KELOLA AKUN ADMIN
// -----------------------------------------------------------------------------
export async function tambahAkunAdmin(formData) {
  try {
    const { user } = await requireAdminAuth();
    const supabase = buatKoneksiServer();

    const email = formData.get("email")?.toString()?.trim() || "";
    const password = formData.get("password")?.toString() || "";
    const nama = formData.get("nama")?.toString()?.trim() || "";

    if (!email || !password) {
      return { error: "Email dan password wajib diisi." };
    }
    if (password.length < 8) {
      return { error: "Password admin baru minimal 8 karakter." };
    }

    // 1. Daftarkan di Supabase Auth via admin API jika didukung
    try {
      const adminClient = await buatKoneksiAdmin();
      await adminClient.auth.admin?.createUser?.({
        email,
        password,
        email_confirm: true,
      });
    } catch {
      // Fallback ke penyimpanan tabel admin_users
    }

    // 2. Simpan di tabel admin_users
    await supabase.from("admin_users").insert({
      email,
      nama: nama || email.split("@")[0],
      password_hash: "hashed",
      is_active: true,
    });

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "TAMBAH_ADMIN",
      detail: `Mendaftarkan akun admin baru: ${email}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}

export async function toggleAkunAdmin(adminId, currentEmail, currentActive) {
  try {
    const { user } = await requireAdminAuth();
    if (user.id === adminId || user.email === currentEmail) {
      return { error: "Anda tidak dapat menonaktifkan akun Anda sendiri." };
    }

    const supabase = buatKoneksiServer();
    await supabase
      .from("admin_users")
      .update({ is_active: !currentActive })
      .eq("id", adminId);

    await logAdminActivity({
      adminId: user.id,
      adminEmail: user.email,
      aksi: "TOGGLE_ADMIN",
      detail: `Mengubah status akun admin ${currentEmail} menjadi ${!currentActive ? "Aktif" : "Nonaktif"}`,
    });

    revalidatePath("/", "layout");
    return { sukses: true };
  } catch (err) {
    return { error: err.message };
  }
}
