import { type DBType, db } from "@/db";
import { expenses } from "@/api/expense/schema";
import { eq, sql } from "drizzle-orm";
import type { MetadataType } from "@/types/MetadataType";
import type { Expense, UpdatedExpense } from "@/api/expense/validator";

// compile query ahead of time
const expensePrepareGetById = db.query.expenses
  .findFirst({
    where: eq(expenses.id, sql.placeholder("id")),
  })
  .prepare("expensePrepareGetById");

async function getById(id: number): Promise<Expense> {
  const expense = await expensePrepareGetById.execute({ id });
  if (!expense)
    throw new Error(`[ExpenseService]: Could not find expense with id ${id}`);
  return expense;
}

async function create(
  expenseData: Partial<Expense>,
  tx: DBType = db,
): Promise<Expense> {
  const newExpense = await tx.insert(expenses).values(expenseData).returning();
  if (!newExpense[0])
    throw new Error(
      `[ExpenseService]: Could not create expense with name ${expenseData?.name}`,
    );
  return newExpense[0];
}

async function deleteById(id: number, tx: DBType = db): Promise<Expense> {
  const deletedExpense = await tx
    .delete(expenses)
    .where(eq(expenses.id, id))
    .returning();
  if (!deletedExpense[0])
    throw new Error(`[ExpenseService]: Could not delete expense with id ${id}`);
  return deletedExpense[0];
}

async function update(
  expenseData: UpdatedExpense & MetadataType,
  tx: DBType = db,
): Promise<Expense> {
  const { id, ...dataToUpdate } = expenseData;
  const updatedExpense = await tx
    .update(expenses)
    .set(dataToUpdate)
    .where(eq(expenses.id, id))
    .returning();
  if (!updatedExpense[0])
    throw new Error(`[ExpenseService]: Could not update expense with id ${id}`);
  return updatedExpense[0];
}

const expenseService = { getById, create, deleteById, update };

export default expenseService;
