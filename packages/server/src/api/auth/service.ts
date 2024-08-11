import { type DBType, db, eq, sql } from "@/db/index";
import type { Err } from "@/types/Err";
import type { OK } from "@/types/Ok";
import { authTokens } from "./schema";
import type { AuthToken, NewAuthToken } from "./validator";

const authTokenPrepareGetById = db.query.authTokens
  .findFirst({
    where: eq(authTokens.id, sql.placeholder("id")),
  })
  .prepare("authTokenPrepareGetById");

async function getById(id: string): Promise<AuthToken | Err> {
  const user = await authTokenPrepareGetById.execute({ id });
  if (!user)
    return {
      error: `[AuthService]: Could not find auth token with id ${id}`,
    };
  return user;
}

async function createToken(
  authTokenData: NewAuthToken,
  tx: DBType = db,
): Promise<AuthToken | Err> {
  const newAuthToken = await tx
    .insert(authTokens)
    .values(authTokenData)
    .returning();
  if (!newAuthToken[0])
    return { error: "[AuthService]: Could not create authToken" };
  return newAuthToken[0];
}

async function createWSToken(
  authTokenData: NewAuthToken,
  tx: DBType = db,
): Promise<AuthToken | Err> {
  const newAuthToken = await tx
    .insert(authTokens)
    .values(authTokenData)
    .returning();
  if (!newAuthToken[0])
    return { error: "[AuthService]: Could not create authToken" };
  return newAuthToken[0];
}

async function clearTokensForUser(
  userId: string,
  tx: DBType = db,
): Promise<OK | Err> {
  const deletedTokens = await tx
    .delete(authTokens)
    .where(eq(authTokens.userId, userId))
    .returning();
  if (!deletedTokens[0])
    return {
      error: `[AuthService]: Could not delete tokens for user with id ${userId}`,
    };
  return { success: true };
}

const authService = { getById, createToken, createWSToken, clearTokensForUser };

export default authService;
