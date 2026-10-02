export const categories = [
  { slug: "latest", label: "Latest", description: "The newest verified TDAG News coverage." },
  { slug: "ai", label: "AI", description: "Artificial intelligence developments with practical context." },
  { slug: "africa", label: "Africa Tech", description: "Technology across Africa and its wider implications." },
  { slug: "kenya", label: "Kenya Tech", description: "Technology developments relevant to Kenya." },
  { slug: "business", label: "Business", description: "The business of technology, explained." },
  { slug: "startups", label: "Startups", description: "Founders, funding and company building." },
  { slug: "products", label: "Products", description: "Useful changes to technology products and services." },
  { slug: "developers", label: "Developers", description: "Tools, platforms and engineering changes." },
  { slug: "cybersecurity", label: "Cybersecurity", description: "Security developments with verified, actionable context." },
  { slug: "explainers", label: "Explainers", description: "Clear guides to enduring technology questions." },
  { slug: "opportunities", label: "Opportunities", description: "Verified programs, grants, jobs and learning opportunities." },
] as const;

export function getCategory(slug: string) { return categories.find((item) => item.slug === slug); }
