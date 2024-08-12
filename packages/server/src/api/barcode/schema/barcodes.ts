import { metadata } from "../../../db/_metadata";
import { serial } from "drizzle-orm/pg-core";
import { pgTable } from "../../../db/pgTable";

export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  ...metadata,
});
