/*
# Harborline Demo Banking Schema

## Overview
Creates the complete database schema for the Harborline fictional banking demo app.
This is a multi-user app with Supabase email/password authentication.

## New Tables

### profiles
Stores each user's banking profile information.
- `id` (uuid, primary key, references auth.users) — one profile per auth user
- `name` (text) — full name
- `email` (text, unique) — email address
- `initials` (text) — 2-letter avatar initials
- `location` (text) — city
- `country` (text) — country
- `dob` (text) — date of birth
- `currency` (text) — account currency code (USD or EUR)
- `symbol` (text) — currency display symbol
- `account_number` (text) — demo bank account number
- `balance` (numeric) — current available balance
- `deposited` (numeric) — total deposited amount
- `withdrawn` (numeric) — total withdrawn amount
- `deposit_date` (text) — human-readable deposit date label
- `card_last4` (text) — last 4 digits of demo card
- `iban_masked` (text) — masked IBAN string
- `bic` (text) — BIC/SWIFT code
- `card_holder` (text) — name on card
- `created_at` (timestamptz)

### transactions
Records each account's transaction history.
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users) — owner
- `icon` (text) — display icon character (+, -, i)
- `title` (text) — transaction description
- `date` (text) — transaction date label
- `amount` (numeric) — signed amount (positive credit, negative debit)
- `type` (text) — credit, debit, or neutral
- `created_at` (timestamptz)

### reviews
Records account review requests.
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users) — owner
- `review_type` (text) — type of review requested
- `requested_at` (timestamptz) — when the request was submitted
- `expected_at` (timestamptz) — expected approval date
- `status` (text) — processing status
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- All tables scoped to `authenticated` users with ownership checks via `auth.uid()`.
- `user_id` columns default to `auth.uid()` so inserts from the client succeed.
- Four separate policies per table (SELECT, INSERT, UPDATE, DELETE).
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  initials text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  dob text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'USD',
  symbol text NOT NULL DEFAULT '$',
  account_number text NOT NULL DEFAULT '',
  balance numeric NOT NULL DEFAULT 0,
  deposited numeric NOT NULL DEFAULT 0,
  withdrawn numeric NOT NULL DEFAULT 0,
  deposit_date text NOT NULL DEFAULT '',
  card_last4 text NOT NULL DEFAULT '3046',
  iban_masked text NOT NULL DEFAULT 'IT21 **** **** **** 79253',
  bic text NOT NULL DEFAULT 'PPAYITR1XXX',
  card_holder text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  icon text NOT NULL DEFAULT 'i',
  title text NOT NULL,
  date text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'neutral',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  review_type text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  expected_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Processing',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reviews" ON reviews;
CREATE POLICY "select_own_reviews" ON reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
