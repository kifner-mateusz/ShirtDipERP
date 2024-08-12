import { relations } from "drizzle-orm";
import { integer, primaryKey } from "drizzle-orm/pg-core";
import { files } from "../../file/schema";
import { orders } from "./orders";
import { pgTable } from "../../../db/pgTable";

export const orders_to_files = pgTable(
  "orders_to_files",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    fileId: integer("file_id")
      .notNull()
      .references(() => files.id),
  },
  (t) => ({
    pk: primaryKey(t.orderId, t.fileId),
  }),
);

export const orders_to_files_relations = relations(
  orders_to_files,
  ({ one }) => ({
    orders: one(orders, {
      fields: [orders_to_files.orderId],
      references: [orders.id],
    }),
    files: one(files, {
      fields: [orders_to_files.fileId],
      references: [files.id],
    }),
  }),
);
