import { timestamp, varchar, text } from "drizzle-orm/pg-core";

import { pgTable } from "@/db/pgTable";
import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { users } from "../user/schema";

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const authTokens = pgTable("access_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomBytes(20).toString("base64url")),
  userId: text("user_id").notNull(),
  token: varchar("token", { length: 30 })
    .notNull()
    .$defaultFn(() => crypto.randomBytes(20).toString("base64url")),
  expiration_date: timestamp("expiration_date", {
    withTimezone: true,
    mode: "date",
  }).default(sql<Date>`NOW() + INTERVAL '15 minutes'`),
});
