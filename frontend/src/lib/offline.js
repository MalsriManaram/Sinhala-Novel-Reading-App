/**
 * Offline downloads — encrypted with the in-memory content key.
 * Native: expo-file-system + AES-256-GCM (Web Crypto polyfill)
 * Web: no-op fallbacks so the preview doesn't crash.
 */
import { Platform } from "react-native";

let FileSystem = null;
let encryptText = null;
let decryptText = null;
let documentDir = "";

if (Platform.OS !== "web") {
  FileSystem = require("expo-file-system");
  const c = require("./crypto");
  encryptText = c.encryptText;
  decryptText = c.decryptText;
  documentDir = FileSystem.documentDirectory + "offline/";
}

const ensureDir = async () => {
  if (Platform.OS === "web") return;
  const info = await FileSystem.getInfoAsync(documentDir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(documentDir, { intermediates: true });
};

const filePath = (chapterId) => `${documentDir}chapter_${chapterId}.enc`;

export const downloadChapter = async (chapterId) => {
  if (Platform.OS === "web") {
    console.log("[offline] downloadChapter is native-only; skipped on web");
    return false;
  }
  await ensureDir();
  const { api } = require("./api");
  const r = await api.get(`/chapters/${chapterId}`);
  if (r.data.locked) throw new Error("Chapter is locked");
  const blob = await encryptText(r.data.content);
  await FileSystem.writeAsStringAsync(filePath(chapterId), JSON.stringify(blob));
  return true;
};

export const readOfflineChapter = async (chapterId) => {
  if (Platform.OS === "web") return null;
  const info = await FileSystem.getInfoAsync(filePath(chapterId));
  if (!info.exists) return null;
  const txt = await FileSystem.readAsStringAsync(filePath(chapterId));
  return await decryptText(JSON.parse(txt));
};

export const isChapterDownloaded = async (chapterId) => {
  if (Platform.OS === "web") return false;
  const info = await FileSystem.getInfoAsync(filePath(chapterId));
  return info.exists;
};

export const purgeAllOffline = async () => {
  if (Platform.OS === "web") return;
  const info = await FileSystem.getInfoAsync(documentDir);
  if (info.exists) await FileSystem.deleteAsync(documentDir, { idempotent: true });
};
