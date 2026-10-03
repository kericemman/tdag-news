import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { parseFeed } from "./feed";
import { getSource, recordFetchFailure, storeFeedEntries } from "./store";

const blocked = new BlockList();
for (const [address, prefix] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["224.0.0.0", 4], ["240.0.0.0", 4]] as [string, number][]) blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8]] as [string, number][]) blocked.addSubnet(address, prefix, "ipv6");

export function publicAddress(address: string): boolean {
  const family = isIP(address);
  if (!family) return false;
  return !blocked.check(address, family === 4 ? "ipv4" : "ipv6");
}

async function validateFeedHost(value: string): Promise<void> {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("UNSAFE_FEED_URL");
  if (isIP(url.hostname)) throw new Error("IP_FEED_URL_FORBIDDEN");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some((address) => !publicAddress(address.address))) throw new Error("PRIVATE_FEED_ADDRESS");
}

async function readLimited(response: Response): Promise<string> {
  if (Number(response.headers.get("content-length")) > 1_000_000) throw new Error("FEED_TOO_LARGE");
  if (!response.body) throw new Error("EMPTY_FEED");
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 1_000_000) { await reader.cancel(); throw new Error("FEED_TOO_LARGE"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchSource(sourceId: string): Promise<{ found: number; inserted: number }> {
  const source = await getSource(sourceId);
  if (!source || source.status !== "active" || source.type === "manual") throw new Error("SOURCE_NOT_ACTIVE");
  let httpStatus: number | undefined;
  try {
    await validateFeedHost(source.url);
    const response = await fetch(source.url, { redirect: "error", signal: AbortSignal.timeout(15000), headers: {
      "User-Agent": "TDAGNewsCollector/0.1 (+https://news.thedigitalagame.com)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      ...(source.etag ? { "If-None-Match": source.etag } : {}),
      ...(source.lastModified ? { "If-Modified-Since": source.lastModified } : {}),
    } });
    httpStatus = response.status;
    if (response.status === 304) { await storeFeedEntries(source, [], { status: 304 }); return { found: 0, inserted: 0 }; }
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!/xml|rss|atom/i.test(contentType)) throw new Error("UNEXPECTED_CONTENT_TYPE");
    const entries = parseFeed(await readLimited(response));
    const result = await storeFeedEntries(source, entries, { status: response.status, etag: response.headers.get("etag") ?? undefined, lastModified: response.headers.get("last-modified") ?? undefined });
    return { found: entries.length, inserted: result.inserted };
  } catch (error) {
    await recordFetchFailure(source, error instanceof Error ? error.message : "Unknown fetch error", httpStatus);
    throw error;
  }
}
