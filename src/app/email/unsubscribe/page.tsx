export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="site-shell"><h1>Unsubscribe from email</h1><p>Stop receiving the TDAG News email briefing.</p><form method="post" action="/api/email/unsubscribe"><input type="hidden" name="token" value={token ?? ""} /><button type="submit">Unsubscribe</button></form></main>;
}
