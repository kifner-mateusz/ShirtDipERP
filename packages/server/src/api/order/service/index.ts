import { type DBType, db } from "../../../db";
import { orders } from "../schema";
import { eq, sql } from "drizzle-orm";
import type {
  NewOrder,
  NewOrderWithRelationsByIds,
  UpdatedOrder,
} from "../validator";
import type { MetadataType } from "../../../types/MetadataType";
import addressService from "../../address/service";
import spreadsheetService from "../../spreadsheet/service";
import productRelation from "./productRelation";
import userRelation from "./userRelation";
import fileRelation from "./fileRelation";
import emailMessageRelation from "./emailMessageRelation";
import customerRelation from "./customerRelation";
import addressRelation from "./addressRelation";
import spreadsheetManager from "./spreadsheetManager";

// BUG: fix update procedure

// compile query ahead of time
const orderPrepareGetByIdFull = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("id")),
    with: {
      address: true,
      customer: true,
      emails: { with: { emailMessages: true } },
      employees: { with: { users: true } },
      files: { with: { files: true } },
      products: { with: { products: true } },
      spreadsheets: true,
    },
  })
  .prepare("orderPrepareGetFullById");

async function getByIdFull(id: number) {
  const order = await orderPrepareGetByIdFull.execute({ id });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${id}`);
  const { emails, employees, files, products, ...moreData } = order;
  return {
    ...moreData,
    emails: emails.map((v) => v.emailMessages),
    employees: employees.map((v) => v.users),
    files: files.map((v) => v.files),
    products: products.map((v) => v.products),
  };
}

// compile query ahead of time
const orderPrepareGetByIdWithBasicRelations = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("id")),
    with: {
      address: true,
      customer: true,
    },
  })
  .prepare("orderPrepareGetByIdWithBasicRelations");

async function getByIdWithBasicRelations(id: number) {
  const order = await orderPrepareGetByIdWithBasicRelations.execute({ id });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${id}`);

  return order;
}

// compile query ahead of time
const dbPrepareGetById = db.query.orders
  .findFirst({
    where: eq(orders.id, sql.placeholder("id")),
    with: {
      emails: true,
      employees: true,
      files: true,
      products: true,
      spreadsheets: true,
    },
  })
  .prepare("orderPrepareGetById");

async function getById(id: number) {
  const order = await dbPrepareGetById.execute({ id });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${id}`);
  const { emails, employees, files, products, spreadsheets, ...moreData } =
    order;
  return {
    ...moreData,
    emails: emails.map((v) => v.emailMessageId),
    employees: employees.map((v) => v.userId),
    files: files.map((v) => v.fileId),
    products: products.map((v) => v.productId),
    spreadsheets: spreadsheets.map((v) => v.id),
  };
}

async function create(orderData: NewOrder & MetadataType, tx: DBType = db) {
  const newOrder = await tx.insert(orders).values(orderData).returning();
  if (!newOrder[0])
    throw new Error(
      `[OrderService]: Could not create order with name ${orderData?.name}`,
    );

  return newOrder[0];
}

async function createFullByValue(
  orderData: NewOrder & MetadataType,
  tx: DBType = db,
) {
  const {
    products,
    emails,
    employees,
    files,
    address,

    addressId,
    spreadsheets,
    ...moreData
  } = orderData;

  let newAddressId: number | undefined;
  if (address) {
    const newAddress = await addressService.create(
      {
        ...address,
        id: undefined,
      },
      tx,
    );
    if (!newAddress)
      throw new Error(
        `[OrderService]: Could not create order with name ${orderData?.name}, provided address could not be created`,
      );
    newAddressId = newAddress.id;
  }
  const newOrder = await tx
    .insert(orders)
    .values(
      newAddressId === undefined
        ? moreData
        : { ...moreData, addressId: newAddressId },
    )
    .returning();
  if (!newOrder[0])
    throw new Error(
      `[OrderService]: Could not create order with name ${orderData?.name}`,
    );
  const orderId = newOrder[0].id;
  if (products?.length && products.length > 0)
    await productRelation.set(
      orderId,
      (products as { id?: number }[])
        .map((v) => v.id)
        .filter((v): v is number => !!v),
      tx,
    );

  if (emails?.length && emails.length > 0)
    await emailMessageRelation.set(
      orderId,
      (emails as { id?: number }[])
        .map((v) => v.id)
        .filter((v): v is number => !!v),
      tx,
    );

  if (employees?.length && employees.length > 0)
    await userRelation.set(
      orderId,
      (employees as { id?: string }[])
        .map((v) => v.id)
        .filter((v): v is string => !!v),
      tx,
    );

  if (files?.length && files.length > 0)
    await productRelation.set(
      orderId,
      (files as { id?: number }[])
        .map((v) => v.id)
        .filter((v): v is number => !!v),
      tx,
    );

  if (spreadsheets?.length && spreadsheets.length > 0) {
    for (const spreadsheet of spreadsheets) {
      await spreadsheetService.create(
        {
          ...spreadsheet,
          orderId,
          createdById: newOrder[0].createdById,
          updatedById: newOrder[0].updatedById,
        },
        tx,
      );
    }
  }

  return newOrder[0];
}

async function createFull(
  orderData: NewOrderWithRelationsByIds & MetadataType,
  tx: DBType = db,
) {
  const {
    products,
    emails,
    employees,
    files,
    address,

    addressId,
    spreadsheets,
    ...moreData
  } = orderData;

  let newAddressId: number | undefined;
  if (address) {
    const newAddress = await addressService.create(
      {
        ...address,
        id: undefined,
      },
      tx,
    );
    if (!newAddress)
      throw new Error(
        `[OrderService]: Could not create order with name ${orderData?.name}, provided address could not be created`,
      );
    newAddressId = newAddress.id;
  }
  const newOrder = await tx
    .insert(orders)
    .values(
      newAddressId === undefined
        ? moreData
        : { ...moreData, addressId: newAddressId },
    )
    .returning();
  if (!newOrder[0])
    throw new Error(
      `[OrderService]: Could not create order with name ${orderData?.name}`,
    );
  const orderId = newOrder[0].id;
  if (products?.length && products.length > 0)
    await productRelation.set(orderId, products, tx);

  if (emails?.length && emails.length > 0)
    await emailMessageRelation.set(orderId, emails, tx);

  if (employees?.length && employees.length > 0)
    await userRelation.set(orderId, employees, tx);

  if (files?.length && files.length > 0)
    await productRelation.set(orderId, files, tx);

  if (spreadsheets?.length && spreadsheets.length > 0) {
    const newSpreadSheets = await Promise.all(
      spreadsheets.map((id) => spreadsheetService.getById(id)),
    );

    for (const spreadsheet of newSpreadSheets) {
      await spreadsheetService.create(
        {
          ...spreadsheet,
          orderId,
          createdById: newOrder[0].createdById,
          updatedById: newOrder[0].updatedById,
        },
        tx,
      );
    }
  }

  return newOrder[0];
}

// TODO: make this transaction
async function deleteById(id: number, tx: DBType = db) {
  const order = await tx.query.orders.findFirst({
    where: eq(orders.id, id),
  });
  if (!order)
    throw new Error(`[OrderService]: Could not find order with id ${id}`);
  if (order.addressId !== null)
    await addressService.deleteById(order.addressId);

  // remove all spreadsheets
  await spreadsheetManager.deleteAllRelated(id, tx);

  // disconnect all relations
  await userRelation.disconnectAll(id, tx);
  await productRelation.disconnectAll(id, tx);
  await fileRelation.disconnectAll(id, tx);
  await emailMessageRelation.disconnectAll(id, tx);

  const deletedOrder = await tx
    .delete(orders)
    .where(eq(orders.id, id))
    .returning();
  if (!deletedOrder[0])
    throw new Error(`[OrderService]: Could not delete order with id ${id}`);
  return deletedOrder[0];
}

async function update(orderData: UpdatedOrder & MetadataType, tx: DBType = db) {
  const {
    id,
    emails,
    employees,
    files,
    products,
    spreadsheets,
    ...dataToUpdate
  } = orderData;
  const updatedOrder = await tx
    .update(orders)
    .set(dataToUpdate)
    .where(eq(orders.id, id))
    .returning();
  if (!updatedOrder[0])
    throw new Error(`[OrderService]: Could not update order with id ${id}`);

  if (emails?.length && emails?.length > 0) {
    await emailMessageRelation.set(id, emails, tx);
  }
  if (employees?.length && employees?.length > 0) {
    await userRelation.set(id, employees, tx);
  }
  if (files?.length && files?.length > 0) {
    await fileRelation.set(id, files, tx);
  }
  if (products?.length && products?.length > 0) {
    await productRelation.set(id, products, tx);
  }

  if (spreadsheets?.length && spreadsheets?.length > 0) {
    await spreadsheetManager.addOrDelete(
      id,
      spreadsheets,
      orderData.updatedById,
      tx,
    );
  }

  return updatedOrder[0];
}

const orderService = {
  getByIdFull,
  getByIdWithBasicRelations,
  getById,
  create,
  createFull,
  createFullByValue,
  update,
  deleteById,
  addressRelation,
  customerRelation,
  emailMessageRelation,
  fileRelation,
  productRelation,
  spreadsheetManager,
  userRelation,
};

export default orderService;
