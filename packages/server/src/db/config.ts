import type { Config } from "drizzle-kit";
import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

// Push requires SSL so use URL instead of username/password
// export const connectionStr = new URL(env.DATABASE_URL);
// connectionStr.searchParams.set("ssl", '{"rejectUnauthorized":true}');

export const connectionStr = env.DATABASE_URL;

export default {
  schema: "./src/schemas.ts",
  dialect: "postgresql",
  dbCredentials: { url: connectionStr },
  tablesFilter: ["tyfons_lab_*"],
} satisfies Config;
