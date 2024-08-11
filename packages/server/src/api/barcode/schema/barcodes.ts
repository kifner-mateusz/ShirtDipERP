import { metadata } from "../../../db/_metadata";
import { pgTable, serial } from "drizzle-orm/pg-core";

export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  ...metadata,
});
