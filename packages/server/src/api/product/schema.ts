import { relations, sql } from "drizzle-orm";
import { boolean, decimal, serial, text, varchar } from "drizzle-orm/pg-core";
import { metadata } from "../../db/_metadata";
import { orders_to_products } from "../order/schema";
import { pgTable } from "../../db/pgTable";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique(),
  category: varchar("category", { length: 255 }).default(""),
  description: text("description").default(""),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).default(
    sql`'0'::int`,
  ),
  colors: varchar("colors", { length: 64 })
    .array()
    .default(sql`ARRAY[]::varchar[]`),
  sizes: varchar("sizes", { length: 255 })
    .array()
    .default(sql`ARRAY[]::varchar[]`),
  isTemplate: boolean("is_template").default(false),

  ...metadata,
});

export const products_relations = relations(products, ({ many }) => ({
  orders: many(orders_to_products),
}));
