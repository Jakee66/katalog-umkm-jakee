import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl = process.env.SUPABASE_URL || "";
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validasi sesi admin menggunakan Supabase Auth di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Semua rute di bawah /admin kecuali /admin/login wajib login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan membuka /admin/login, alihkan langsung ke /admin
  if (pathname === "/admin/login" && user) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  // K-8: Tambahkan X-Robots-Tag pada seluruh respon area admin
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return response;
}

export { proxy as middleware };
export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

