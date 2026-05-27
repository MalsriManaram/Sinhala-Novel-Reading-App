/**
 * Content-key bootstrap.  Called once after every login + on app launch
 * for premium users.  If the user loses premium, we purge offline data.
 */
import { api } from "./api";
import { setContentKey, purgeContentKey } from "./crypto";
import { purgeAllOffline } from "./offline";

export const refreshContentKey = async () => {
  try {
    const r = await api.get("/security/content-key");
    setContentKey(r.data.key_base64);
    return true;
  } catch (err) {
    purgeContentKey();
    await purgeAllOffline();
    return false;
  }
};
