import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import type { Session, User } from "lucia";
import { db } from "@shirterp/server";

import { env } from "../env";
import { sessions, users } from "@/service/schemas";
import type { UserType } from "@shirterp/service/validators";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export type UserSession =
  | { user: User; session: Session }
  | { user: null; session: null };

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<UserType, "id">;
  }
}
