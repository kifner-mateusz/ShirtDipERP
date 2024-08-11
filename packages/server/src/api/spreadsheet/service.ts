import { type DBType, db } from "../../db";
import { spreadsheets } from "./schema";
import { eq, inArray, sql } from "drizzle-orm";
import type { Spreadsheet, UpdatedSpreadsheet } from "./validator";
import type { MetadataType } from "../../types/MetadataType";

// compile query ahead of time
const spreadsheetPrepareGetById = db.query.spreadsheets
  .findFirst({
    where: eq(spreadsheets.id, sql.placeholder("id")),
  })
  .prepare("spreadsheetPrepareGetById");

async function getById(id: number): Promise<Spreadsheet> {
  const spreadsheet = await spreadsheetPrepareGetById.execute({ id });
  if (!spreadsheet)
    throw new Error(
      `[SpreadsheetService]: Could not find spreadsheet with id ${id}`,
    );
  return spreadsheet;
}

// compile query ahead of time
const spreadsheetPrepareGetManyByIds = db
  .select()
  .from(spreadsheets)
  .where(inArray(spreadsheets.id, sql.placeholder("ids")))
  .prepare("spreadsheetPrepareGetById");

async function getManyByIds(ids: number[]): Promise<Spreadsheet[]> {
  const spreadsheets = await spreadsheetPrepareGetManyByIds.execute({ ids });
  if (spreadsheets.length === ids.length)
    throw new Error(
      `[SpreadsheetService]: Could not find spreadsheets with ids ${ids}`,
    );
  return spreadsheets;
}

async function create(spreadsheetData: Partial<Spreadsheet>, tx: DBType = db) {
  const newSpreadsheet = await tx
    .insert(spreadsheets)
    .values(spreadsheetData)
    .returning();
  if (newSpreadsheet[0] === undefined)
    throw new Error(
      `[SpreadsheetService]: Could not create spreadsheet with name ${spreadsheetData?.name}`,
    );
  return newSpreadsheet[0];
}

async function createMany(
  spreadsheetData: Partial<Spreadsheet>[],
  tx: DBType = db,
) {
  const newSpreadsheet = await tx
    .insert(spreadsheets)
    .values(spreadsheetData)
    .returning();
  if (newSpreadsheet.length !== spreadsheetData.length)
    throw new Error(
      `[SpreadsheetService]: Could not create spreadsheets, created ${newSpreadsheet?.length} expected ${spreadsheetData?.length}`,
    );
  return newSpreadsheet;
}

async function deleteById(id: number, tx: DBType = db): Promise<Spreadsheet> {
  const deletedSpreadSheet = await tx
    .delete(spreadsheets)
    .where(eq(spreadsheets.id, id))
    .returning();
  if (!deletedSpreadSheet[0])
    throw new Error(
      `[SpreadsheetService]: Could not delete spreadsheet with id ${id}`,
    );
  return deletedSpreadSheet[0];
}

async function deleteManyByIds(
  ids: number[],
  tx: DBType = db,
): Promise<Spreadsheet[]> {
  const deletedSpreadSheet = await tx
    .delete(spreadsheets)
    .where(inArray(spreadsheets.id, ids))
    .returning();
  if (deletedSpreadSheet.length !== ids.length)
    throw new Error(
      `[SpreadsheetService]: Could not delete spreadsheets with ids ${ids}`,
    );
  return deletedSpreadSheet;
}

async function update(
  spreadsheetData: UpdatedSpreadsheet & MetadataType,
  tx: DBType = db,
): Promise<Spreadsheet> {
  const { id, ...dataToUpdate } = spreadsheetData;
  const updatedSpreadsheet = await tx
    .update(spreadsheets)
    .set(dataToUpdate)
    .where(eq(spreadsheets.id, id))
    .returning();
  if (updatedSpreadsheet[0] === undefined)
    throw new Error(
      `[SpreadsheetService]: Could not update spreadsheet with id ${id}`,
    );
  return updatedSpreadsheet[0];
}

const spreadsheetService = {
  getById,
  getManyByIds,
  create,
  createMany,
  deleteById,
  deleteManyByIds,
  update,
};

export default spreadsheetService;
