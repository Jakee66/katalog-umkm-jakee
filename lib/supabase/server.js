import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat koneksi Supabase untuk server memakai SUPABASE_SECRET_KEY.
 * Dipakai untuk membaca data publik (katalog dan detail produk).
 */
export function buatKoneksiServer() {
  const rawUrl = process.env.SUPABASE_URL || "";
  // Bersihkan format URL bila menyertakan /rest/v1 atau garis miring penutup
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init = {}) => {
        return fetch(input, {
          ...init,
          cache: "no-store",
        });
      },
    },
  });
}

/**
 * Membuat koneksi sesi admin memakai SUPABASE_PUBLISHABLE_KEY dan cookie login (@supabase/ssr).
 * Dipakai untuk login, logout, ganti password, dan aksi admin yang mematuhi RLS.
 */
export async function buatKoneksiAdmin() {
  const cookieStore = await cookies();
  const rawUrl = process.env.SUPABASE_URL || "";
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Dipanggil dari Server Component atau rute read-only, aman diabaikan
        }
      },
    },
    global: {
      fetch: (input, init = {}) => {
        return fetch(input, {
          ...init,
          cache: "no-store",
        });
      },
    },
  });
}

export const createClient = buatKoneksiServer;
export default buatKoneksiServer;
