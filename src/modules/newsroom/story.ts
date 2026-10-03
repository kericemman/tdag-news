import { randomUUID } from "node:crypto";
import { z } from "zod";
import { categories } from "@/modules/publication/categories";
import type { ArticleBlock, PublicSource, PublishedArticle } from "@/modules/publication/repository";
import { editorialStatusSchema, sourceAuthoritySchema, claimStatusSchema } from "@/modules/editorial/contracts";

const text = z.string().trim();
const webUrl = z.url().refine((value) => { const protocol = new URL(value).protocol; return protocol === "http:" || protocol === "https:"; }, "Use an HTTP(S) URL");
const inline = z.object({ type: z.literal("text"), text: z.string().max(20000), marks: z.array(z.object({ type: z.string() }).passthrough()).optional() }).strict();
const paragraph = z.object({ type: z.literal("paragraph"), content: z.array(inline).default([]) }).strict();
const heading = z.object({ type: z.literal("heading"), attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }), content: z.array(inline).default([]) }).strict();
const quote = z.object({ type: z.literal("blockquote"), content: z.array(paragraph).min(1) }).strict();
const listItem = z.object({ type: z.literal("listItem"), content: z.array(paragraph).min(1) }).strict();
const list = z.object({ type: z.enum(["bulletList", "orderedList"]), content: z.array(listItem).min(1) }).strict();
export const editorDocumentSchema = z.object({ type: z.literal("doc"), content: z.array(z.union([paragraph, heading, quote, list])).max(500) }).strict();
export type EditorDocument = z.infer<typeof editorDocumentSchema>;

const sourceSchema = z.object({
  id: z.uuid(), publisher: text.min(1).max(160), title: text.min(1).max(300), url: webUrl,
  authority: sourceAuthoritySchema, accessState: z.enum(["accessible", "restricted", "unavailable", "unknown"]),
  retrievedAt: z.iso.datetime({ offset: true }),
});
const citationSchema = z.object({ blockIndex: z.number().int().nonnegative(), sourceId: z.uuid() });
const claimSchema = z.object({ id: z.uuid(), text: text.min(1).max(1000), status: claimStatusSchema, important: z.boolean(), sourceIds: z.array(z.uuid()) });

export const storyRecordSchema = z.object({
  id: z.uuid(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  headline: text.min(1).max(180), standfirst: text.min(1).max(500),
  type: z.enum(["news", "analysis", "explainer", "product_update", "opportunity", "research_report"]),
  category: z.string().refine((value) => categories.some((category) => category.slug === value && value !== "latest"), "Choose a coverage category"),
  authorName: z.literal("TDAG News Team"), status: editorialStatusSchema, revision: z.number().int().positive(),
  document: editorDocumentSchema, sources: z.array(sourceSchema).max(100), citations: z.array(citationSchema).max(1000),
  claims: z.array(claimSchema).max(500),
  hero: z.object({ src: webUrl, alt: text.min(1), width: z.number().int().positive(), height: z.number().int().positive(), caption: text.min(1), credit: text.min(1), rightsStatus: z.enum(["pending", "approved", "rejected", "expired"]) }).optional(),
  createdAt: z.iso.datetime({ offset: true }), updatedAt: z.iso.datetime({ offset: true }),
  publishedAt: z.iso.datetime({ offset: true }).optional(),
  scheduledAt: z.iso.datetime({ offset: true }).optional(),
  approvedBy: z.uuid().optional(), approvedAt: z.iso.datetime({ offset: true }).optional(),
  correction: z.object({ publishedAt: z.iso.datetime({ offset: true }), note: text.min(1) }).optional(),
});
export type StoryRecord = z.infer<typeof storyRecordSchema>;

export const storyInputSchema = storyRecordSchema.pick({ slug: true, headline: true, standfirst: true, type: true, category: true, authorName: true, document: true, sources: true, citations: true, claims: true, hero: true });
export type StoryInput = z.infer<typeof storyInputSchema>;

function prose(parts: { text: string }[]): string { return parts.map((part) => part.text).join(""); }

export function storyBlocks(story: StoryRecord): ArticleBlock[] {
  return story.document.content.flatMap((node, index): ArticleBlock[] => {
    const id = `block-${index}`;
    const sourceIds = story.citations.filter((citation) => citation.blockIndex === index).map((citation) => citation.sourceId);
    if (node.type === "paragraph") {
      return [{ kind: "paragraph", id, parts: node.content.map((part, partIndex) => ({ text: part.text, marks: part.marks?.map((mark) => mark.type).filter((mark): mark is "bold" | "italic" => mark === "bold" || mark === "italic"), sourceIds: partIndex === node.content.length - 1 ? sourceIds : [] })) }];
    }
    if (node.type === "heading") return [{ kind: "heading", id, level: node.attrs.level, text: prose(node.content) }];
    if (node.type === "blockquote") return [{ kind: "quote", id, text: node.content.map((item) => prose(item.content)).join("\n"), sourceIds }];
    return [{ kind: "list", id, items: node.content.map((item, itemIndex) => [{ text: item.content.map((line) => prose(line.content)).join(" "), sourceIds: itemIndex === node.content.length - 1 ? sourceIds : [] }]) }];
  });
}

export function toPublishedArticle(story: StoryRecord): PublishedArticle {
  const sourceNumbers = new Map(story.sources.map((source, index) => [source.id, index + 1]));
  const sources: PublicSource[] = story.sources.map((source, index) => ({
    id: source.id, number: index + 1, publisher: source.publisher, title: source.title, url: source.url,
    authority: source.authority === "primary" ? "Primary" : source.authority === "trusted_secondary" ? "Trusted secondary" : "Specialist secondary",
  }));
  const blocks = storyBlocks(story).map((block) => block.kind === "paragraph" ? { ...block, parts: block.parts.map((part) => ({ ...part, sourceIds: part.sourceIds?.filter((id) => sourceNumbers.has(id)) })) } : block);
  const words = blocks.map((block) => block.kind === "paragraph" ? block.parts.map((part) => part.text).join(" ") : block.kind === "heading" || block.kind === "quote" ? block.text : block.kind === "list" ? block.items.flat().map((part) => part.text).join(" ") : "").join(" ").trim().split(/\s+/).length;
  return { id: story.id, slug: story.slug, headline: story.headline, standfirst: story.standfirst, type: story.type, category: story.category, authorName: story.authorName,
    publishedAt: story.publishedAt!, updatedAt: story.updatedAt, blocks, sources, topics: [], readingMinutes: Math.max(1, Math.ceil(words / 220)),
    hero: story.hero ? { src: story.hero.src, alt: story.hero.alt, width: story.hero.width, height: story.hero.height, caption: story.hero.caption, credit: story.hero.credit } : undefined,
    correction: story.correction };
}

export function newDraft(input: StoryInput): StoryRecord {
  const now = new Date().toISOString();
  return storyRecordSchema.parse({ ...input, id: randomUUID(), status: "draft", revision: 1, createdAt: now, updatedAt: now });
}
