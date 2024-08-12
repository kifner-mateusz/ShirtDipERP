import { boolean, decimal, json, serial, varchar } from "drizzle-orm/pg-core";
import { metadata } from "../../db/_metadata";
import { sql } from "drizzle-orm";
import { pgTable } from "../../db/pgTable";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).default(""),
  cost: decimal("cost", { precision: 10, scale: 2 }).default(sql`'0'::int`),
  expenseData: json("expense_data")
    .$type<{ name?: string; amount?: number }[]>()
    .default([]),
  isTemplate: boolean("is_template").default(false),

  ...metadata,
});
