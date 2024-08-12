import { relations } from "drizzle-orm";
import { integer, primaryKey, varchar } from "drizzle-orm/pg-core";
import { users } from "../../user/schema";
import { email_credentials } from "./email_credentials";
import { pgTable } from "../../../db/pgTable";

export const email_credentials_to_users = pgTable(
  "email_credentials_to_users",
  {
    emailCredentialsId: integer("email_credentials_id")
      .notNull()
      .references(() => email_credentials.id),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (t) => ({
    pk: primaryKey(t.emailCredentialsId, t.userId),
  }),
);

export const email_credentials_to_users_relations = relations(
  email_credentials_to_users,
  ({ one }) => ({
    emailCredentials: one(email_credentials, {
      fields: [email_credentials_to_users.emailCredentialsId],
      references: [email_credentials.id],
    }),
    users: one(users, {
      fields: [email_credentials_to_users.userId],
      references: [users.id],
    }),
  }),
);
