import { type DBType, db } from "@/db";
import { addresses } from "@/api/address/schema";
import { customers } from "@/api/customer/schema";
import type {
  Customer,
  CustomerWithRelations,
  UpdatedCustomer,
} from "@/api/customer/validator";
import { eq, sql } from "drizzle-orm";
import addressServices from "../../address/service";
import type { MetadataType } from "@/types/MetadataType";
import _ from "lodash";
import addressRelation from "./addressRelation";
import type { Address } from "../../address/validator";

// compile query ahead of time
const customerPrepareGetFullById = db.query.customers
  .findFirst({
    where: eq(customers.id, sql.placeholder("id")),
    with: {
      address: true,
    },
  })
  .prepare("customerPrepareGetFullById");

async function getFullById(id: number) {
  const customer = await customerPrepareGetFullById.execute({ id });
  if (!customer)
    throw new Error(`[CustomerService]: Could not find customer with id ${id}`);
  return customer;
}

// compile query ahead of time
const customerPrepareGetById = db.query.customers
  .findFirst({
    where: eq(customers.id, sql.placeholder("id")),
  })
  .prepare("customerPrepareGetById");

async function getById(id: number): Promise<Customer> {
  const customer = await customerPrepareGetById.execute({ id });
  if (!customer)
    throw new Error(`[CustomerService]: Could not find customer with id ${id}`);
  return customer;
}

async function create(
  customerData: Partial<CustomerWithRelations & MetadataType>,
  tx: DBType = db,
): Promise<Customer> {
  const { address, ...simpleCustomerData } = customerData;
  let newAddress: Address;
  try {
    newAddress = await addressServices.create(_.omit(address, "id") ?? {}, tx);
  } catch (e) {
    console.log(e);
    throw new Error(
      `[CustomerService]: Could not create customer with username ${customerData?.username}, address could not be created`,
    );
  }
  const newCustomer = await tx
    .insert(customers)
    .values({ ...simpleCustomerData, addressId: newAddress.id })
    .returning();
  if (!newCustomer[0])
    throw new Error(
      `[CustomerService]: Could not create customer with username ${customerData?.username}`,
    );
  return newCustomer[0];
}

async function deleteById(id: number, tx: DBType = db): Promise<Customer> {
  const customer = await getById(id);
  if (!customer) {
    throw new Error(`[CustomerService]: Customer with id ${id} not found`);
  }
  if (!customer.addressId) {
    throw new Error(
      `[CustomerService]: Customer with id ${id} doesn't have an associated address, this should never happen`,
    );
  }
  // delete customer by cascade
  const deletedAddress = await tx
    .delete(addresses)
    .where(eq(addresses.id, customer.addressId))
    .returning();
  if (!deletedAddress[0])
    throw new Error(
      `[CustomerService]: Could not delete customer with id ${id}, associated address could not be deleted`,
    );
  return customer;
}

async function update(
  customerData: UpdatedCustomer & MetadataType,
  tx: DBType = db,
): Promise<Customer> {
  const { id, ...dataToUpdate } = customerData;
  const updatedCustomer = await tx
    .update(customers)
    .set(dataToUpdate)
    .where(eq(customers.id, id))
    .returning();
  if (!updatedCustomer[0])
    throw new Error(
      `[CustomerService]: Could not update customer with id ${id}`,
    );
  return updatedCustomer[0];
}

const customerService = {
  getFullById,
  getById,
  create,
  deleteById,
  update,
  addressRelation,
};

export default customerService;
