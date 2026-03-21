import { redirect } from "next/navigation";
import { SettingsDashboard } from "@/components/settings/SettingsDashboard";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/settings");
  }

  return <SettingsDashboard />;
}
