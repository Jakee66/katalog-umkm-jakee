import { buatKoneksiServer } from "@/lib/supabase/server";

const memoryStore = new Map();

/**
 * Serverless-safe rate limiter.
 * Menggunakan tabel database `rate_limits`, fallback ke map memori jika tabel belum ada.
 */
export async function checkRateLimit(key, limit = 5, windowMs = 60000) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const supabase = buatKoneksiServer();
    const { data } = await supabase
      .from("rate_limits")
      .select("id, count, reset_at")
      .eq("key", key)
      .maybeSingle();

    if (data) {
      const dbResetAt = new Date(data.reset_at);
      if (now < dbResetAt) {
        if (data.count >= limit) {
          const retryAfter = Math.ceil((dbResetAt.getTime() - now.getTime()) / 1000);
          return { allowed: false, retryAfter };
        }
        await supabase
          .from("rate_limits")
          .update({ count: data.count + 1 })
          .eq("id", data.id);
        return { allowed: true, remaining: limit - (data.count + 1) };
      } else {
        // Window kadaluarsa, reset count
        await supabase
          .from("rate_limits")
          .update({ count: 1, reset_at: resetAt.toISOString() })
          .eq("id", data.id);
        return { allowed: true, remaining: limit - 1 };
      }
    } else {
      await supabase
        .from("rate_limits")
        .insert({ key, count: 1, reset_at: resetAt.toISOString() });
      return { allowed: true, remaining: limit - 1 };
    }
  } catch (err) {
    // Fallback ke penyimpanan memori
    const current = memoryStore.get(key);
    if (current && now.getTime() < current.resetAt) {
      if (current.count >= limit) {
        return {
          allowed: false,
          retryAfter: Math.ceil((current.resetAt - now.getTime()) / 1000),
        };
      }
      current.count += 1;
      return { allowed: true, remaining: limit - current.count };
    }
    memoryStore.set(key, { count: 1, resetAt: now.getTime() + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
}

