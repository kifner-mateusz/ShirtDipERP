import { type DBType, db } from "@/db";
import { orders } from "../../order/schema";
import { eq, sql } from "drizzle-orm";
import type { Customer } from "../../customer/validator";

// compile query ahead of time
const orderToCustomerRelationGetOnly = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("orderId")),
    with: {
      customer: true,
    },
  })
  .prepare("orderToCustomerRelationGetOnly");

async function get(orderId: number): Promise<Customer | null> {
  const order = await orderToCustomerRelationGetOnly.execute({ orderId });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${orderId}`);

  return order.customer;
}

async function connect(orderId: number, customerId: number, tx: DBType = db) {
  const orderToCustomerRelation = await tx
    .update(orders)
    .set({
      customerId: customerId,
    })
    .where(eq(orders.id, orderId))
    .returning();

  if (!orderToCustomerRelation[0])
    throw new Error(
      `[OrderService]: Could not connect customer with id ${customerId} to order with id ${orderId}`,
    );
  return orderToCustomerRelation[0].customerId;
}

async function disconnect(orderId: number, tx: DBType = db) {
  const orderToCustomerRelation = await tx
    .update(orders)
    .set({
      customerId: null,
    })
    .where(eq(orders.id, orderId))
    .returning();

  if (!orderToCustomerRelation[0])
    throw new Error(
      `[OrderService]: Could not disconnect customer from order with id ${orderId}`,
    );
  return orderToCustomerRelation[0];
}

export default {
  get,
  set: connect,
  connect,
  disconnect,
};
