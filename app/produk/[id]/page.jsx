import { notFound } from "next/navigation";
import { buatKoneksiServer } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import DetailProdukClient from "@/components/DetailProdukClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = buatKoneksiServer();
  const store = await getStoreSettings();

  const { data: produk } = await supabase
    .from("produk")
    .select("nama, deskripsi, foto_url")
    .eq("id", id)
    .maybeSingle();

  if (!produk) {
    return { title: "Produk Tidak Ditemukan" };
  }

  const title = `${produk.nama} | ${store.nama}`;
  const description =
    produk.deskripsi?.slice(0, 160) || `Beli ${produk.nama} di ${store.nama}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: produk.foto_url ? [{ url: produk.foto_url }] : [],
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = buatKoneksiServer();
  const storeSettings = await getStoreSettings();

  // 1. Ambil data produk
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  // Jika produk nonaktif, tampilkan 404 bagi pengunjung (US-32)
  if (produk.is_active === false) {
    notFound();
  }

  // 2. Ambil foto galeri (US-18)
  let galleryImages = [];
  try {
    const { data: imgs } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("sort_order", { ascending: true });
    galleryImages = imgs || [];
  } catch {
    // Abaikan
  }

  // 3. Ambil varian produk (US-12, US-48)
  let variants = [];
  try {
    const { data: vars } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("harga", { ascending: true });
    variants = vars || [];
  } catch {
    // Abaikan
  }

  // 4. Ambil ulasan approved (US-38)
  let reviews = [];
  try {
    const { data: revs } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    reviews = revs || [];
  } catch {
    // Abaikan
  }

  // 5. Ambil produk terkait dari kategori sama (US-17)
  let relatedProducts = [];
  if (produk.kategori) {
    try {
      const { data: rel } = await supabase
        .from("produk")
        .select("id, nama, harga, foto_url")
        .eq("kategori", produk.kategori)
        .neq("id", id)
        .neq("is_active", false)
        .limit(4);
      relatedProducts = rel || [];
    } catch {
      // Abaikan
    }
  }

  return (
    <DetailProdukClient
      produk={produk}
      galleryImages={galleryImages}
      variants={variants}
      reviews={reviews}
      storeSettings={storeSettings}
      relatedProducts={relatedProducts}
    />
  );
}
