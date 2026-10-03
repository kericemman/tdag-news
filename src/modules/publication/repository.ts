import { listPublicStories, getPublicStory } from "@/modules/newsroom/store";
import { toPublishedArticle, type StoryRecord } from "@/modules/newsroom/story";

/** Public read boundary. Only owner-published records are eligible for public reads. */
export type StorySummary = {
  id: string;
  slug: string;
  headline: string;
  standfirst: string;
  category: string;
  type: string;
  authorName: string;
  publishedAt: string;
  updatedAt?: string;
  hero?: { src: string; alt: string; width: number; height: number; caption?: string; credit?: string };
};

export type PublicSource = {
  id: string;
  number: number;
  publisher: string;
  title: string;
  url: string;
  authority: "Primary" | "Trusted secondary" | "Specialist secondary";
};

export type RichTextPart = { text: string; sourceIds?: string[]; marks?: ("bold" | "italic")[] };

export type ArticleBlock =
  | { kind: "paragraph"; id: string; parts: RichTextPart[] }
  | { kind: "heading"; id: string; level: 2 | 3; text: string }
  | { kind: "quote"; id: string; text: string; attribution?: string; sourceIds?: string[] }
  | { kind: "callout"; id: string; label: string; parts: RichTextPart[] }
  | { kind: "list"; id: string; items: RichTextPart[][] }
  | { kind: "media"; id: string; src: string; alt: string; width: number; height: number; caption: string; credit: string };

export type PublishedArticle = StorySummary & {
  blocks: ArticleBlock[];
  sources: PublicSource[];
  readingMinutes: number;
  topics: { label: string; slug: string }[];
  correction?: { publishedAt: string; note: string };
};

export type DailyBriefSummary = {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  standfirst: string;
};

export type DailyBrief = DailyBriefSummary & {
  items: { id: string; headline: string; summary: string; whyItMatters: string; articleSlug?: string; sources: PublicSource[] }[];
};

export type PublicAuthor = { id: string; slug: string; name: string; biography: string; photo?: { src: string; alt: string } };

export interface PublicationRepository {
  listStories(input?: { category?: string; limit?: number; query?: string }): Promise<StorySummary[]>;
  getArticle(slug: string): Promise<PublishedArticle | null>;
  listBriefs(limit?: number): Promise<DailyBriefSummary[]>;
  getBrief(slug: string): Promise<DailyBrief | null>;
  listAuthors(): Promise<PublicAuthor[]>;
  getAuthor(slug: string): Promise<PublicAuthor | null>;
}

function summary(story: StoryRecord): StorySummary {
  return { id: story.id, slug: story.slug, headline: story.headline, standfirst: story.standfirst,
    category: story.category, type: story.type, authorName: story.authorName,
    publishedAt: story.publishedAt!, updatedAt: story.updatedAt,
    hero: story.hero ? { src: story.hero.src, alt: story.hero.alt, width: story.hero.width, height: story.hero.height, caption: story.hero.caption, credit: story.hero.credit } : undefined };
}

export const publicationRepository: PublicationRepository = {
  async listStories(input) { return (await listPublicStories(input)).map(summary); },
  async getArticle(slug) { const story = await getPublicStory(slug); return story ? toPublishedArticle(story) : null; },
  async listBriefs() { return []; },
  async getBrief() { return null; },
  async listAuthors() { return [{ id: "tdag-news-team", slug: "tdag-news-team", name: "TDAG News Team", biography: "The editorial team of TDAG News, part of The Digital A-Game." }]; },
  async getAuthor(slug) { return slug === "tdag-news-team" ? { id: "tdag-news-team", slug, name: "TDAG News Team", biography: "The editorial team of TDAG News, part of The Digital A-Game." } : null; },
};
