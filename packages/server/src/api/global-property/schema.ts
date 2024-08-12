import { sql } from "drizzle-orm";
import { serial, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "../../db/pgTable";

export const global_properties = pgTable("global_properties", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 255 }).notNull().default(""),
  name: varchar("name", { length: 255 }).unique().notNull(),
  data: varchar("data", { length: 255 })
    .array()
    .default(sql`ARRAY[]::varchar[]`),
});
