import { relations } from "drizzle-orm";
import { boolean, integer, serial, text, varchar } from "drizzle-orm/pg-core";
import { metadata } from "../../db/_metadata";
import { addresses } from "../address/schema";
import { pgTable } from "../../db/pgTable";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).default(""),
  firstname: varchar("firstname", { length: 255 }).default(""),
  lastname: varchar("lastname", { length: 255 }).default(""),
  email: varchar("email", { length: 255 }).default(""),
  phoneNumber: varchar("phone_number", { length: 255 }).default(""),
  companyName: varchar("company_name", { length: 255 }).default(""),
  notes: text("notes").default("<p></p>"),
  addressId: integer("address_id").references(() => addresses.id, {
    onDelete: "cascade",
  }),
  isTemplate: boolean("is_template").default(false),
  ...metadata,
});

export const customers_relations = relations(customers, ({ one }) => ({
  address: one(addresses, {
    fields: [customers.addressId],
    references: [addresses.id],
  }),
}));
