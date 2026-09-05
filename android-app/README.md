# Harborline Demo Banking - Android Java

This folder contains the native Android Java version of the Harborline fictional banking prototype.

## Open and build

Open `android-app/` in Android Studio, let Gradle sync, then run the `app` configuration on an emulator or Android device. An Android SDK with API 35 and a configured JDK are required to build an APK.

From a machine with the Android SDK configured:

```sh
cd android-app
./gradlew assembleDebug
```

The app uses SQLite through `SQLiteOpenHelper` and seeds two fictional demo profiles. It includes sign-in, sign-up, account selection, previous/next navigation, automatic account rotation, balances, profile information, transaction summaries, and masked payment details.

Demo credentials:

- Caskey Boney: `cappy1232025@outlook.com` / `Caskey!2489`
- Eva Amofa: `eva02amofa@gmail.com` / `Eva!4502026`

This is a sandbox prototype only. It is not affiliated with Ecobank and does not connect to real banking systems or funds.
