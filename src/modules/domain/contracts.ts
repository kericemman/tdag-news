import { z } from "zod";

const id = z.string().trim().min(1);
const instant = z.iso.datetime({ offset: true });

export const personaSchema = z.enum([
  "student", "early_career", "developer", "freelancer", "founder", "startup",
  "business_owner", "manager", "operations_leader", "executive", "investor", "other",
]);

export const userProfileSchema = z.object({
  userId: id,
  displayName: z.string().trim().min(1),
  primaryPersona: personaSchema.optional(),
  secondaryPersonas: z.array(personaSchema).default([]),
  topicIds: z.array(id).default([]),
  followedEntityIds: z.array(id).default([]),
  regions: z.array(z.string().trim().min(2)).default([]),
  opportunityTypes: z.array(z.string().trim().min(1)).default([]),
  updatedAt: instant,
}).superRefine((profile, context) => {
  if (profile.primaryPersona && profile.secondaryPersonas.includes(profile.primaryPersona)) {
    context.addIssue({ code: "custom", message: "Primary persona cannot also be secondary" });
  }
});

export const distributionPreferenceSchema = z.object({
  userId: id,
  emailConsent: z.boolean(),
  emailFrequency: z.enum(["as_relevant", "daily", "weekly", "opportunities_only", "off"]),
  whatsappConsent: z.boolean(),
  whatsappIntensity: z.enum(["daily_brief", "essential", "active", "breaking_only", "paused"]),
  timezone: z.string().default("Africa/Nairobi"),
  updatedAt: instant,
});

export const subscriptionSchema = z.object({
  id,
  userId: id,
  provider: z.enum(["paystack", "mpesa", "stripe", "manual"]),
  providerReference: id,
  planId: id,
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().length(3).default("KES"),
  billingPeriod: z.enum(["monthly", "quarterly", "annual", "manual"]),
  status: z.enum(["pending", "active", "past_due", "grace", "cancel_at_period_end", "canceled", "expired"]),
  currentPeriodStart: instant.optional(),
  currentPeriodEnd: instant.optional(),
  updatedAt: instant,
});

export const storyCandidateSchema = z.object({
  id,
  sourceId: id,
  sourceDocumentId: id.optional(),
  externalId: id.optional(),
  canonicalUrl: z.url(),
  normalizedTitle: z.string().trim().min(1),
  contentHash: z.string().trim().min(1),
  detectedAt: instant,
  publishedAt: instant.optional(),
  clusterId: id.optional(),
  status: z.enum(["new", "triaged", "researching", "merged", "ignored", "rejected"]),
  topicIds: z.array(id).default([]),
  entityIds: z.array(id).default([]),
});

export const storyClusterSchema = z.object({
  id,
  eventTitle: z.string().trim().min(1),
  candidateIds: z.array(id).min(1),
  sourceDocumentIds: z.array(id).default([]),
  entityIds: z.array(id).default([]),
  topicIds: z.array(id).default([]),
  firstDetectedAt: instant,
  lastUpdatedAt: instant,
  confidence: z.number().min(0).max(1).optional(),
  importance: z.number().min(0).max(100).optional(),
  status: z.enum(["open", "researching", "drafting", "published", "closed"]),
});

export const entitySchema = z.object({
  id,
  kind: z.enum(["company", "person", "product", "technology", "organization", "regulator", "country", "industry"]),
  name: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)).default([]),
  officialUrl: z.url().optional(),
  description: z.string().trim().optional(),
  sourceDocumentIds: z.array(id).default([]),
});

export const opportunitySchema = z.object({
  id,
  title: z.string().trim().min(1),
  organization: z.string().trim().min(1),
  type: z.enum(["scholarship", "fellowship", "grant", "accelerator", "incubator", "internship", "job", "hackathon", "competition", "training", "developer_program", "startup_program", "funding"]),
  officialSourceUrl: z.url(),
  applicationUrl: z.url(),
  eligibleCountries: z.array(z.string().trim().min(2)).default([]),
  deadline: instant.optional(),
  verificationStatus: z.enum(["pending", "verified", "expired", "rejected"]),
  reviewedBy: id.optional(),
  updatedAt: instant,
});

export const auditEventSchema = z.object({
  id,
  actorId: id,
  action: z.string().trim().min(1),
  targetType: z.string().trim().min(1),
  targetId: id,
  at: instant,
  reason: z.string().trim().optional(),
  requestId: id.optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type StoryCandidate = z.infer<typeof storyCandidateSchema>;
export type StoryCluster = z.infer<typeof storyClusterSchema>;
