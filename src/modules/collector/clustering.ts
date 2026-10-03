import { createHash } from "node:crypto";

const noise = new Set(["a", "an", "and", "at", "by", "for", "from", "in", "of", "on", "the", "to", "with"]);

export function normalizedTitle(title: string): string {
  return title.normalize("NFKC").toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/).filter((word) => word && !noise.has(word)).join(" ").slice(0, 300);
}

export function clusterKey(title: string, url: string, publishedAt?: string): string {
  const normalized = normalizedTitle(title);
  const day = (publishedAt && Number.isFinite(Date.parse(publishedAt)) ? publishedAt : new Date().toISOString()).slice(0, 10);
  const identity = normalized.split(" ").length >= 5 ? `${normalized}:${day}` : `url:${url}`;
  return createHash("sha256").update(identity).digest("hex");
}

export function sameEventTitle(left: string, right: string, leftAt?: string, rightAt?: string): boolean {
  const normalized = normalizedTitle(left);
  if (normalized.split(" ").length < 5 || normalized !== normalizedTitle(right)) return false;
  if (!leftAt || !rightAt) return false;
  const delta = Math.abs(Date.parse(leftAt) - Date.parse(rightAt));
  return Number.isFinite(delta) && delta <= 72 * 60 * 60_000;
}
