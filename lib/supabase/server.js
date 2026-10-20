import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Membuat koneksi Supabase untuk server memakai SUPABASE_SECRET_KEY.
 * Hanya dipakai di sisi server (Server Component, Server Action, Route Handler).
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

export const createClient = buatKoneksiServer;
export default buatKoneksiServer;
