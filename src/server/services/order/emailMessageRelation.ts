import { DBType, db } from "@/server/db";
import { orders_to_email_messages } from "@/server/db/schema/orders_to_email_messages";
import { and, eq, inArray } from "drizzle-orm";

async function connect(
  orderId: number,
  emailMessageId: number,
  tx: DBType = db,
) {
  const orderToEmailMessageRelation = await tx
    .insert(orders_to_email_messages)
    .values({ orderId, emailMessageId })
    .returning();
  if (!orderToEmailMessageRelation[0])
    throw new Error(
      `[OrderService]: Could not connect email message with id ${emailMessageId} to order with id ${orderId}`,
    );
  return orderToEmailMessageRelation[0];
}

async function connectMany(
  orderId: number,
  emailMessageIds: number[],
  tx: DBType = db,
) {
  if (emailMessageIds.length === 0)
    throw new Error(
      `[OrderService]: Could not connect email_messages with ids ${emailMessageIds} to order with id ${orderId}`,
    );
  const orderToEmailMessageRelation = await tx
    .insert(orders_to_email_messages)
    .values(
      emailMessageIds.map((emailMessageId) => ({ orderId, emailMessageId })),
    )
    .returning();
  if (orderToEmailMessageRelation.length !== emailMessageIds.length)
    throw new Error(
      `[OrderService]: Could not connect email_messages with ids ${emailMessageIds} to order with id ${orderId}`,
    );
  return orderToEmailMessageRelation;
}

async function disconnect(
  orderId: number,
  emailMessageId: number,
  tx: DBType = db,
) {
  const orderToEmailMessageRelation = await tx
    .delete(orders_to_email_messages)
    .where(
      and(
        eq(orders_to_email_messages.orderId, orderId),
        eq(orders_to_email_messages.emailMessageId, emailMessageId),
      ),
    )
    .returning();
  if (!orderToEmailMessageRelation[0])
    throw new Error(
      `[OrderService]: Could not disconnect email message with id ${emailMessageId} to order with id ${orderId}`,
    );
  return orderToEmailMessageRelation[0];
}

async function disconnectMany(
  orderId: number,
  emailMessageIds: number[],
  tx: DBType = db,
) {
  if (emailMessageIds.length === 0)
    throw new Error(
      `[OrderService]: Could not disconnect email messages with ids ${emailMessageIds} to order with id ${orderId}`,
    );

  const orderToEmailMessageRelation = await tx
    .delete(orders_to_email_messages)
    .where(
      and(
        eq(orders_to_email_messages.orderId, orderId),
        inArray(orders_to_email_messages.emailMessageId, emailMessageIds),
      ),
    )
    .returning();
  if (orderToEmailMessageRelation.length !== emailMessageIds.length)
    throw new Error(
      `[OrderService]: Could not disconnect email messages with ids ${emailMessageIds} to order with id ${orderId}`,
    );
  return orderToEmailMessageRelation;
}

async function disconnectAll(orderId: number, tx: DBType = db) {
  return await tx
    .delete(orders_to_email_messages)
    .where(eq(orders_to_email_messages.orderId, orderId))
    .returning();
}

async function set(
  orderId: number,
  emailMessageIds: number[],
  tx: DBType = db,
) {
  const emailMessageRelationsRaw = await tx
    .select()
    .from(orders_to_email_messages)
    .where(eq(orders_to_email_messages.orderId, orderId));
  const emailMessageRelationIds = emailMessageRelationsRaw.map(
    (v) => v.emailMessageId,
  );

  const toBeDisconnected = emailMessageRelationIds.filter(
    (id) => !emailMessageIds.includes(id),
  );
  await disconnectMany(orderId, toBeDisconnected);

  const toBeConnected = emailMessageIds.filter(
    (id) => !emailMessageRelationIds.includes(id),
  );
  await connectMany(orderId, toBeConnected);

  return emailMessageIds;
}

export default {
  set,
  connect,
  connectMany,
  disconnect,
  disconnectMany,
  disconnectAll,
};
