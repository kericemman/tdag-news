import { z } from "zod";

const optionalSecret = z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().min(1).optional());

const configSchema = z.object({
  APP_URL: z.url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HEALTHCHECK_TOKEN: optionalSecret,
  MONGODB_URI: optionalSecret,
  REDIS_URL: optionalSecret,
  OPENAI_API_KEY: optionalSecret,
  AI_MODEL_FAST: z.string().default("gpt-6-luna"),
  AI_MODEL_REASONING: z.string().default("gpt-6.1-sol"),
  AI_MODEL_DEEP: z.string().default("gpt-6-astra"),
  AI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  AI_DAILY_CALL_LIMIT: z.coerce.number().int().min(1).max(10000).default(20),
  AI_MAX_INPUT_CHARS: z.coerce.number().int().min(1000).max(200000).default(30000),
  RESEND_API_KEY: optionalSecret,
  WHATCHIMP_API_KEY: optionalSecret,
  PAYSTACK_SECRET_KEY: optionalSecret,
});

export type AppConfig = z.infer<typeof configSchema>;

export function readConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = configSchema.safeParse(source);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid application configuration: ${names}`);
  }
  return result.data;
}

export function requireConfig<K extends keyof AppConfig>(config: AppConfig, key: K): NonNullable<AppConfig[K]> {
  const value = config[key];
  if (!value) throw new Error(`Missing required configuration: ${key}`);
  return value as NonNullable<AppConfig[K]>;
}
