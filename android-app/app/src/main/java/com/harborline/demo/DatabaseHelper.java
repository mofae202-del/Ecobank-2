package com.harborline.demo;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DB_NAME = "harborline_demo.db";
    private static final int DB_VERSION = 1;

    public DatabaseHelper(Context context) { super(context, DB_NAME, null, DB_VERSION); }

    @Override public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, city TEXT, country TEXT, dob TEXT, currency TEXT, balance REAL, deposited REAL, withdrawn REAL, account_number TEXT)");
        addSeed(db, "Caskey Boney", "cappy1232025@outlook.com", "Caskey!2489", "Newport", "Wales", "August 4, 1992", "USD", 24.89, 915.43, 890.54, "HL-2048-8905");
        addSeed(db, "Eva Amofa", "eva02amofa@gmail.com", "Eva!4502026", "Accra", "South Africa", "February 4, 1989", "EUR", 450.00, 450.00, 0, "HL-4500-6000");
    }

    private void addSeed(SQLiteDatabase db, String name, String email, String password, String city, String country, String dob, String currency, double balance, double deposited, double withdrawn, String accountNumber) {
        ContentValues values = values(name, email, password, city, country, dob, currency, balance, deposited, withdrawn, accountNumber);
        db.insert("accounts", null, values);
    }

    private ContentValues values(String name, String email, String password, String city, String country, String dob, String currency, double balance, double deposited, double withdrawn, String accountNumber) {
        ContentValues values = new ContentValues();
        values.put("name", name); values.put("email", email); values.put("password", password); values.put("city", city); values.put("country", country); values.put("dob", dob); values.put("currency", currency); values.put("balance", balance); values.put("deposited", deposited); values.put("withdrawn", withdrawn); values.put("account_number", accountNumber);
        return values;
    }

    public Account login(String email, String password) {
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.query("accounts", null, "lower(email)=? AND password=?", new String[]{email.toLowerCase(), password}, null, null, "id");
        Account account = cursor.moveToFirst() ? read(cursor) : null;
        cursor.close();
        return account;
    }

    public long createAccount(String name, String email, String password, String city, String country) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = values(name, email.toLowerCase(), password, city, country, "Not provided", "USD", 0, 0, 0, "HL-DEMO-" + (System.currentTimeMillis() % 1000000));
        return db.insert("accounts", null, values);
    }

    public List<Account> getAccounts() {
        List<Account> accounts = new ArrayList<>();
        Cursor cursor = getReadableDatabase().query("accounts", null, null, null, null, null, "id");
        while (cursor.moveToNext()) accounts.add(read(cursor));
        cursor.close();
        return accounts;
    }

    private Account read(Cursor cursor) {
        return new Account(cursor.getLong(cursor.getColumnIndexOrThrow("id")), cursor.getString(cursor.getColumnIndexOrThrow("name")), cursor.getString(cursor.getColumnIndexOrThrow("email")), cursor.getString(cursor.getColumnIndexOrThrow("city")), cursor.getString(cursor.getColumnIndexOrThrow("country")), cursor.getString(cursor.getColumnIndexOrThrow("dob")), cursor.getString(cursor.getColumnIndexOrThrow("currency")), cursor.getDouble(cursor.getColumnIndexOrThrow("balance")), cursor.getDouble(cursor.getColumnIndexOrThrow("deposited")), cursor.getDouble(cursor.getColumnIndexOrThrow("withdrawn")), cursor.getString(cursor.getColumnIndexOrThrow("account_number")));
    }

    @Override public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) { }

    public static class Account {
        public final long id; public final String name, email, city, country, dob, currency, accountNumber; public final double balance, deposited, withdrawn;
        Account(long id, String name, String email, String city, String country, String dob, String currency, double balance, double deposited, double withdrawn, String accountNumber) { this.id = id; this.name = name; this.email = email; this.city = city; this.country = country; this.dob = dob; this.currency = currency; this.balance = balance; this.deposited = deposited; this.withdrawn = withdrawn; this.accountNumber = accountNumber; }
        @Override public String toString() { return name + " / " + currency; }
    }
}
