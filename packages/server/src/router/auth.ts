import type { TRPCRouterRecord } from "@trpc/server";

import { employeeProcedure, publicProcedure } from "@/api/trpc";
import { magicLink, signOut } from "@/auth";
import { z } from "zod";

export const authRouter = {
  authWithMagicLink: publicProcedure
    .input(z.string().email().min(5).max(32))
    .mutation(async ({ input }) => {
      await magicLink.initiateSignIn(input);
    }),

  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: employeeProcedure.query(() => {
    return "you can see this secret message!";
  }),

  signOut: publicProcedure.mutation(async () => {
    return await signOut();
  }),
} satisfies TRPCRouterRecord;
