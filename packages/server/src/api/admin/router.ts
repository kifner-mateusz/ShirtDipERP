import { env } from "../../env";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
// import { verificationTokens } from "../user/schema";
import { db } from "../../db";

export const adminRouter = createTRPCRouter({
  purgeAuthTokens: (env.NEXT_PUBLIC_DEMO
    ? publicProcedure
    : adminProcedure
  ).mutation(async () => {
    // await db.delete(verificationTokens);
    // return { ok: true };
    // TODO: Implement purgeAuthTokens
  }),
});
