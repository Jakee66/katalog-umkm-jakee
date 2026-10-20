export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-44 sm:h-56 w-full rounded-2xl bg-latar border border-garis" />

      {/* Header & Search Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="h-10 w-48 rounded-xl bg-latar border border-garis" />
        <div className="h-10 w-full sm:w-64 rounded-xl bg-latar border border-garis" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-latar border border-garis flex-shrink-0" />
        ))}
      </div>

      {/* Grid Kartu Produk Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-2xl border border-garis bg-latar overflow-hidden flex flex-col">
            <div className="aspect-square w-full bg-permukaan" />
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-3 w-16 bg-permukaan rounded" />
              <div className="h-4 w-full bg-permukaan rounded" />
              <div className="h-5 w-24 bg-permukaan rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
