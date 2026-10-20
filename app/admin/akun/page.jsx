import NavAdmin from "@/components/NavAdmin";
import { buatKoneksiServer } from "@/lib/supabase/server";
import HalamanAkun from "./AkunClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = buatKoneksiServer();
  const { data: akunList } = await supabase
    .from("admin_users")
    .select("id, email, nama, is_active, created_at")
    .order("created_at", { ascending: false });

  return <HalamanAkun akunList={akunList || []} />;
}

