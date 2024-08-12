import { relations } from "drizzle-orm";
import { boolean, integer, serial, varchar } from "drizzle-orm/pg-core";
import { metadata } from "../../../db/_metadata";
import { email_credentials_to_users } from "./email_credentials_to_users";
import { pgTable } from "../../../db/pgTable";

export const email_credentials = pgTable("email_credentials", {
  id: serial("id").primaryKey(),
  host: varchar("host", { length: 255 }).default(""),
  port: integer("port").notNull().default(993),
  user: varchar("user", { length: 255 }).default(""),
  protocol: varchar("protocol", { length: 255 }).default("imap"),
  password: varchar("password", { length: 255 }).default(""),
  secure: boolean("boolean").default(true),
  ...metadata,
});

export const email_credentials_relations = relations(
  email_credentials,
  ({ many }) => ({
    users: many(email_credentials_to_users),
  }),
);
