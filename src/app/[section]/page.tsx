import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategory } from "@/modules/publication/categories";
import { publicationRepository } from "@/modules/publication/repository";
import { EmptyCoverage, PageFrame, PageHeading, StoryList } from "@/components/publication-ui";

type Props = { params: Promise<{ section: string }> };

const info: Record<string, { title: string; description: string; kind: "about" | "policy" | "corrections" | "authors" | "contact" | "premium" | "submit" | "auth" | "foryou" }> = {
  about: { title: "About TDAG News", description: "Technology, business and Africa — explained.", kind: "about" },
  "editorial-policy": { title: "Editorial policy", description: "How TDAG News will source, verify and correct its reporting.", kind: "policy" },
  corrections: { title: "Corrections", description: "A transparent record of material corrections to published coverage.", kind: "corrections" },
  authors: { title: "Authors", description: "The people accountable for TDAG News coverage.", kind: "authors" },
  contact: { title: "Contact", description: "Get in touch with The Digital A-Game.", kind: "contact" },
  privacy: { title: "Privacy", description: "Our privacy notice is being prepared.", kind: "policy" },
  terms: { title: "Terms", description: "Our terms of use are being prepared.", kind: "policy" },
  "sponsored-content-policy": { title: "Sponsored content policy", description: "TDAG News has no advertising at launch.", kind: "policy" },
  premium: { title: "TDAG Premium", description: "Personalized technology intelligence delivered through WhatsApp.", kind: "premium" },
  submit: { title: "Submit a story", description: "Tell TDAG News about a development worth investigating.", kind: "submit" },
  "for-you": { title: "For You", description: "Relevant technology coverage shaped by your explicit interests.", kind: "foryou" },
  login: { title: "Sign in", description: "Account access is being prepared.", kind: "auth" },
  register: { title: "Create an account", description: "Account registration is being prepared.", kind: "auth" },
  account: { title: "Your account", description: "Account controls are being prepared.", kind: "auth" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const category = getCategory(section);
  const page = info[section];
  if (!category && !page) return { title: "Not found", robots: { index: false } };
  return { title: `${category?.label ?? page.title} | TDAG News`, description: category?.description ?? page.description, alternates: { canonical: `/${section}` }, robots: { index: false, follow: true } };
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  const category = getCategory(section);
  if (category) {
    const stories = await publicationRepository.listStories({ category: section, limit: 30 });
    return <PageFrame><PageHeading eyebrow="Coverage" title={category.label} description={category.description} /><div className="site-shell standard-content"><StoryList stories={stories} /></div></PageFrame>;
  }
  const page = info[section];
  if (!page) notFound();
  const authors = page.kind === "authors" ? await publicationRepository.listAuthors() : [];
  return <PageFrame><PageHeading eyebrow="TDAG News" title={page.title} description={page.description} /><div className="site-shell standard-content prose-page">
    {page.kind === "about" && <><p>TDAG News is the technology news and intelligence publication of The Digital A-Game. It serves readers in Kenya and across Africa while following global technology developments that matter here.</p><p>Emmanuel Kerich is Editor-in-Chief and the responsible owner. TDAG News Team is the default public byline. AI may assist research and production; a human editor remains responsible for publication.</p><p>Our goal is to reduce information overload through relevance, context, explanation and traceable sources.</p><Link href="/editorial-policy">Editorial policy</Link></>}
    {page.kind === "policy" && <><p>{section === "sponsored-content-policy" ? "TDAG News will launch without display advertising. Any future sponsored material will require clear identification and editorial separation." : "The final public text for this page requires editorial and, where appropriate, legal approval before launch."}</p><p>This page is currently a publication draft and is excluded from search indexing.</p></>}
    {page.kind === "corrections" && <EmptyCoverage title="No corrections to display" detail="Published correction notices will appear here with dates and links to the affected stories." />}
    {page.kind === "authors" && <div className="author-list">{authors.map((author) => <article key={author.id}><h2><Link href={`/author/${author.slug}`}>{author.name}</Link></h2><p>{author.biography}</p></article>)}</div>}
    {page.kind === "contact" && <><p>Direct newsroom contact details are being prepared. You can visit the parent TDAG website for current contact information.</p><a href="https://thedigitalagame.com">Visit The Digital A-Game</a></>}
    {page.kind === "premium" && <><p>TDAG Premium is planned as personalized technology intelligence through WhatsApp. It will use your chosen topics, role, region and delivery frequency to select useful updates.</p><p>Pricing and registration are not open yet. The public website remains free.</p></>}
    {page.kind === "submit" && <><p>Story submissions will open with a secure form and independent editorial review. Submission will not guarantee publication.</p><p>Until then, please use the parent TDAG website for current contact information.</p></>}
    {page.kind === "auth" && <p>This account feature is being built. No registration or sign-in is available yet.</p>}
    {page.kind === "foryou" && <><p>For You will use interests you choose, such as topics, companies, regions and a professional role. It will explain why a story appears and let you change those choices.</p><p>Personalized feeds are not available yet. Browse <Link href="/latest">latest coverage</Link> in the meantime.</p></>}
  </div></PageFrame>;
}
