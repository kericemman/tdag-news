import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Article layout preview — TDAG News", robots: { index: false, follow: false } };

export default function ArticleDesignPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <SiteHeader preview />
      <div className="preview-note"><div className="site-shell">DESIGN PREVIEW · Fictional layout sample · Not published reporting</div></div>
      <main id="main-content" className="site-shell article-layout">
        <article>
          <header className="article-head">
            <p className="eyebrow">Explainer · Layout sample</p>
            <h1>How TDAG News will explain the developments that matter</h1>
            <p className="standfirst">A demonstration of the reading experience, showing the hierarchy for context, evidence and clear editorial judgment.</p>
            <div className="article-meta"><span>By TDAG News Team</span><span>Preview only</span><span>4 min read</span></div>
          </header>
          <hr className="article-rule" />
          <figure className="media-placeholder"><div className="media-frame" role="img" aria-label="Empty hero media placement preview">Approved hero media placement</div><figcaption>A real article displays a rights-cleared image, video or illustration with a factual caption and credit.</figcaption></figure>
          <div className="article-body">
            <p>This sample contains no news claims. It shows how a finished article can guide a reader from the essential development to its wider meaning without turning the page into a crowded dashboard.</p>
            <p>The published version of this space will contain original reporting. Important facts will connect to stored source documents, and the editor will be able to inspect that evidence before a story goes live.</p>
            <h2>Start with what changed</h2>
            <p>A real story will establish the event, the date and the parties involved. It will distinguish confirmed details from claims that still need independent support.</p>
            <blockquote>Good technology coverage should leave the reader clearer about the decision in front of them.</blockquote>
            <h2>Then explain why it matters</h2>
            <p>The next section will add the necessary technical, business and regional context. Kenya and Africa will appear when the reporting supports a meaningful connection.</p>
            <div className="context-panel"><h2>Why it matters</h2><p>This optional module gives the reader the practical consequence in plain language. Editors choose it when it genuinely helps.</p></div>
            <h3>What remains uncertain</h3>
            <p>When evidence is incomplete, TDAG will say so. A developing story can be updated with a visible revision and correction history.</p>
          </div>
          <section className="sources" aria-labelledby="sources-heading"><h2 id="sources-heading">Sources &amp; further reading</h2><p>In published stories, this section is generated from actual stored source relationships. No sources are attached to this fictional layout sample.</p></section>
          <div className="correction-placeholder"><strong>Correction notice placement</strong>When a material published fact changes, the article will show a dated public note linked to its revision record. This preview contains no correction.</div>
        </article>
        <aside className="article-aside" aria-label="Article context"><h2>At a glance</h2><p>Reading should be calm. A short context rail can help on large screens, then follow the article naturally on mobile.</p><div className="source-placeholder">Source strength, uncertainty and related coverage will appear here only when backed by real newsroom data.</div></aside>
      </main>
    </>
  );
}
