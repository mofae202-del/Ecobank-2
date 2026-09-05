# Harborline Demo Banking

Harborline is a fictional banking dashboard prototype inspired by the clarity of modern digital banking interfaces. It is not Ecobank, is not affiliated with Ecobank, and does not connect to payment networks or hold real funds.

## Run locally

Because the service worker requires HTTP, start a small local server from this folder:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. The app can be installed from the browser menu or through the **Install app** control after the page is served over HTTP.

## Demo sign-ins

| Profile | Email | Demo password |
| --- | --- | --- |
| Caskey Boney | `cappy1232025@outlook.com` | `Caskey!2489` |
| Eva Amofa | `eva02amofa@gmail.com` | `Eva!4502026` |

The browser's `localStorage` is used as a small demo database. It is intentionally not a production backend or secure credential store. The payment information shown in the dashboard is masked and labelled as demo data.

## Included

- Responsive login and account dashboard
- Two seeded account profiles with balances and transaction summaries
- Local demo persistence through `localStorage`
- Statement access button with the EUR 6,000 eligibility gate
- Installable PWA shell with offline cache
- Print-friendly browser statement flow when eligibility is met
- Explicit account review requests with processing and expected approval dates

## Native Java app

The Android Java version is in [android-app](android-app). Open that folder in Android Studio with an Android SDK installed to build and run the native app. It includes the same seeded profiles, SQLite account database, signup flow, account switching, and local review-status processing.
