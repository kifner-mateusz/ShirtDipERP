import { z } from "zod";
import { sendSignInEmail } from "@shirterp/email-templates";
import { authService, userService } from "../services";
import { generateIdFromEntropySize } from "lucia";
import { lucia } from "./auth";

const emailZodSchema = z.string().email().min(5).max(32);
const tokenZodSchema = z.string().max(64);

async function initiateSignIn(email: string | null) {
  const result = emailZodSchema.safeParse(email);
  if (!result.success) {
    return {
      error: result.error.message,
    };
  }

  let user = await userService.getByEmail(result.data);
  if ("error" in user) {
    const id = generateIdFromEntropySize(10);
    // user = await userService.create({ id: id, email: result.data });
    user = { error: "" };
    if ("error" in user) {
      return user;
    }
  }
  await userService.update({ id: user.id, tokenId: null }); // TODO: make clearTokensForUser omit current token
  await authService.clearTokensForUser(user.id);
  const id = generateIdFromEntropySize(10);
  const tokenObj = await authService.createToken({ id, userId: user.id });
  if ("error" in tokenObj) {
    return tokenObj;
  }
  console.log(tokenObj);
  sendSignInEmail(result.data, tokenObj.token);
  await userService.update({ id: user.id, tokenId: tokenObj.id });
  return tokenObj.expiration_date;
}
async function validateSignIn(email: string | null, token: string | null) {
  const result = tokenZodSchema.safeParse(email);
  if (!result.success) {
    return {
      error: result.error.message,
    };
  }

  const result2 = tokenZodSchema.safeParse(token);
  if (!result2.success) {
    return {
      error: result2.error.message,
    };
  }

  const val_email = result.data;
  const val_token = result2.data;
  const user = await userService.getByEmail(val_email);
  if ("error" in user) {
    return user;
  }
  if (user.tokenId === null) {
    return { error: `[Auth]: No token found on user with email ${val_email}` };
  }
  const tokenObj = await authService.getById(user.tokenId);
  if ("error" in tokenObj) {
    return tokenObj;
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  return sessionCookie;
}

const magicLink = {
  initiateSignIn,
  validateSignIn,
};

export default magicLink;
