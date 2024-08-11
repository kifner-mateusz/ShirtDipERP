import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { metadata } from "../../../db/_metadata";
import { addresses } from "../../address/schema";
import { customers } from "../../customer/schema";
import { orders_to_email_messages } from "./orders_to_email_messages";
import { orders_to_files } from "./orders_to_files";
import { orders_to_products } from "./orders_to_products";
import { orders_to_users } from "./orders_to_users";
import { spreadsheets } from "../../spreadsheet/schema";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).default(""),
  status: varchar("status", { length: 255 }).default("planned"),
  notes: varchar("notes", { length: 255 }).default("<p></p>"),
  price: varchar("price", { length: 255 }).default(""),
  isPricePaid: boolean("is_price_paid").default(false),
  isInWarehouse: boolean("is_in_warehouse").default(false),
  isProductOrdered: boolean("is_product_ordered").default(false),
  dateOfCompletion: date("date_of_completion"),
  dateOfAdmission: date("date_of_admission").defaultNow(),
  workstationType: varchar("workstation_type", { length: 255 }).default(
    "not_set", // not_set/screen_printing/foil/dtf/other
  ),
  pickupMethod: varchar("pickup_method", { length: 255 }).default(
    "not_set", // not_set/shipping/in_person/delivery
  ),
  settlement: varchar("settlement", { length: 64 }).default(
    "not_set", // not_set/invoice/receipt
  ),
  workTime: doublePrecision("work_time").default(0.0),
  customerId: integer("customer_id").references(() => customers.id),
  addressId: integer("address_id").references(() => addresses.id, {
    onDelete: "cascade",
  }),
  isArchived: boolean("is_archived").default(false),
  isTemplate: boolean("is_template").default(false),
  ...metadata,
});

export const orders_relations = relations(orders, ({ one, many }) => ({
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  files: many(orders_to_files),
  products: many(orders_to_products),
  employees: many(orders_to_users),
  emails: many(orders_to_email_messages),
  spreadsheets: many(spreadsheets),
}));
