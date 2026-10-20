import { getStoreSettings } from "@/lib/settings";
import PengaturanClient from "./PengaturanClient";

export const dynamic = "force-dynamic";

export default async function HalamanPengaturan() {
  const settings = await getStoreSettings();
  return <PengaturanClient settings={settings} />;
}

