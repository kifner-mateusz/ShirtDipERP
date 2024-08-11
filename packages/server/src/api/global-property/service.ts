import { type DBType, db } from "../../db";
import { global_properties } from "./schema";
import { eq, sql } from "drizzle-orm";
import type { MetadataType } from "../../types/MetadataType";
import type {
  GlobalProperties,
  NewGlobalProperties,
  UpdateGlobalProperties,
} from "./validator";

// compile query ahead of time
const globalPropertyPrepareGetById = db.query.global_properties
  .findFirst({
    where: eq(global_properties.id, sql.placeholder("id")),
  })
  .prepare("globalPropertyPrepareGetById");

async function getById(id: number): Promise<GlobalProperties> {
  const globalProperty = await globalPropertyPrepareGetById.execute({ id });
  if (!globalProperty)
    throw new Error(
      `[GlobalPropertyService]: Could not find global property with id ${id}`,
    );
  return globalProperty;
}

async function create(
  globalPropertyData: NewGlobalProperties,
  tx: DBType = db,
): Promise<GlobalProperties> {
  const newGlobalProperty = await tx
    .insert(global_properties)
    .values(globalPropertyData)
    .returning();
  if (newGlobalProperty[0] === undefined)
    throw new Error(
      `[GlobalPropertyService]: Could not create global property with name ${globalPropertyData?.name}`,
    );
  return newGlobalProperty[0];
}

async function deleteById(
  id: number,
  tx: DBType = db,
): Promise<GlobalProperties> {
  const deletedGlobalProperty = await tx
    .delete(global_properties)
    .where(eq(global_properties.id, id))
    .returning();
  if (!deletedGlobalProperty[0])
    throw new Error(
      `[GlobalPropertyService]: Could not delete global property with id ${id}`,
    );
  return deletedGlobalProperty[0];
}

async function update(
  globalPropertyData: UpdateGlobalProperties & MetadataType,
  tx: DBType = db,
): Promise<GlobalProperties> {
  const { id, ...dataToUpdate } = globalPropertyData;
  const updatedGlobalProperty = await tx
    .update(global_properties)
    .set(dataToUpdate)
    .where(eq(global_properties.id, id))
    .returning();
  if (updatedGlobalProperty[0] === undefined)
    throw new Error(
      `[GlobalPropertyService]: Could not update global property with id ${id}`,
    );
  return updatedGlobalProperty[0];
}

const globalPropertyService = { getById, create, deleteById, update };

export default globalPropertyService;
