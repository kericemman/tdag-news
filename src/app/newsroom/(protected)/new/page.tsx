import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { canEdit } from "@/modules/newsroom/policy";
import { NewsroomEditor } from "@/components/newsroom-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "New story | TDAG News", robots: { index: false, follow: false } };

export default async function NewStoryPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!canEdit(actor.role)) redirect("/newsroom");
  return <NewsroomEditor actorRole={actor.role} />;
}
