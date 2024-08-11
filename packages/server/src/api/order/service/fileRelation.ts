import { type DBType, db } from "@/db";
import { orders, orders_to_files } from "../schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { File } from "../../file/validator";
import { baseUrl } from "../../file/config";

// compile query ahead of time
const orderToFileRelationGetAll = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("orderId")),
    with: {
      files: { with: { files: true } },
    },
  })
  .prepare("orderToFileRelationGetAll");

async function getAll(orderId: number): Promise<File[]> {
  const order = await orderToFileRelationGetAll.execute({ orderId });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${orderId}`);
  if (order.files === undefined)
    throw new Error(
      `[OrderService]: Could not find file relation for order with id ${orderId}`,
    );

  return order.files.map((v) => ({
    ...v.files,
    url: `${baseUrl}${v.files?.filename}?token=${v.files?.token}`,
  }));
}

async function connect(orderId: number, fileId: number, tx: DBType = db) {
  const orderToFileRelation = await tx
    .insert(orders_to_files)
    .values({ orderId, fileId })
    .returning();
  if (!orderToFileRelation[0])
    throw new Error(
      `[OrderService]: Could not connect file with id ${fileId} to order with id ${orderId}`,
    );
  return orderToFileRelation[0];
}

async function connectMany(
  orderId: number,
  fileIds: number[],
  tx: DBType = db,
) {
  if (fileIds.length === 0)
    throw new Error(
      `[OrderService]: Could not connect files with ids ${fileIds} to order with id ${orderId}`,
    );
  const orderToFileRelation = await tx
    .insert(orders_to_files)
    .values(fileIds.map((fileId) => ({ orderId, fileId })))
    .returning();
  if (orderToFileRelation.length !== fileIds.length)
    throw new Error(
      `[OrderService]: Could not connect files with ids ${fileIds} to order with id ${orderId}`,
    );
  return orderToFileRelation;
}

async function disconnect(orderId: number, fileId: number, tx: DBType = db) {
  const orderToFileRelation = await tx
    .delete(orders_to_files)
    .where(
      and(
        eq(orders_to_files.orderId, orderId),
        eq(orders_to_files.fileId, fileId),
      ),
    )
    .returning();
  if (!orderToFileRelation[0])
    throw new Error(
      `[OrderService]: Could not disconnect file with id ${fileId} to order with id ${orderId}`,
    );
  return orderToFileRelation[0];
}

async function disconnectMany(
  orderId: number,
  fileIds: number[],
  tx: DBType = db,
) {
  if (fileIds.length === 0)
    throw new Error(
      `[OrderService]: Could not disconnect files with ids ${fileIds} to order with id ${orderId}`,
    );

  const orderToFileRelation = await tx
    .delete(orders_to_files)
    .where(
      and(
        eq(orders_to_files.orderId, orderId),
        inArray(orders_to_files.fileId, fileIds),
      ),
    )
    .returning();
  if (orderToFileRelation.length !== fileIds.length)
    throw new Error(
      `[OrderService]: Could not disconnect files with ids ${fileIds} to order with id ${orderId}`,
    );
  return orderToFileRelation;
}

async function disconnectAll(orderId: number, tx: DBType = db) {
  return await tx
    .delete(orders_to_files)
    .where(eq(orders_to_files.orderId, orderId))
    .returning();
}

async function set(orderId: number, fileIds: number[], tx: DBType = db) {
  const fileRelationsRaw = await tx
    .select()
    .from(orders_to_files)
    .where(eq(orders_to_files.orderId, orderId));
  const fileRelationIds = fileRelationsRaw.map((v) => v.fileId);

  const toBeDisconnected = fileRelationIds.filter(
    (id) => !fileIds.includes(id),
  );
  await disconnectMany(orderId, toBeDisconnected);

  const toBeConnected = fileIds.filter((id) => !fileRelationIds.includes(id));
  await connectMany(orderId, toBeConnected);

  return fileIds;
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
