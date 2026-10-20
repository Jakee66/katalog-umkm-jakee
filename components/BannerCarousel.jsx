import Link from "next/link";

export default function BannerCarousel({ banners = [] }) {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-4">
      {banners.map((b) => (
        <div
          key={b.id}
          className="relative overflow-hidden rounded-2xl border border-garis bg-gradient-to-r from-utama/10 via-permukaan to-harga-latar/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col gap-2 max-w-lg text-center sm:text-left">
            <span className="w-fit self-center sm:self-start rounded-full bg-utama px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
              Promo Spesial
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-teks leading-tight">
              {b.judul}
            </h3>
            {b.teks && <p className="text-sm text-teks-lembut leading-relaxed">{b.teks}</p>}
            {b.tautan && (
              <Link
                href={b.tautan}
                className="mt-2 w-fit self-center sm:self-start rounded-lg bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition-colors"
              >
                Lihat Penawaran →
              </Link>
            )}
          </div>
          {b.gambar_url && (
            <img
              src={b.gambar_url}
              alt={b.judul}
              className="h-32 sm:h-40 w-auto rounded-xl object-contain drop-shadow-md"
            />
          )}
        </div>
      ))}
    </div>
  );
}
