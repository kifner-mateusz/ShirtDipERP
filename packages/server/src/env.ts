/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    SECRET_COOKIE_PASSWORD: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    REGISTER_CODE: z.string(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z.enum(["development", "test", "production"]),
    NEXT_PUBLIC_START_MESSAGE: z.string().optional(),
    NEXT_PUBLIC_DEMO: z.preprocess(
      (v) => v === "true" || v === "1",
      z.boolean().default(false),
    ),
    NEXT_PUBLIC_ORGANIZATION_NAME: z.string().default("ShirtERP"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_START_MESSAGE: process.env.NEXT_PUBLIC_START_MESSAGE,
    NEXT_PUBLIC_DEMO: process.env.NEXT_PUBLIC_DEMO,
    NEXT_PUBLIC_ORGANIZATION_NAME: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
