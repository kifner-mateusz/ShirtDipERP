import { users } from "./schema";
import { updateUserZodSchema } from "./validator";
import { createTRPCRouter, employeeProcedure, managerProcedure } from "../trpc";
import { z } from "zod";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { TRPCError } from "@trpc/server";
import userService from "./service";

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
      // @ts-ignore FIX
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
      // @ts-ignore FIX
      if (currentUser.role === "manager" && user?.role === "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot update data of user with higher role",
        });
      // @ts-ignore FIX
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
  oldSearch: createProcedureOldSearch(users),
  simpleSearch: createProcedureSimpleSearch(users),
});
