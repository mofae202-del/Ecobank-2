# Harborline Demo Banking

Harborline is a fictional banking dashboard prototype inspired by the clarity of modern digital banking interfaces. It is not Ecobank, is not affiliated with Ecobank, and does not connect to payment networks or hold real funds.

## Run locally

```sh
npm install
npm run dev
```

Open the URL shown in your terminal (default `http://localhost:5173`).

To create a production build:

```sh
npm run build
npm run preview
```

The demo operations console is available at `/admin.html`. It shows demo accounts stored in Supabase and the authenticated masked webhook event feed.

The optional webhook receiver:

```sh
npm run start:webhook
```

To run both services with Docker:

```sh
docker compose up
```

This exposes the web app on port `8000` and the webhook receiver on port `8787`.

## Demo sign-ins

| Profile | Email | Demo password |
| --- | --- | --- |
| Caskey Boney | `cappy1232025@outlook.com` | `Caskey!2489` |
| Eva Amofa | `eva02amofa@gmail.com` | `Eva!4502026` |

Accounts and transactions are stored in a Supabase database with row-level security. Each authenticated user can only access their own profile data. The payment information shown in the dashboard is masked and labelled as demo data.

## Included

- Responsive login and account dashboard
- Two seeded account profiles with balances and transaction summaries
- Supabase email/password authentication with sign-up and sign-in
- Persistent data through Supabase (profiles, transactions, reviews)
- Statement access button with the EUR 6,000 eligibility gate
- Installable PWA shell with offline cache
- Print-friendly browser statement flow when eligibility is met
- Explicit account review requests with processing and expected approval dates
- Admin operations console reading from Supabase

## Local demo webhook

Run the optional receiver in a second terminal:

```sh
node webhook-server.js
```

It listens on `http://localhost:8787` and accepts masked demo events at `/webhooks/transactions`. The dashboard sends `account.review.requested`, `deposit.completed`, and `transfer.completed` events after local actions. Received events are written to `webhook-events.jsonl`, which is ignored from source control. This receiver is for local testing only and does not contact Postepay, Ecobank, or any payment network.

## Native Java app

The Android Java version is in [android-app](android-app). Open that folder in Android Studio with an Android SDK installed to build and run the native app. It includes the same seeded profiles, SQLite account database, signup flow, account switching, and local review-status processing.
