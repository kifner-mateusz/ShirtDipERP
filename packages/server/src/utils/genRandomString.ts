import Crypto from "crypto";

export function genRandomString(length = 40) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function genRandomStringServerOnly(length = 40) {
  return Crypto.randomBytes(length)
    .toString("base64")
    .replaceAll("/", "_")
    .replaceAll("+", "-")
    .replaceAll("=", ".")
    .slice(0, length);
}
