import { addSource, type SourceInput } from "../src/modules/collector/store";

const proposals: SourceInput[] = [
  { name: "GitHub Changelog", url: "https://github.blog/changelog/feed/", homepage: "https://github.blog/changelog/", type: "rss", region: "Global", topics: ["developers", "products"], authority: "primary", intervalMinutes: 120, accessNotes: "Official GitHub platform changelog; verify feed access and editorial relevance before activation." },
  { name: "CIS Advisories", url: "https://www.cisecurity.org/feed/advisories", homepage: "https://www.cisecurity.org/rss-syndication", type: "rss", region: "Global", topics: ["cybersecurity"], authority: "primary", intervalMinutes: 180, accessNotes: "Official Center for Internet Security advisory feed; verify access before activation." },
  { name: "Communications Authority of Kenya", url: "https://www.ca.go.ke/news", homepage: "https://www.ca.go.ke/news", type: "manual", region: "Kenya", topics: ["kenya", "policy"], authority: "primary", intervalMinutes: 1440, accessNotes: "Official regulator news page. Manual URL intake only; no feed endpoint confirmed." },
];

async function main() {
  for (const proposal of proposals) {
    try {
      const source = await addSource(proposal, { id: "source-seed", name: "Source seed script", role: "researcher", active: true });
      console.log(`Proposed ${source.name}; activation requires human review.`);
    } catch (error) {
      if (error instanceof Error && /duplicate key/i.test(error.message)) console.log(`Already proposed: ${proposal.name}`);
      else throw error;
    }
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Source proposal failed"); process.exitCode = 1; });
