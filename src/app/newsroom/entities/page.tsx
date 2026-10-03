import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { listEntities } from "@/modules/collector/entities";
import { EntityForm, VerifyEntity } from "@/components/entity-controls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entity registry | TDAG News", robots: { index: false, follow: false } };

export default async function EntitiesPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const entities = await listEntities();
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">Knowledge</p><h1>Entity registry</h1><p>Aliases and official links remain proposed until editorial verification.</p></div><Link href="/newsroom">Back to newsroom</Link></header><div className="newsroom-editor-grid"><section>{entities.length ? <div className="newsroom-submissions">{entities.map((entity) => <article className="newsroom-panel" key={entity.id}><p className="eyebrow">{entity.kind} · {entity.status}</p><h2>{entity.name}</h2>{entity.aliases.length > 0 && <p>Also known as: {entity.aliases.join(", ")}</p>}<p><a href={entity.provenanceUrl} target="_blank" rel="noopener noreferrer">Provenance ↗</a>{entity.officialUrl && <> · <a href={entity.officialUrl} target="_blank" rel="noopener noreferrer">Official website ↗</a></>}</p>{entity.notes && <p>{entity.notes}</p>}{entity.status === "proposed" && ["super_admin", "editor"].includes(actor.role) && <VerifyEntity id={entity.id} />}</article>)}</div> : <p>No entities proposed yet.</p>}</section><aside><EntityForm /></aside></div></main>;
}
