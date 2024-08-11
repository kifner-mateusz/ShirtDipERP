import { type DBType, db } from "../../../db";
import { customers } from "../../customer/schema";
import { eq, sql } from "drizzle-orm";
import type { Address } from "../../address/validator";

// compile query ahead of time
const customerToAddressRelationGetOnly = db.query.customers
  .findFirst({
    where: eq(customers.id, sql.placeholder("customerId")),
    with: {
      address: true,
    },
  })
  .prepare("customerToAddressRelationGetOnly");

async function get(customerId: number): Promise<Address> {
  const customer = await customerToAddressRelationGetOnly.execute({
    customerId,
  });
  if (!customer)
    throw new Error(
      `[CustomerService]: Could not find customer with id ${customerId}`,
    );
  if (!customer.address)
    throw new Error(
      `[CustomerService]: Could not find address relation for customer with id ${customerId}`,
    );

  return customer.address;
}

async function connect(customerId: number, addressId: number, tx: DBType = db) {
  const customerToAddressRelation = await tx
    .update(customers)
    .set({
      addressId: addressId,
    })
    .where(eq(customers.id, customerId))
    .returning();

  if (!customerToAddressRelation[0])
    throw new Error(
      `[CustomerService]: Could not connect address with id ${addressId} to customer with id ${customerId}`,
    );
  return customerToAddressRelation[0].addressId;
}

async function disconnect(customerId: number, tx: DBType = db) {
  const customerToAddressRelation = await tx
    .update(customers)
    .set({
      addressId: null,
    })
    .where(eq(customers.id, customerId))
    .returning();

  if (!customerToAddressRelation[0])
    throw new Error(
      `[CustomerService]: Could not disconnect address from customer with id ${customerId}`,
    );
  return customerToAddressRelation[0];
}

export default {
  get,
  set: connect,
  connect,
  disconnect,
};
