import { relations } from "drizzle-orm";
import { integer, primaryKey } from "drizzle-orm/pg-core";
import { barcodes } from "./barcodes";
import { orders } from "../../order/schema";
import { pgTable } from "../../../db/pgTable";

export const barcodes_to_order = pgTable(
  "barcodes_to_order",
  {
    barcodeId: integer("barcode_id")
      .notNull()
      .references(() => barcodes.id),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
  },
  (t) => ({
    pk: primaryKey(t.barcodeId, t.orderId),
  }),
);

export const barcodes_to_order_relations = relations(
  barcodes_to_order,
  ({ one }) => ({
    barcodes: one(barcodes, {
      fields: [barcodes_to_order.barcodeId],
      references: [barcodes.id],
    }),
    orders: one(orders, {
      fields: [barcodes_to_order.orderId],
      references: [orders.id],
    }),
  }),
);
