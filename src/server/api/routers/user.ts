import { users } from "@/db/schema/users";
import { updateUserZodSchema } from "@/schema/userZodSchema";
import {
  createTRPCRouter,
  employeeProcedure,
  managerProcedure,
} from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createProcedureSearch } from "../procedures";
import { TRPCError } from "@trpc/server";
import userService from "@/server/services/user";

export const userRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.string())
    .query(async ({ input: id }) => userService.getById(id)),
  create: managerProcedure
    .input(z.object({ name: z.string().optional(), email: z.string().email() }))
    .mutation(async ({ input: userData }) => userService.create(userData)),
  deleteById: managerProcedure
    .input(z.string())
    .mutation(async ({ input: id, ctx }) => {
      const user = await userService.getById(id);
      const currentUser = ctx.session.user;
      if (currentUser.role === "manager" && user?.role === "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot delete user with higher role",
        });
      return await userService.deleteById(id);
    }),
  update: managerProcedure
    .input(updateUserZodSchema)
    .mutation(async ({ input: userData, ctx }) => {
      const currentUser = ctx.session.user;
      const currentUserId = currentUser.id;
      const user = await userService.getById(userData.id);
      if (currentUser.role === "manager" && user?.role === "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot update data of user with higher role",
        });
      if (currentUser.role === "manager" && userData.role === "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot set role higher than your own!!!",
        });

      return await userService.update({
        ...userData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),
  search: createProcedureSearch(users),
});
