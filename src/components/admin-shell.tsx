"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { NewsroomSignOut } from "@/components/newsroom-signout";
import type { StaffRole } from "@/modules/newsroom/policy";

type Item = { label: string; href: string; icon: string; roles?: StaffRole[] };
const researchRoles: StaffRole[] = ["super_admin", "editor", "researcher"];
const editorialRoles: StaffRole[] = ["super_admin", "editor", "writer"];
const primaryGroups: { label: string; items: Item[] }[] = [
  { label: "Workspace", items: [{ label: "Overview", href: "/newsroom", icon: "grid" }, { label: "New story", href: "/newsroom/new", icon: "plus", roles: editorialRoles }] },
  { label: "Stories", items: [{ label: "Drafts", href: "/newsroom?view=drafts", icon: "document" }, { label: "In review", href: "/newsroom?view=review", icon: "check" }, { label: "Scheduled", href: "/newsroom?view=scheduled", icon: "pulse" }, { label: "Published", href: "/newsroom?view=published", icon: "book" }] },
  { label: "Sources & leads", items: [{ label: "Sources", href: "/newsroom/sources", icon: "source", roles: researchRoles }, { label: "Incoming", href: "/newsroom/incoming", icon: "inbox", roles: researchRoles }] },
];
const secondaryItems: Item[] = [
  { label: "Clusters", href: "/newsroom/clusters", icon: "cluster", roles: researchRoles },
  { label: "Entities", href: "/newsroom/entities", icon: "entity", roles: researchRoles },
  { label: "Opportunities", href: "/newsroom/opportunities", icon: "spark", roles: researchRoles },
  { label: "Submissions", href: "/newsroom/submissions", icon: "mail", roles: researchRoles },
  { label: "Collector health", href: "/newsroom/collector", icon: "pulse", roles: researchRoles },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>, document: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></>,
    check: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 2.5 2.5L16 9"/></>, book: <><path d="M4 5.5C7 4 9.5 4 12 6v14c-2.5-2-5-2-8-.5zM20 5.5C17 4 14.5 4 12 6v14c2.5-2 5-2 8-.5z"/></>,
    inbox: <><path d="M4 4h16l2 11v5H2v-5z"/><path d="M2 15h6l2 3h4l2-3h6"/></>, cluster: <><circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 8l3 8m5-8-3 8M8 7h8"/></>,
    source: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>, entity: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-7 8-7s8 3 8 7"/></>,
    spark: <><path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/></>, mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    pulse: <><path d="M2 12h5l3-7 4 14 3-7h5"/></>,
  };
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function AdminShell({ actor, children }: { actor: { name: string; role: StaffRole }; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const initials = actor.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  const allowed = (item: Item) => !item.roles || item.roles.includes(actor.role);
  const active = (item: Item) => item.href === "/newsroom"
    ? pathname === "/newsroom" && !searchParams.get("view") && !searchParams.get("status")
    : item.href.startsWith("/newsroom?view=")
      ? pathname === "/newsroom" && searchParams.get("view") === item.href.split("=")[1]
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const pageTitle = pathname === "/newsroom" ? ({ drafts: "Drafts", review: "In review", scheduled: "Scheduled", published: "Published" } as Record<string, string>)[searchParams.get("view") ?? ""] ?? "Overview"
    : pathname.startsWith("/newsroom/story/") ? "Story editor"
      : pathname.startsWith("/newsroom/incoming") ? "Incoming leads"
        : [...primaryGroups.flatMap((group) => group.items), ...secondaryItems].find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Newsroom";
  const moreItems = secondaryItems.filter(allowed);
  const secondaryActive = moreItems.some(active);
  const navLink = (item: Item) => <Link key={item.href} href={item.href} aria-current={active(item) ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>;
  return <div className="admin-app"><a className="skip-link" href="#admin-content">Skip to newsroom content</a>
    <aside className="admin-sidebar"><Link href="/newsroom" className="admin-brand"><span className="admin-brand-mark" aria-hidden="true">A</span><span><strong>TDAG NEWS</strong><small>EDITORIAL STUDIO</small></span></Link><nav className="admin-navigation" aria-label="Newsroom navigation">{primaryGroups.map((group) => { const items = group.items.filter(allowed); return items.length ? <div className="admin-nav-group" key={group.label}><p>{group.label}</p>{items.map(navLink)}</div> : null; })}{moreItems.length > 0 && <details className="admin-nav-more" key={pathname} open={secondaryActive ? true : undefined}><summary>More tools <span aria-hidden="true">⌄</span></summary><div className="admin-nav-group">{moreItems.map(navLink)}</div></details>}</nav><div className="admin-sidebar-footer"><span className="admin-status-dot"/> Staff workspace</div></aside>
    <div className="admin-workspace"><header className="admin-bar"><details ref={mobileMenu} className="admin-mobile-menu"><summary aria-label="Open newsroom navigation">Menu</summary><nav aria-label="Mobile newsroom navigation">{primaryGroups.map((group) => { const items = group.items.filter(allowed); return items.length ? <div key={group.label}><p>{group.label}</p>{items.map((item) => <Link key={item.href} href={item.href} aria-current={active(item) ? "page" : undefined} onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}>{item.label}</Link>)}</div> : null; })}{moreItems.length > 0 && <div><p>More tools</p>{moreItems.map((item) => <Link key={item.href} href={item.href} aria-current={active(item) ? "page" : undefined} onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}>{item.label}</Link>)}</div>}</nav></details><div className="admin-bar-title"><span className="admin-bar-eyebrow">TDAG NEWS / NEWSROOM</span><strong>{pageTitle}</strong></div><div className="admin-bar-actions"><Link href="/" target="_blank" rel="noopener noreferrer">View site ↗</Link><span className="admin-account"><span className="admin-avatar" aria-hidden="true">{initials}</span><span><strong>{actor.name}</strong><small>{actor.role.replaceAll("_", " ")}</small></span></span><NewsroomSignOut /></div></header><div id="admin-content" className="admin-content">{children}</div></div>
  </div>;
}
