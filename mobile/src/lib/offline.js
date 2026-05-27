/**
 * Offline downloads — encrypted with the in-memory content key and stored
 * under FileSystem.documentDirectory + "/offline".  Purged immediately
 * when premium_status is lost.
 */
import * as FileSystem from "expo-file-system";
import { api } from "./api";
import { encryptText, decryptText } from "./crypto";

const OFFLINE_DIR = FileSystem.documentDirectory + "offline/";

const ensureDir = async () => {
  const info = await FileSystem.getInfoAsync(OFFLINE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
};

const filePath = (chapterId) => `${OFFLINE_DIR}chapter_${chapterId}.enc`;

export const downloadChapter = async (chapterId) => {
  await ensureDir();
  const r = await api.get(`/chapters/${chapterId}`);
  if (r.data.locked) throw new Error("Chapter is locked");
  const blob = await encryptText(r.data.content);
  await FileSystem.writeAsStringAsync(filePath(chapterId), JSON.stringify(blob));
  return true;
};

export const readOfflineChapter = async (chapterId) => {
  const info = await FileSystem.getInfoAsync(filePath(chapterId));
  if (!info.exists) return null;
  const txt = await FileSystem.readAsStringAsync(filePath(chapterId));
  const blob = JSON.parse(txt);
  return await decryptText(blob);
};

export const isChapterDownloaded = async (chapterId) => {
  const info = await FileSystem.getInfoAsync(filePath(chapterId));
  return info.exists;
};

export const purgeAllOffline = async () => {
  const info = await FileSystem.getInfoAsync(OFFLINE_DIR);
  if (info.exists) await FileSystem.deleteAsync(OFFLINE_DIR, { idempotent: true });
};
