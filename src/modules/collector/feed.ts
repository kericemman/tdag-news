import { createHash } from "node:crypto";
import { XMLParser, XMLValidator } from "fast-xml-parser";

export type FeedEntry = { externalId: string; title: string; canonicalUrl: string; summary: string; publishedAt?: string; contentHash: string };

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@", removeNSPrefix: true, processEntities: false, parseTagValue: false, trimValues: true });

function first(value: unknown): Record<string, unknown>[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) return asText((value as Record<string, unknown>)["#text"]);
  return "";
}

function webUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) url.searchParams.delete(key);
    return url.toString();
  } catch { return null; }
}

function plainText(value: unknown): string {
  return asText(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);
}

function date(value: unknown): string | undefined {
  const raw = asText(value);
  const milliseconds = Date.parse(raw);
  return raw && Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : undefined;
}

export function parseFeed(xml: string): FeedEntry[] {
  if (xml.length > 1_000_000) throw new Error("FEED_TOO_LARGE");
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("FEED_DTD_FORBIDDEN");
  if (XMLValidator.validate(xml) !== true) throw new Error("INVALID_FEED_XML");
  const document = parser.parse(xml) as Record<string, unknown>;
  const rss = document.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const atom = document.feed as Record<string, unknown> | undefined;
  const items = channel ? first(channel.item) : atom ? first(atom.entry) : [];
  if (!channel && !atom) throw new Error("UNSUPPORTED_FEED");
  const result: FeedEntry[] = [];
  for (const item of items.slice(0, 100)) {
    const links = atom ? first(item.link) : [];
    const atomLink = links.find((link) => !link["@rel"] || link["@rel"] === "alternate")?.["@href"];
    const canonicalUrl = webUrl(asText(atom ? atomLink || item.link : item.link));
    const title = plainText(item.title).slice(0, 300);
    if (!canonicalUrl || !title) continue;
    const externalId = asText(atom ? item.id : item.guid) || canonicalUrl;
    const summary = plainText(atom ? item.summary || item.content : item.description);
    const publishedAt = date(atom ? item.published || item.updated : item.pubDate || item.date);
    const contentHash = createHash("sha256").update(`${canonicalUrl}\n${title.toLowerCase()}`).digest("hex");
    result.push({ externalId: externalId.slice(0, 500), title, canonicalUrl, summary, publishedAt, contentHash });
  }
  return result;
}

export function normalizeCandidateUrl(value: string): string | null { return webUrl(value); }
