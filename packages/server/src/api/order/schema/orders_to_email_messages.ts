import { relations } from "drizzle-orm";
import { integer, primaryKey } from "drizzle-orm/pg-core";
import { email_messages } from "../../email-message/schema";
import { orders } from "./orders";
import { pgTable } from "../../../db/pgTable";

export const orders_to_email_messages = pgTable(
  "orders_to_email_messages",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    emailMessageId: integer("email_message_id")
      .notNull()
      .references(() => email_messages.id),
  },
  (t) => ({
    pk: primaryKey(t.orderId, t.emailMessageId),
  }),
);

export const orders_to_email_messages_relations = relations(
  orders_to_email_messages,
  ({ one }) => ({
    orders: one(orders, {
      fields: [orders_to_email_messages.orderId],
      references: [orders.id],
    }),
    emailMessages: one(email_messages, {
      fields: [orders_to_email_messages.emailMessageId],
      references: [email_messages.id],
    }),
  }),
);
