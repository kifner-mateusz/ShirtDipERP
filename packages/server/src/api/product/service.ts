import { type DBType, db } from "../../db";
import { products } from "./schema";
import { eq, inArray, sql } from "drizzle-orm";
import type { Product, UpdatedProduct } from "./validator";
import type { MetadataType } from "../../types/MetadataType";
import { orders_to_products } from "../order/schema";

// compile query ahead of time
const productPrepareGetById = db.query.products
  .findFirst({
    where: eq(products.id, sql.placeholder("id")),
  })
  .prepare("productPrepareGetById");

async function getById(id: number): Promise<Product> {
  const product = await productPrepareGetById.execute({ id });
  if (!product)
    throw new Error(`[ProductService]: Could not find product with id ${id}`);
  return product;
}

// compile query ahead of time
const productPrepareGetManyById = db
  .select()
  .from(products)
  .where(inArray(products.id, sql.placeholder("ids")))
  .prepare("productPrepareGetManyById");

async function getManyByIds(ids: number[]): Promise<Product[]> {
  const products = await productPrepareGetManyById.execute({ ids });
  if (products.length !== ids.length)
    throw new Error(
      `[ProductService]: Could not find products with ids ${ids}`,
    );
  return products;
}

async function create(
  productData: Partial<Product>,
  tx: DBType = db,
): Promise<Product> {
  const newProduct = await tx.insert(products).values(productData).returning();
  if (!newProduct[0])
    throw new Error(
      `[ProductService]: Could not create product with name ${productData?.name}`,
    );
  return newProduct[0];
}

async function deleteById(id: number, tx: DBType = db): Promise<Product> {
  await tx
    .delete(orders_to_products)
    .where(eq(orders_to_products.productId, id));
  const deletedProduct = await tx
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  if (!deletedProduct[0])
    throw new Error(`[ProductService]: Could not delete product with id ${id}`);
  return deletedProduct[0];
}

async function update(
  productData: UpdatedProduct & MetadataType,
  tx: DBType = db,
): Promise<Product> {
  const { id, ...dataToUpdate } = productData;
  const updatedProduct = await tx
    .update(products)
    .set(dataToUpdate)
    .where(eq(products.id, id))
    .returning();
  if (!updatedProduct[0])
    throw new Error(`[ProductService]: Could not update product with id ${id}`);
  return updatedProduct[0];
}

const productService = { getById, getManyByIds, create, deleteById, update };

export default productService;
