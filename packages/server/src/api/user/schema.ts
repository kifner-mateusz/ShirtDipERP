import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { metadata } from "../../db/_metadata";
import { authTokens } from "../auth/schema";

export const roleEnum = pgEnum("role", [
  "normal",
  "employee",
  "manager",
  "admin",
]);

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
  role: roleEnum("role").notNull().default("normal"),
  tokenId: text("tokenId").references(() => authTokens.id),
  wsTokenId: text("wsTokenId").references(() => authTokens.id),
  ...metadata,
});

export const userRelations = relations(users, ({ one }) => ({
  token: one(authTokens, {
    fields: [users.tokenId],
    references: [authTokens.id],
  }),
  wsToken: one(authTokens, {
    fields: [users.wsTokenId],
    references: [authTokens.id],
  }),
}));

export type UserRole = (typeof roleEnum.enumValues)[number];
