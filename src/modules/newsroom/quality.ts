import type { StoryRecord } from "./story";

export type QualityIssue = { code: string; message: string; blocking: boolean };

export function checkStoryQuality(story: StoryRecord): QualityIssue[] {
  const issues: QualityIssue[] = [];
  if (!story.document.content.some((node) => node.type === "paragraph" && node.content.some((part) => part.text.trim()))) issues.push({ code: "empty_body", message: "Add at least one substantive paragraph.", blocking: true });
  if (!story.sources.length) issues.push({ code: "no_sources", message: "Attach at least one source.", blocking: true });
  const sourceIds = new Set(story.sources.map((source) => source.id));
  for (const source of story.sources) {
    if (source.accessState !== "accessible") issues.push({ code: "source_unavailable", message: `Source “${source.title}” is not marked accessible.`, blocking: true });
    if (source.authority === "discovery" || source.authority === "user_submitted") issues.push({ code: "weak_source", message: `Source “${source.title}” needs corroboration.`, blocking: true });
  }
  for (const citation of story.citations) {
    if (!sourceIds.has(citation.sourceId) || citation.blockIndex >= story.document.content.length) issues.push({ code: "broken_citation", message: "A citation points to a missing source or section.", blocking: true });
  }
  for (const [index, node] of story.document.content.entries()) {
    if (node.type !== "heading" && !story.citations.some((citation) => citation.blockIndex === index)) issues.push({ code: "uncited_paragraph", message: `Body block ${index + 1} needs a source link.`, blocking: true });
  }
  for (const claim of story.claims) {
    if (claim.important && (claim.status !== "verified" || !claim.sourceIds.some((id) => sourceIds.has(id)))) issues.push({ code: "unsupported_claim", message: `Important claim “${claim.text}” is not verified with a recorded source.`, blocking: true });
  }
  if (story.hero && story.hero.rightsStatus !== "approved") issues.push({ code: "media_rights", message: "Hero image rights require approval.", blocking: true });
  if (!story.authorName.trim()) issues.push({ code: "author", message: "Add a real public byline.", blocking: true });
  return issues;
}
