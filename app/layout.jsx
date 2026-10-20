import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PwaRegister from "@/components/PwaRegister";
import { toko } from "@/lib/toko";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://katalog-umkm-jakee.vercel.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: toko.nama,
    template: `%s | ${toko.nama}`,
  },
  description: toko.tagline,
  applicationName: toko.nama,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: toko.nama,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: toko.nama,
    title: toko.nama,
    description: toko.tagline,
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: toko.nama,
    description: toko.tagline,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <PwaRegister />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
