import { type DBType, db } from "@/db";
import { orders, orders_to_users } from "../schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { User } from "../../user/validator";

// compile query ahead of time
const orderToUserRelationGetAll = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("orderId")),
    with: {
      employees: { with: { users: true } },
    },
  })
  .prepare("orderToUserRelationGetAll");

async function getAll(orderId: number): Promise<User[]> {
  const order = await orderToUserRelationGetAll.execute({ orderId });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${orderId}`);
  if (order.employees === undefined)
    throw new Error(
      `[OrderService]: Could not find user relation for order with id ${orderId}`,
    );

  return order.employees.map((v) => v.users);
}

// User <=> Employee
async function connect(orderId: number, userId: string, tx: DBType = db) {
  const orderToUserRelation = await tx
    .insert(orders_to_users)
    .values({ orderId, userId })
    .returning();
  if (!orderToUserRelation[0])
    throw new Error(
      `[OrderService]: Could not connect user with id ${userId} to order with id ${orderId}`,
    );
  return orderToUserRelation[0];
}

// User <=> Employee
async function connectMany(
  orderId: number,
  userIds: string[],
  tx: DBType = db,
) {
  if (userIds.length === 0)
    throw new Error(
      `[OrderService]: Could not connect users with ids ${userIds} to order with id ${orderId}`,
    );
  const orderToUserRelation = await tx
    .insert(orders_to_users)
    .values(userIds.map((userId) => ({ orderId, userId })))
    .returning();
  if (orderToUserRelation.length !== userIds.length)
    throw new Error(
      `[OrderService]: Could not connect users with ids ${userIds} to order with id ${orderId}`,
    );
  return orderToUserRelation;
}

// User <=> Employee
async function disconnect(orderId: number, userId: string, tx: DBType = db) {
  const orderToUserRelation = await tx
    .delete(orders_to_users)
    .where(
      and(
        eq(orders_to_users.orderId, orderId),
        eq(orders_to_users.userId, userId),
      ),
    )
    .returning();
  if (!orderToUserRelation[0])
    throw new Error(
      `[OrderService]: Could not disconnect user with id ${userId} to order with id ${orderId}`,
    );
  return orderToUserRelation[0];
}

async function disconnectMany(
  orderId: number,
  userIds: string[],
  tx: DBType = db,
) {
  if (userIds.length === 0)
    throw new Error(
      `[OrderService]: Could not disconnect users with ids ${userIds} to order with id ${orderId}`,
    );

  const orderToUserRelation = await tx
    .delete(orders_to_users)
    .where(
      and(
        eq(orders_to_users.orderId, orderId),
        inArray(orders_to_users.userId, userIds),
      ),
    )
    .returning();
  if (orderToUserRelation.length !== userIds.length)
    throw new Error(
      `[OrderService]: Could not disconnect users with ids ${userIds} to order with id ${orderId}`,
    );
  return orderToUserRelation;
}

async function disconnectAll(orderId: number, tx: DBType = db) {
  return await tx
    .delete(orders_to_users)
    .where(eq(orders_to_users.orderId, orderId))
    .returning();
}

async function set(orderId: number, userIds: string[], tx: DBType = db) {
  const userRelationsRaw = await tx
    .select()
    .from(orders_to_users)
    .where(eq(orders_to_users.orderId, orderId));
  const userRelationIds = userRelationsRaw.map((v) => v.userId);

  const toBeDisconnected = userRelationIds.filter(
    (id) => !userIds.includes(id),
  );
  await disconnectMany(orderId, toBeDisconnected);

  const toBeConnected = userIds.filter((id) => !userRelationIds.includes(id));
  await connectMany(orderId, toBeConnected);

  return userIds;
}

export default {
  getAll,
  set,
  connect,
  connectMany,
  disconnect,
  disconnectMany,
  disconnectAll,
};
