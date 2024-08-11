/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { eq } from "drizzle-orm";

interface CreateContextOptions {
  session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */

import * as trpc from "@trpc/server";
import type * as trpcNext from "@trpc/server/adapters/next";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { getServerAuthSession } from "../auth";

// TODO: improve how context is handled in wss
export async function createTRPCContextForWSS(
  opts: CreateWSSContextFnOptions,
): Promise<{ session: Session | null }> {
  const session = await getSession({
    req: opts.req,
  });
  return {
    session,
  };
}

export async function createTRPCContext(
  opts: trpcNext.CreateNextContextOptions,
): Promise<{ session: Session | null }> {
  const session = await getServerAuthSession({ req: opts.req, res: opts.res });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
// export const createTRPCContext = (opts: CreateNextContextOptions) => {
//   return createInnerTRPCContext(opts);
// };

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/db";
import type { Session } from "@shirterp/auth";
import { users } from "@/api/user/schema";
import { getSession } from "@shirterp/auth/react";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

export const middleware = t.middleware;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const isAuthenticatedNormal = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "User not authenticated",
    });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const isAuthenticatedEmployee = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "User not authenticated",
    });
  }

  if (
    !(
      ctx.session.user.role === "employee" ||
      ctx.session.user.role === "manager" ||
      ctx.session.user.role === "admin"
    )
  ) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message:
        "User doesn't have permissions to access resource of Employee role",
    });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const isAuthenticatedManager = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "User not authenticated",
    });
  }

  if (
    !(ctx.session.user.role === "manager" || ctx.session.user.role === "admin")
  ) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message:
        "User doesn't have permissions to access resource of Manager role",
    });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const isAuthenticatedAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "User not authenticated",
    });
  }

  if (!(ctx.session.user.role === "admin")) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "User doesn't have permissions to access resource of Admin role",
    });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, ctx.session.user.id));
  if (user[0] === undefined || user[0].role !== "admin") {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message:
        "CRITICAL ERROR: User doesn't have permissions to access resource of Admin role but session.role is set to admin",
    });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const normalProcedure = t.procedure.use(isAuthenticatedNormal);
export const employeeProcedure = t.procedure.use(isAuthenticatedEmployee);
export const managerProcedure = t.procedure.use(isAuthenticatedManager);
export const adminProcedure = t.procedure.use(isAuthenticatedAdmin);
