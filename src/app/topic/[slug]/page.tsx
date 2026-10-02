import { notFound } from "next/navigation";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  notFound(); // No substantiated public topic/entity registry exists yet.
}
