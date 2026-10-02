import type { Metadata } from "next";
import "@fontsource-variable/newsreader/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TDAG News",
  description: "Technology, business and Africa — explained.",
  metadataBase: new URL("https://news.thedigitalagame.com"),
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  robots: process.env.PUBLICATION_LIVE === "true" ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
