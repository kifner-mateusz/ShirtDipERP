import { TRPCError } from "@trpc/server";
import {
  employeeProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/api/trpc";

import { users } from "../user/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export const sessionRouter = createTRPCRouter({
  status: publicProcedure.query(({ ctx }) => {
    if (ctx.session?.user) {
      return {
        user: ctx.session.user,
      };
    }
    return {
      user: null,
    };
  }),
  me: employeeProcedure.query(async ({ ctx }) => {
    const result = await db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      with: {
        emailCredentials: { with: { emailCredentials: true } },
        orders: { with: { orders: true } },
      },
    });
    if (!result)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "FORBIDDEN: user not found",
      });

    const { emailCredentials, orders, ...simpleUser } = result;

    return {
      ...simpleUser,
      emailCredentials: emailCredentials.map((v) => v.emailCredentials),
      orders: orders.map((v) => v.orders),
    };
  }),
});
