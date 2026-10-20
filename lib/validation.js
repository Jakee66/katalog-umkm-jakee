/**
 * Validator skema server-side ringan (setara zod) tanpa dependensi eksternal.
 */
export function validateProductData(formData) {
  const errors = {};
  const nama = formData.get("nama")?.toString()?.trim() || "";
  const hargaRaw = formData.get("harga")?.toString() || "";
  const kategori = formData.get("kategori")?.toString()?.trim() || "";
  const foto_url = formData.get("foto_url")?.toString()?.trim() || "";
  const deskripsi = formData.get("deskripsi")?.toString()?.trim() || "";
  const stock_status = formData.get("stock_status")?.toString() || "tersedia";
  const harga_coretRaw = formData.get("harga_coret")?.toString() || "";
  const badge = formData.get("badge")?.toString() || "";
  const sort_orderRaw = formData.get("sort_order")?.toString() || "0";

  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  } else if (nama.length < 3) {
    errors.nama = "Nama produk minimal 3 karakter.";
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    errors.harga = "Harga harus berupa angka positif.";
  }

  let harga_coret = null;
  if (harga_coretRaw) {
    harga_coret = parseInt(harga_coretRaw, 10);
    if (isNaN(harga_coret) || harga_coret < 0) {
      errors.harga_coret = "Harga coret harus berupa angka positif.";
    } else if (harga_coret <= harga) {
      errors.harga_coret = "Harga coret harus lebih besar dari harga jual.";
    }
  }

  const sort_order = parseInt(sort_orderRaw, 10) || 0;

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      values: {
        nama,
        harga: hargaRaw,
        kategori,
        foto_url,
        deskripsi,
        stock_status,
        harga_coret: harga_coretRaw,
        badge,
        sort_order: sort_orderRaw,
      },
    };
  }

  return {
    success: true,
    data: {
      nama,
      harga,
      kategori,
      foto_url: foto_url || "/produk/kopi.svg",
      deskripsi,
      stock_status,
      harga_coret,
      badge: badge || null,
      sort_order,
    },
  };
}
