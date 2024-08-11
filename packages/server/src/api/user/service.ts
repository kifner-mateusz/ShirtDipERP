import { db } from "../../db";
import { users } from "./schema";
import { eq, inArray, sql } from "drizzle-orm";
import type { UpdatedUser, User } from "./validator";
import type { MetadataType } from "../../types/MetadataType";
import type { Err } from "../../types/Err";

// TODO: make this compatible with lucia auth

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
  // const newUser = await authDBAdapter.createUser?.({
  //   emailVerified: new Date(),
  //   ...userData,
  // } as AdapterUser);
  // if (!newUser)
  //   throw new Error(
  //     `[UserService]: Could not create user with email ${userData.email}`,
  //   );
  // return newUser;
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

// compile query ahead of time
const userPrepareGetByEmail = db.query.users
  .findFirst({
    where: eq(users.email, sql.placeholder("email")),
  })
  .prepare("userPrepareGetByEmail");

async function getByEmail(email: string): Promise<User | Err> {
  const user = await userPrepareGetByEmail.execute({ email });
  if (!user)
    return {
      error: `[UserService]: Could not find user with email ${email}`,
    };
  return user;
}

// compile query ahead of time
const userPrepareGetManyById = db
  .select()
  .from(users)
  .where(inArray(users.id, sql.placeholder("ids")))
  .prepare("userPrepareGetManyById");

async function getManyByIds(ids: number[]): Promise<User[] | Err> {
  const users = await userPrepareGetManyById.execute({ ids });
  if (users.length !== ids.length)
    return {
      error: `[UserService]: Could not find users with ids ${ids}`,
    };
  return users;
}

const userService = {
  getById,
  create,
  deleteById,
  update,
  getByEmail,
  getManyByIds,
};

export default userService;
