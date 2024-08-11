import { relations } from "drizzle-orm";
import { integer, json, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { metadata } from "@/db/_metadata";
import { orders } from "../order/schema/orders";
import type { UniversalMatrix } from "@/components/Spreadsheet/useSpreadSheetData";

export const spreadsheets = pgTable("spreadsheets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  data: json("data").$type<UniversalMatrix>().default([]),
  orderId: integer("order_id").references(() => orders.id),
  ...metadata,
});

export const spreadsheets_relations = relations(spreadsheets, ({ one }) => ({
  order: one(orders, {
    fields: [spreadsheets.orderId],
    references: [orders.id],
  }),
}));
