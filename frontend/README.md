# Sinhala Novels — Expo Mobile App

This is the production-ready Expo (React Native) source code for the
Sinhala Novel Reading App.  It pairs with the FastAPI + MySQL backend
in `/app/backend` and the admin web dashboard in `/app/frontend`.

## Stack
- **Expo SDK 51** with **expo-router** file-based navigation
- **JavaScript (no TypeScript)** — `.js` files throughout per the design spec
- **expo-av** for Sinhala TTS playback (audio from backend `/api/tts/...`)
- **expo-secure-store** for JWT tokens (HTTP-only refresh cookie also issued)
- **expo-screen-capture** to block screenshots & screen recordings (anti-piracy)
- **expo-file-system** + AES-256-GCM (key fetched in-memory from the API)
- **zustand** for auth + theme + language state

## Bottom navigation (no "Settings" icon)
Per the design spec, the bottom tab bar contains: `Home`, `Waitlist`, `Library`,
`Profile`.  All settings (theme, language, account, subscription cancel) live
inside the Profile screen, not the bottom navigation.

## Mocked integrations
All third-party integrations live in `src/lib/integrations.js` as
intentional stubs (Google Auth, Apple Auth, AdMob Rewarded Video,
RevenueCat, OneSignal, Dialog Ideamart OTP).  Swap each function for
its real SDK call before shipping.

| Mock | Real replacement |
|---|---|
| `GoogleAuth.signIn` | `expo-auth-session/providers/google` |
| `AppleAuth.signIn` | `expo-apple-authentication` |
| `RewardedAd.show` | `react-native-google-mobile-ads` |
| `RevenueCat.purchasePackage` | `react-native-purchases` |
| `OneSignal.send` | `react-native-onesignal` |
| Dialog Ideamart OTP | Already routed through backend `/auth/otp/*` |

## How to run
```bash
cd /app/mobile
yarn
npx expo start
```
Scan the QR code with the Expo Go app (iOS / Android) on a device on the
same network, or press `i`/`a` to open in an emulator.

The backend URL is hardcoded in `.env` as `EXPO_PUBLIC_BACKEND_URL`.

## Build for stores
```bash
npm i -g eas-cli
eas build --platform ios
eas build --platform android
```
You'll need to swap in real API keys for AdMob, RevenueCat, OneSignal and
configure Sign-in-with-Apple / Google before shipping.

## Notable design tokens
- Fonts: Outfit (UI) + Lora (English body) + Abhaya Libre (Sinhala body) +
  Noto Sans Sinhala (Sinhala UI)
- Gold accent `#C7923E` (dark) / `#B27A2B` (light)
- Glassmorphic floating TTS player and bottom navigation
