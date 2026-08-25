# FitiFy Android App

This folder contains the FitiFy mobile app built with Expo and React Native.

## Requirements

- Node.js 24.x
- npm
- Android Studio
- Android SDK and an Android emulator, or a physical Android device with USB debugging enabled
- Expo CLI through the local project command (`npx expo`)

## Install packages

From the repository root:

```powershell
cd App
npm install
```

## Configure the backend URL

Create `App/.env` with the public backend URL:

```env
EXPO_PUBLIC_API_BASE_URL=https://workout-ced4.onrender.com/api
```

Do not put `GEMINI_API_KEY`, `MONGODB_URI`, or `SESSION_SECRET` in this file. Those variables belong only on the backend server.

## Run with Expo

Start the development server:

```powershell
cd App
npx expo start
```

Then press `a` in the Expo terminal to open the Android emulator.

You can also start Android directly:

```powershell
npm run android
```

For Expo Go, install Expo Go on an Android device, connect the device and computer to the same network, then scan the QR code shown by `npx expo start`.

## Run the native Android build

Start an Android emulator first, then run:

```powershell
cd App
npm run android
```

This builds and installs the native Android app. The first build may take several minutes.

## Useful commands

```powershell
npx expo start -c
npm run lint
npx tsc --noEmit
```

Use `npx expo start -c` to clear the Metro cache after changing environment variables or dependencies. Restart Expo after changing `App/.env`.

## Android emulator setup

1. Open Android Studio.
2. Open **Device Manager** and create or start an Android Virtual Device.
3. Ensure the Android SDK, SDK Platform, SDK Build-Tools, and Android Emulator are installed.
4. Keep the emulator running.
5. From `App`, run `npm run android`.

To verify that Android Debug Bridge can see the emulator:

```powershell
adb devices
```

The emulator should appear with status `device`.

## Troubleshooting

- **Network error during sign-in:** verify `EXPO_PUBLIC_API_BASE_URL` and confirm the backend is deployed and reachable.
- **Changes are not appearing:** restart with `npx expo start -c`.
- **No Android device found:** start an emulator and check `adb devices`.
- **Gradle or SDK errors:** verify Android Studio has the required SDK and build tools installed.
- **Authentication after a backend change:** rebuild or restart the app so the latest API and token handling code is loaded.