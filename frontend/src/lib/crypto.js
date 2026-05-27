/**
 * AES-256-GCM helpers — native build only.  Web build doesn't have native
 * crypto wired here and the Library/Reader download buttons short-circuit on web.
 */
import * as Crypto from "expo-crypto";

let contentKey = null;
export const setContentKey = (key) => { contentKey = key; };
export const getContentKey = () => contentKey;
export const purgeContentKey = () => { contentKey = null; };

const enc = new TextEncoder();
const dec = new TextDecoder();

const importKey = async (rawString) => {
  const raw = enc.encode(rawString).slice(0, 32);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

export const encryptText = async (plain) => {
  if (!contentKey) throw new Error("Content key not loaded");
  const iv = await Crypto.getRandomBytesAsync(12);
  const key = await importKey(contentKey);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  return { iv: Array.from(iv), cipher: Array.from(new Uint8Array(cipher)) };
};

export const decryptText = async ({ iv, cipher }) => {
  if (!contentKey) throw new Error("Content key not loaded");
  const key = await importKey(contentKey);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(cipher),
  );
  return dec.decode(plain);
};
