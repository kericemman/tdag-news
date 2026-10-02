import { z } from "zod";

export const editorialStatusSchema = z.enum([
  "idea", "candidate", "researching", "draft", "editorial_review",
  "ready_for_review", "owner_review", "approved", "scheduled",
  "published", "hold", "rejected", "archived", "updated",
]);

export type EditorialStatus = z.infer<typeof editorialStatusSchema>;

export const contentTypeSchema = z.enum([
  "news", "analysis", "explainer", "brief", "product_update", "opportunity",
  "research_report", "daily_brief", "weekly_roundup", "live_developing",
]);

export const sourceAuthoritySchema = z.enum([
  "primary", "trusted_secondary", "specialist_secondary", "discovery", "user_submitted",
]);

export const claimStatusSchema = z.enum([
  "unverified", "partially_verified", "verified", "contested", "unsupported", "obsolete",
]);

export const citationScopeSchema = z.enum(["article", "section", "claim"]);

const identifier = z.string().trim().min(1);
const timestamp = z.iso.datetime({ offset: true });

export const sourceDocumentSchema = z.object({
  id: identifier,
  sourceId: identifier,
  publisher: z.string().trim().min(1),
  author: z.string().trim().optional(),
  title: z.string().trim().min(1),
  url: z.url(),
  canonicalUrl: z.url(),
  publishedAt: timestamp.optional(),
  retrievedAt: timestamp,
  authority: sourceAuthoritySchema,
  sourceType: z.string().trim().min(1),
  region: z.string().trim().optional(),
  language: z.string().trim().min(2),
  accessState: z.enum(["accessible", "restricted", "unavailable", "unknown"]),
  httpStatus: z.number().int().min(100).max(599).optional(),
});

export const claimSchema = z.object({
  id: identifier,
  storyId: identifier,
  text: z.string().trim().min(1),
  status: claimStatusSchema,
  confidence: z.number().min(0).max(1).optional(),
  lastVerifiedAt: timestamp.optional(),
  editorNote: z.string().trim().optional(),
});

export const evidenceLinkSchema = z.object({
  id: identifier,
  claimId: identifier,
  sourceDocumentId: identifier,
  relation: z.enum(["supports", "contradicts", "context"]),
  passageLocator: z.string().trim().optional(),
  addedBy: identifier,
  addedAt: timestamp,
});

export const citationSchema = z.object({
  id: identifier,
  sourceDocumentId: identifier,
  scope: citationScopeSchema,
  sectionId: identifier.optional(),
  claimId: identifier.optional(),
}).superRefine((citation, context) => {
  if (citation.scope === "section" && !citation.sectionId) {
    context.addIssue({ code: "custom", message: "Section citation requires sectionId" });
  }
  if (citation.scope === "claim" && !citation.claimId) {
    context.addIssue({ code: "custom", message: "Claim citation requires claimId" });
  }
});

export const mediaAssetSchema = z.object({
  id: identifier,
  kind: z.enum(["image", "video", "document", "chart"]),
  originUrl: z.url(),
  creator: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  licence: z.string().trim().optional(),
  rightsStatus: z.enum(["pending", "approved", "rejected", "expired"]),
  attributionRequired: z.boolean(),
  attributionText: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  altText: z.string().trim().optional(),
  generated: z.boolean().default(false),
  retrievedAt: timestamp,
});

export const articleSectionSchema = z.object({
  id: identifier,
  heading: z.string().trim().optional(),
  body: z.string().trim().min(1),
  citationIds: z.array(identifier).default([]),
  mediaAssetIds: z.array(identifier).default([]),
});

export const articleSchema = z.object({
  id: identifier,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  headline: z.string().trim().min(1),
  standfirst: z.string().trim().min(1),
  type: contentTypeSchema,
  status: editorialStatusSchema,
  authorIds: z.array(identifier).min(1),
  categoryIds: z.array(identifier).min(1),
  topicIds: z.array(identifier).default([]),
  entityIds: z.array(identifier).default([]),
  sections: z.array(articleSectionSchema).min(1),
  citationIds: z.array(identifier).default([]),
  heroMediaAssetId: identifier.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp.optional(),
  revision: z.number().int().positive(),
});

export type Article = z.infer<typeof articleSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type SourceDocument = z.infer<typeof sourceDocumentSchema>;
