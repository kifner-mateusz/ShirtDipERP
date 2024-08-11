import { type DBType, db } from "../../../db";
import { orders } from "../../order/schema";
import { eq, sql } from "drizzle-orm";
import type { Address } from "../../address/validator";

// compile query ahead of time
const orderToAddressRelationGetOnly = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("orderId")),
    with: {
      address: true,
    },
  })
  .prepare("orderToAddressRelationGetOnly");

async function get(orderId: number): Promise<Address | null> {
  const order = await orderToAddressRelationGetOnly.execute({ orderId });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${orderId}`);

  return order.address;
}

async function connect(orderId: number, addressId: number, tx: DBType = db) {
  const orderToAddressRelation = await tx
    .update(orders)
    .set({
      addressId: addressId,
    })
    .where(eq(orders.id, orderId))
    .returning();

  if (!orderToAddressRelation[0])
    throw new Error(
      `[OrderService]: Could not connect address with id ${addressId} to order with id ${orderId}`,
    );
  return orderToAddressRelation[0].addressId;
}

async function disconnect(orderId: number, tx: DBType = db) {
  const orderToAddressRelation = await tx
    .update(orders)
    .set({
      addressId: null,
    })
    .where(eq(orders.id, orderId))
    .returning();

  if (!orderToAddressRelation[0])
    throw new Error(
      `[OrderService]: Could not disconnect address from order with id ${orderId}`,
    );
  return orderToAddressRelation[0];
}

export default {
  get,
  set: connect,
  connect,
  disconnect,
};
