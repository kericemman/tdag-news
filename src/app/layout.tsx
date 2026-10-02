import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TDAG News",
  description: "Technology, business and Africa — explained.",
  metadataBase: new URL("https://news.thedigitalagame.com"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
