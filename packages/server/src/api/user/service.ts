import { db } from "@/db";
import { users } from "./schema";
import { eq, sql } from "drizzle-orm";
import type { UpdatedUser, User } from "./validator";
import type { MetadataType } from "@/types/MetadataType";
import { authDBAdapter } from "../../auth";
import type { AdapterUser } from "next-auth/adapters";

// compile query ahead of time
const userPrepareGetById = db.query.users
  .findFirst({
    where: eq(users.id, sql.placeholder("id")),
  })
  .prepare("userPrepareGetById");

async function getById(id: string) {
  const user = await userPrepareGetById.execute({ id });
  if (!user)
    throw new Error(`[UserService]: Could not find user with id ${id}`);
  return user;
}

async function create(userData: Partial<User>) {
  const newUser = await authDBAdapter.createUser?.({
    emailVerified: new Date(),
    ...userData,
  } as AdapterUser);
  if (!newUser)
    throw new Error(
      `[UserService]: Could not create user with email ${userData.email}`,
    );
  return newUser;
}

async function deleteById(id: string) {
  return await db.delete(users).where(eq(users.id, id));
}

async function update(userData: UpdatedUser & MetadataType) {
  const { id, ...dataToUpdate } = userData;
  const updatedUser = await db
    .update(users)
    .set(dataToUpdate)
    .where(eq(users.id, id))
    .returning();
  if (!updatedUser[0])
    throw new Error(`[UserService]: Could not update user with id ${id}`);
  return updatedUser[0];
}

const userService = { getById, create, deleteById, update };

export default userService;
