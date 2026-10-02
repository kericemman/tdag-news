const sections = [
  ["Latest", "/latest"], ["AI", "/ai"], ["Africa", "/africa"],
  ["Business", "/business"], ["Developers", "/developers"],
  ["Opportunities", "/opportunities"],
] as const;

export function SiteHeader({ preview = false }: { preview?: boolean }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="site-shell header-inner">
          <a className="wordmark" href={preview ? "/design-preview/article" : "/"} aria-label="TDAG News home"><span>TDAG</span><span>NEWS</span></a>
          <nav className="header-nav" aria-label="Primary">
            {sections.map(([name, href]) => preview ? <span key={href}>{name}</span> : <a key={href} href={href}>{name}</a>)}
          </nav>
          <details className="header-menu">
            <summary>Menu</summary>
            <nav aria-label="Mobile primary">
              {sections.map(([name, href]) => preview ? <span key={href}>{name}</span> : <a key={href} href={href}>{name}</a>)}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
