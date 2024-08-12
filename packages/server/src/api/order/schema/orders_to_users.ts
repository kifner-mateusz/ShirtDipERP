import { relations } from "drizzle-orm";
import { integer, primaryKey, varchar } from "drizzle-orm/pg-core";
import { users } from "../../user/schema";
import { orders } from "./orders";
import { pgTable } from "../../../db/pgTable";

export const orders_to_users = pgTable(
  "orders_to_users",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (t) => ({
    pk: primaryKey(t.orderId, t.userId),
  }),
);

export const orders_to_users_relations = relations(
  orders_to_users,
  ({ one }) => ({
    orders: one(orders, {
      fields: [orders_to_users.orderId],
      references: [orders.id],
    }),
    users: one(users, {
      fields: [orders_to_users.userId],
      references: [users.id],
    }),
  }),
);
