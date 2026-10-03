import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { currentStaff } from "@/modules/newsroom/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true } };

export default async function ProtectedNewsroomLayout({ children }: { children: React.ReactNode }) {
  const actor = await currentStaff();
  if (!actor?.active) redirect("/newsroom/sign-in");
  return <AdminShell actor={{ name: actor.name, role: actor.role }}>{children}</AdminShell>;
}
