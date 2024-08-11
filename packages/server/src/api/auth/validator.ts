import type { authTokens } from "./schema";

export type NewAuthToken = typeof authTokens.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
