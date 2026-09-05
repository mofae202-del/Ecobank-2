package com.harborline.demo;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    private final int TEAL = Color.rgb(8, 108, 97), DEEP = Color.rgb(7, 61, 57), INK = Color.rgb(21, 51, 49), MUTED = Color.rgb(113, 129, 125), MINT = Color.rgb(220, 239, 232);
    private DatabaseHelper database;
    private List<DatabaseHelper.Account> accounts;
    private int activeIndex;
    private Spinner accountSpinner;
    private LinearLayout dashboard;
    private TextView reviewStatus;
    private Button reviewButton;
    private SharedPreferences reviewStore;
    private Handler rotationHandler = new Handler();
    private boolean rotating = true;
    private final Runnable rotation = () -> { if (rotating && accounts != null && accounts.size() > 1) { activeIndex = (activeIndex + 1) % accounts.size(); accountSpinner.setSelection(activeIndex); showAccount(accounts.get(activeIndex)); } rotationHandler.postDelayed(rotation, 10000); };

    @Override public void onCreate(Bundle state) { super.onCreate(state); database = new DatabaseHelper(this); reviewStore = getSharedPreferences("review_status", MODE_PRIVATE); showLogin(); }
    @Override protected void onDestroy() { rotationHandler.removeCallbacks(rotation); database.close(); super.onDestroy(); }

    private LinearLayout page() { LinearLayout page = new LinearLayout(this); page.setOrientation(LinearLayout.VERTICAL); page.setPadding(28, 28, 28, 24); page.setBackgroundColor(Color.rgb(247, 250, 247)); return page; }
    private TextView text(String value, float size, int color) { TextView view = new TextView(this); view.setText(value); view.setTextSize(size); view.setTextColor(color); view.setPadding(0, 8, 0, 8); return view; }
    private EditText input(String hint, int type) { EditText input = new EditText(this); input.setHint(hint); input.setTextSize(16); input.setSingleLine(true); input.setInputType(type); input.setPadding(16, 12, 16, 12); input.setBackgroundColor(Color.WHITE); return input; }
    private Button button(String label, int color) { Button button = new Button(this); button.setText(label); button.setTextColor(color == DEEP ? Color.WHITE : TEAL); button.setTextSize(12); button.setAllCaps(false); button.setBackgroundColor(color); return button; }
    private void add(LinearLayout parent, View child, int height) { parent.addView(child, new LinearLayout.LayoutParams(-1, height)); }

    private void showLogin() {
        LinearLayout page = page(); ScrollView scroll = new ScrollView(this); scroll.addView(page); setContentView(scroll);
        TextView brand = text("HARBORLINE\nDEMO BANKING", 16, DEEP); brand.setTypeface(Typeface.DEFAULT, Typeface.BOLD); add(page, brand, 80);
        TextView title = text("Money, made clear.", 34, INK); title.setTypeface(Typeface.DEFAULT, Typeface.NORMAL); add(page, title, 90);
        add(page, text("A fictional sandbox for exploring account views, balances, and readable banking workflows.", 16, MUTED), 80);
        Button signInTab = button("SIGN IN", DEEP); Button signUpTab = button("CREATE ACCOUNT", Color.WHITE); LinearLayout tabs = new LinearLayout(this); tabs.addView(signInTab, new LinearLayout.LayoutParams(0, 55, 1)); tabs.addView(signUpTab, new LinearLayout.LayoutParams(0, 55, 1)); add(page, tabs, 65);
        LinearLayout forms = new LinearLayout(this); forms.setOrientation(LinearLayout.VERTICAL); add(page, forms, -2);
        showSignInForm(forms);
        signInTab.setOnClickListener(v -> { forms.removeAllViews(); showSignInForm(forms); }); signUpTab.setOnClickListener(v -> { forms.removeAllViews(); showSignUpForm(forms); });
    }

    private void showSignInForm(LinearLayout forms) {
        EditText email = input("Email address", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS); EditText password = input("Password", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD); add(forms, text("SIGN IN TO YOUR ACCOUNT", 11, TEAL), 45); add(forms, email, 62); add(forms, password, 62);
        Button submit = button("Sign in", DEEP); add(forms, submit, 62); add(forms, text("Demo profiles", 11, MUTED), 42);
        Button caskey = button("Caskey Boney  /  USD", Color.WHITE); Button eva = button("Eva Amofa  /  EUR", Color.WHITE); add(forms, caskey, 56); add(forms, eva, 56);
        caskey.setOnClickListener(v -> { email.setText("cappy1232025@outlook.com"); password.setText("Caskey!2489"); }); eva.setOnClickListener(v -> { email.setText("eva02amofa@gmail.com"); password.setText("Eva!4502026"); });
        submit.setOnClickListener(v -> { DatabaseHelper.Account account = database.login(email.getText().toString().trim(), password.getText().toString()); if (account == null) Toast.makeText(this, "Email or password does not match a demo profile.", Toast.LENGTH_SHORT).show(); else showDashboard(account); });
        add(forms, text("Sandbox only. No real funds or banking network access.", 12, MUTED), 60);
    }

    private void showSignUpForm(LinearLayout forms) {
        EditText name = input("Full name", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS); EditText email = input("Email address", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS); EditText city = input("City", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS); EditText country = input("Country", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS); EditText password = input("Create password", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD); add(forms, text("CREATE A DEMO ACCOUNT", 11, TEAL), 45); add(forms, name, 62); add(forms, email, 62); add(forms, city, 62); add(forms, country, 62); add(forms, password, 62); Button submit = button("Create account", DEEP); add(forms, submit, 62);
        submit.setOnClickListener(v -> { if (name.getText().length() == 0 || email.getText().length() == 0 || password.getText().length() < 8) { Toast.makeText(this, "Enter all fields and an 8-character password.", Toast.LENGTH_SHORT).show(); return; } long result = database.createAccount(name.getText().toString().trim(), email.getText().toString().trim(), password.getText().toString(), city.getText().toString().trim(), country.getText().toString().trim()); if (result == -1) Toast.makeText(this, "That email is already registered in this demo.", Toast.LENGTH_SHORT).show(); else showDashboard(database.login(email.getText().toString().trim(), password.getText().toString())); });
    }

    private void showDashboard(DatabaseHelper.Account account) {
        accounts = database.getAccounts(); activeIndex = 0; for (int i = 0; i < accounts.size(); i++) if (accounts.get(i).id == account.id) activeIndex = i;
        LinearLayout page = page(); ScrollView scroll = new ScrollView(this); scroll.addView(page); setContentView(scroll);
        LinearLayout header = new LinearLayout(this); header.setGravity(Gravity.CENTER_VERTICAL); TextView heading = text("PERSONAL OVERVIEW\nGood morning, " + account.name.split(" ")[0] + ".", 24, INK); header.addView(heading, new LinearLayout.LayoutParams(0, 90, 1)); Button logout = button("Sign out", Color.WHITE); header.addView(logout, new LinearLayout.LayoutParams(110, 55)); add(page, header, 100); logout.setOnClickListener(v -> { rotating = false; rotationHandler.removeCallbacks(rotation); showLogin(); });
        accountSpinner = new Spinner(this); ArrayAdapter<DatabaseHelper.Account> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, accounts); accountSpinner.setAdapter(adapter); accountSpinner.setSelection(activeIndex); add(page, accountSpinner, 58); accountSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() { public void onNothingSelected(android.widget.AdapterView<?> p) {} public void onItemSelected(android.widget.AdapterView<?> p, View v, int position, long id) { activeIndex = position; showAccount(accounts.get(position)); } });
        dashboard = page; add(page, text("Select an account or use the arrows to move between profiles. The view changes automatically every 10 seconds.", 13, MUTED), 62); LinearLayout controls = new LinearLayout(this); Button previous = button("< Previous", Color.WHITE); Button next = button("Next >", Color.WHITE); Button pause = button("Pause rotation", Color.WHITE); controls.addView(previous, new LinearLayout.LayoutParams(0, 55, 1)); controls.addView(next, new LinearLayout.LayoutParams(0, 55, 1)); controls.addView(pause, new LinearLayout.LayoutParams(0, 55, 1)); add(page, controls, 65); previous.setOnClickListener(v -> changeAccount(-1)); next.setOnClickListener(v -> changeAccount(1)); pause.setOnClickListener(v -> { rotating = !rotating; pause.setText(rotating ? "Pause rotation" : "Play rotation"); });
        add(page, text("AVAILABLE BALANCE", 11, TEAL), 36); add(page, text(format(account, account.balance), 40, DEEP), 70); add(page, text("ACCOUNT PROFILE", 11, TEAL), 36); showAccount(account); rotating = true; rotationHandler.removeCallbacks(rotation); rotationHandler.postDelayed(rotation, 10000);
    }

    private void showAccount(DatabaseHelper.Account account) { if (dashboard == null) return; TextView profile = (TextView) dashboard.findViewWithTag("profile"); if (profile == null) { profile = text("", 15, INK); profile.setTag("profile"); dashboard.addView(profile, new LinearLayout.LayoutParams(-1, -2)); } profile.setText("Name: " + account.name + "\nEmail: " + account.email + "\nLocation: " + account.city + ", " + account.country + "\nDate of birth: " + account.dob + "\nAccount number: " + account.accountNumber + "\nDeposited: " + format(account, account.deposited) + "\nPrevious withdrawals: " + format(account, account.withdrawn) + "\nStatus: Active demo profile\n\nRecent activity\n• Opening deposit / account deposit\n• Previous withdrawal summary\n\nLinked card: 5333 17•• •••• 3046\nIBAN: IT21 **** **** **** 79253\nBIC/SWIFT: PPAYITR1XXX"); }
    private void changeAccount(int step) { if (accounts == null || accounts.isEmpty()) return; activeIndex = (activeIndex + step + accounts.size()) % accounts.size(); accountSpinner.setSelection(activeIndex); showAccount(accounts.get(activeIndex)); }
    private String format(DatabaseHelper.Account account, double amount) { return (account.currency.equals("EUR") ? "EUR " : "$") + String.format(Locale.US, "%,.2f", amount); }
}
