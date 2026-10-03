import Link from "next/link";

const sections = [
  ["Latest", "/latest"], ["Kenya", "/kenya"], ["Africa", "/africa"],
  ["AI", "/ai"], ["Business", "/business"], ["Developers", "/developers"],
  ["Opportunities", "/opportunities"], ["Explainers", "/explainers"],
] as const;

export function SiteHeader({ preview = false }: { preview?: boolean }) {
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <div className="masthead-top"><div className="site-shell masthead-top-inner"><span>Independent technology journalism for Africa</span><span>Kenya · Africa · The world</span></div></div>
      <div className="site-shell masthead-main">
        <Link className="wordmark" href={preview ? "/design-preview/article" : "/"} aria-label="TDAG News home"><span className="wordmark-symbol" aria-hidden="true">A</span><span className="wordmark-text"><strong>TDAG<span>NEWS</span></strong><small>Technology with perspective</small></span></Link>
        <div className="masthead-actions"><span className="masthead-promise">News that matters.<br />Context that stays.</span><Link className="header-search" href="/search" aria-label="Search TDAG News"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><span>Search</span></Link><Link className="header-brief" href="/brief">TDAG Brief <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="site-nav-wrap"><div className="site-shell site-nav-inner"><nav className="header-nav" aria-label="Primary">{sections.map(([name, href]) => preview ? <span key={href}>{name}</span> : <Link key={href} href={href}>{name}</Link>)}</nav><details className="header-menu"><summary><span>Explore</span><span className="menu-icon" aria-hidden="true"><i/><i/><i/></span></summary><nav aria-label="Mobile primary">{sections.map(([name, href]) => preview ? <span key={href}>{name}</span> : <Link key={href} href={href}>{name}</Link>)}<Link href="/search">Search</Link><Link href="/brief">TDAG Brief</Link></nav></details><span className="nav-edition">The Digital A-Game publication</span></div></div>
    </header>
  </>;
}
