import { buatKoneksiServer } from "@/lib/supabase/server";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://katalog-umkm-jakee.vercel.app";

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/keranjang`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/favorit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bandingkan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  let dynamicRoutes = [];

  try {
    const supabase = buatKoneksiServer();

    // Ambil produk aktif saja (US-32 & US-27)
    const { data: produkList } = await supabase
      .from("produk")
      .select("id, updated_at")
      .eq("is_active", true);

    if (produkList) {
      produkList.forEach((prod) => {
        dynamicRoutes.push({
          url: `${baseUrl}/produk/${prod.id}`,
          lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.9,
        });
      });
    }

    // Ambil kategori aktif
    const { data: kategoriList } = await supabase
      .from("kategori")
      .select("slug, updated_at");

    if (kategoriList) {
      kategoriList.forEach((kat) => {
        if (kat.slug) {
          dynamicRoutes.push({
            url: `${baseUrl}/kategori/${kat.slug}`,
            lastModified: kat.updated_at ? new Date(kat.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      });
    }
  } catch (err) {
    console.warn("Gagal membuat dynamic sitemap:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
