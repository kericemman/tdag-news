import { notFound, redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { getNewsroomStory, listStoryHistory } from "@/modules/newsroom/store";
import { NewsroomEditor } from "@/components/newsroom-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit story | TDAG News", robots: { index: false, follow: false } };

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  const { id } = await params;
  const story = await getNewsroomStory(id);
  if (!story) notFound();
  const history = await listStoryHistory(id);
  return <NewsroomEditor story={story} actorRole={actor.role} history={history.audit.map((item) => ({ action: item.action, at: item.at, reason: item.reason }))} />;
}
