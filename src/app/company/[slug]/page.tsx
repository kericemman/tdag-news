import { notFound } from "next/navigation";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  notFound(); // No substantiated public company/entity registry exists yet.
}
