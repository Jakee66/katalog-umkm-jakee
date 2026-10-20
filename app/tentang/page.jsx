import { getStoreSettings } from "@/lib/settings";
import Link from "next/link";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: `Tentang Kami - ${store.nama}`,
    description: `Profil dan kontak resmi ${store.nama}. ${store.tagline}`,
  };
}

export default async function TentangPage() {
  const store = await getStoreSettings();
  const nomorClean = (store.nomorWhatsApp || "").replace(/\D/g, "");
  const nomorWa = nomorClean.startsWith("0") ? "62" + nomorClean.slice(1) : nomorClean;
  const waUrl = `https://wa.me/${nomorWa}?text=${encodeURIComponent(
    `Halo ${store.nama}, saya ingin bertanya mengenai toko dan produk Anda.`
  )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Header Profil */}
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-utama/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-utama mb-3">
          Profil Usaha
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teks tracking-tight">
          {store.nama}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-teks-lembut max-w-2xl mx-auto leading-relaxed">
          {store.tagline}
        </p>
      </div>

      {/* Grid Informasi Toko */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu Kontak & Operasional */}
        <div className="rounded-2xl border border-garis bg-latar p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-teks flex items-center gap-2 mb-4">
              <span>📍</span> Lokasi & Jam Operasional
            </h2>

            <div className="space-y-4 text-sm text-teks leading-relaxed">
              <div>
                <p className="text-xs font-semibold text-teks-lembut uppercase tracking-wider mb-1">
                  Alamat
                </p>
                <p className="font-medium">{store.alamat || "Alamat belum diatur."}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-teks-lembut uppercase tracking-wider mb-1">
                  Jam Buka
                </p>
                <p className="font-medium">{store.jamBuka || "Setiap hari"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-garis">
            <p className="text-xs font-semibold text-teks-lembut uppercase tracking-wider mb-2">
              Layanan Pelanggan
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <span>💬</span> Hubungi via WhatsApp ({store.nomorWhatsApp})
            </a>
          </div>
        </div>

        {/* Kartu Komitmen & Media Sosial */}
        <div className="rounded-2xl border border-garis bg-latar p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-teks flex items-center gap-2 mb-4">
              <span>🌟</span> Komitmen Kami
            </h2>
            <p className="text-sm text-teks-lembut leading-relaxed mb-6">
              Kami berdedikasi menyajikan produk-produk berkualitas pilihan dengan pelayanan yang ramah, cepat, dan transparan bagi seluruh pelanggan setia kami. Setiap pesanan disiapkan dengan cermat untuk memastikan kepuasan Anda.
            </p>

            {(store.instagram || store.facebook) && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-teks-lembut uppercase tracking-wider">
                  Media Sosial
                </p>
                <div className="flex flex-wrap gap-3">
                  {store.instagram && (
                    <a
                      href={store.instagram.startsWith("http") ? store.instagram : `https://instagram.com/${store.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-garis bg-permukaan px-3.5 py-2 text-xs font-bold text-teks hover:border-utama transition-colors"
                    >
                      <span>📸</span> Instagram
                    </a>
                  )}
                  {store.facebook && (
                    <a
                      href={store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-garis bg-permukaan px-3.5 py-2 text-xs font-bold text-teks hover:border-utama transition-colors"
                    >
                      <span>📘</span> Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-garis">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-garis bg-permukaan px-5 py-3 text-sm font-bold text-teks hover:border-utama transition-colors"
            >
              ← Lihat Katalog Produk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

