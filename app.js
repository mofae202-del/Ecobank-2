const DEMO_DB_KEY = 'harborline-demo-db';
const accounts = {
  caskey: {
    email: 'cappy1232025@outlook.com', password: 'Caskey!2489', name: 'Caskey Boney', initials: 'CB', location: 'Newport, Wales', country: 'Wales', dob: 'August 4, 1992', currency: 'USD', symbol: '$', account: 'HL-2048-8905', balance: 24.89, deposited: 915.43, withdrawn: 890.54, depositDate: 'Updated today', transactions: [
      { icon: '+', title: 'Opening deposit', date: 'Aug 08, 2026', amount: 915.43, type: 'credit' },
      { icon: '-', title: 'Previous withdrawal', date: 'Aug 27, 2026', amount: -890.54, type: 'debit' }
    ]
  },
  eva: {
    email: 'eva02amofa@gmail.com', password: 'Eva!4502026', name: 'Eva Amofa', initials: 'EA', location: 'Accra, Ghana', country: 'South Africa', dob: 'February 4, 1989', currency: 'EUR', symbol: 'EUR ', account: 'HL-4500-6000', balance: 450, deposited: 450, withdrawn: 0, depositDate: 'May 05, 2026 (3 months ago)', transactions: [
      { icon: '+', title: 'Account deposit', date: 'May 05, 2026', amount: 450, type: 'credit' },
      { icon: 'i', title: 'Statement access review', date: 'May 05, 2026', amount: 0, type: 'neutral' }
    ]
  }
};

const database = JSON.parse(localStorage.getItem(DEMO_DB_KEY) || 'null') || accounts;
const loginScreen = document.querySelector('#login-screen');
const dashboard = document.querySelector('#dashboard');
const loginForm = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const errorMessage = document.querySelector('#login-error');
const signupForm = document.querySelector('#signup-form');
const accountSelect = document.querySelector('#account-select');
let activeAccount = null;
let activeAccountKey = null;
let rotationTimer = null;
let deferredInstallPrompt = null;

function formatMoney(account, value) {
  return `${account.symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function persistDatabase() {
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(database));
}

function accountKeys() {
  return Object.keys(database);
}

function renderAccountOptions() {
  accountSelect.innerHTML = accountKeys().map((key) => `<option value="${key}">${database[key].name} / ${database[key].currency}</option>`).join('');
  if (activeAccountKey) accountSelect.value = activeAccountKey;
}

function renderDashboard(account, accountKey = activeAccountKey) {
  activeAccount = account;
  activeAccountKey = accountKey;
  renderAccountOptions();
  document.querySelector('#first-name').textContent = account.name.split(' ')[0];
  document.querySelector('#profile-name').textContent = account.name;
  document.querySelector('#profile-location').textContent = `${account.location} / ${account.country}`;
  document.querySelector('#avatar').textContent = account.initials;
  document.querySelector('#account-number').textContent = account.account;
  document.querySelector('#profile-email').textContent = account.email;
  document.querySelector('#profile-dob').textContent = account.dob;
  document.querySelector('#balance').textContent = formatMoney(account, account.balance);
  document.querySelector('#balance-caption').textContent = account.balance < 25 ? 'Low balance reminder' : 'Ready to spend';
  document.querySelector('#deposited').textContent = formatMoney(account, account.deposited);
  document.querySelector('#withdrawn').textContent = formatMoney(account, account.withdrawn);
  document.querySelector('#deposit-date').textContent = account.depositDate;
  document.querySelector('#card-holder').textContent = account.name.toUpperCase();
  renderReviewStatus(account);
  document.querySelector('#transactions').innerHTML = account.transactions.map((transaction) => {
    const amount = transaction.amount === 0 ? '-' : `${transaction.type === 'credit' ? '+' : '-'}${formatMoney(account, Math.abs(transaction.amount))}`;
    return `<div class="transaction"><div class="transaction-icon">${transaction.icon}</div><div class="transaction-main"><strong>${transaction.title}</strong><small>${transaction.date}</small></div><span class="transaction-amount ${transaction.type}">${amount}</span></div>`;
  }).join('');
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  startRotation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reviewDateLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderReviewStatus(account) {
  const status = document.querySelector('#review-status');
  const submit = document.querySelector('#review-submit');
  if (!account.review) {
    status.innerHTML = '<span class="status-dot"></span><span>No review request submitted</span>';
    submit.disabled = false;
    submit.innerHTML = 'Submit review request <span>-></span>';
    return;
  }
  const requested = new Date(account.review.requestedAt);
  const expected = new Date(account.review.expectedAt);
  status.innerHTML = `<span class="status-dot processing-dot"></span><span><strong>${account.review.type}: Processing</strong><small>Requested ${reviewDateLabel(requested)}. Review and approval decision expected after ${reviewDateLabel(expected)}.</small></span>`;
  submit.disabled = true;
  submit.innerHTML = 'Review request processing <span>...</span>';
}

function switchAccount(step) {
  const keys = accountKeys();
  if (!keys.length) return;
  const currentIndex = Math.max(0, keys.indexOf(activeAccountKey));
  const nextIndex = (currentIndex + step + keys.length) % keys.length;
  renderDashboard(database[keys[nextIndex]], keys[nextIndex]);
}

function startRotation() {
  window.clearInterval(rotationTimer);
  rotationTimer = window.setInterval(() => switchAccount(1), 10000);
  document.querySelector('#autoplay-toggle').textContent = 'Pause rotation';
  document.querySelector('#autoplay-toggle').setAttribute('aria-pressed', 'true');
}

function stopRotation() {
  window.clearInterval(rotationTimer);
  rotationTimer = null;
  document.querySelector('#autoplay-toggle').textContent = 'Play rotation';
  document.querySelector('#autoplay-toggle').setAttribute('aria-pressed', 'false');
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const account = Object.values(database).find((candidate) => candidate.email.toLowerCase() === emailInput.value.trim().toLowerCase() && candidate.password === passwordInput.value);
  if (!account) {
    errorMessage.textContent = 'Email or password does not match a demo profile.';
    return;
  }
  errorMessage.textContent = '';
  persistDatabase();
  renderDashboard(account);
});

document.querySelectorAll('.credential').forEach((button) => button.addEventListener('click', () => {
  emailInput.value = button.dataset.email;
  passwordInput.value = button.dataset.password;
  errorMessage.textContent = '';
}));

document.querySelector('#login-tab').addEventListener('click', () => {
  document.querySelector('#login-tab').classList.add('active');
  document.querySelector('#signup-tab').classList.remove('active');
  document.querySelector('#login-tab').setAttribute('aria-selected', 'true');
  document.querySelector('#signup-tab').setAttribute('aria-selected', 'false');
  document.querySelector('#login-panel').classList.remove('hidden');
  document.querySelector('#signup-panel').classList.add('hidden');
});

document.querySelector('#signup-tab').addEventListener('click', () => {
  document.querySelector('#signup-tab').classList.add('active');
  document.querySelector('#login-tab').classList.remove('active');
  document.querySelector('#signup-tab').setAttribute('aria-selected', 'true');
  document.querySelector('#login-tab').setAttribute('aria-selected', 'false');
  document.querySelector('#signup-panel').classList.remove('hidden');
  document.querySelector('#login-panel').classList.add('hidden');
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#signup-name').value.trim();
  const email = document.querySelector('#signup-email').value.trim().toLowerCase();
  const city = document.querySelector('#signup-city').value.trim();
  const country = document.querySelector('#signup-country').value;
  const password = document.querySelector('#signup-password').value;
  if (Object.values(database).some((account) => account.email.toLowerCase() === email)) {
    document.querySelector('#signup-message').textContent = 'That email is already used by a demo profile.';
    return;
  }
  const baseKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-profile';
  let accountKey = baseKey;
  let suffix = 2;
  while (database[accountKey]) accountKey = `${baseKey}-${suffix++}`;
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  database[accountKey] = { email, password, name, initials, location: city, country, dob: 'Not provided', currency: 'USD', symbol: '$', account: `HL-DEMO-${String(Date.now()).slice(-6)}`, balance: 0, deposited: 0, withdrawn: 0, depositDate: 'No deposits yet', transactions: [{ icon: 'i', title: 'Demo account created', date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), amount: 0, type: 'neutral' }] };
  persistDatabase();
  signupForm.reset();
  document.querySelector('#signup-message').textContent = 'Account created. Opening your dashboard...';
  renderDashboard(database[accountKey], accountKey);
});

document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  event.currentTarget.textContent = showing ? 'Show' : 'Hide';
});

document.querySelector('#sign-out').addEventListener('click', () => {
  activeAccount = null;
  activeAccountKey = null;
  stopRotation();
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  loginForm.reset();
});

accountSelect.addEventListener('change', (event) => renderDashboard(database[event.target.value], event.target.value));
document.querySelector('#previous-account').addEventListener('click', () => switchAccount(-1));
document.querySelector('#next-account').addEventListener('click', () => switchAccount(1));
document.querySelector('#autoplay-toggle').addEventListener('click', (event) => {
  if (rotationTimer) stopRotation();
  else startRotation();
  event.currentTarget.focus();
});

document.querySelector('#statement-button').addEventListener('click', () => {
  if (!activeAccount) return;
  if (activeAccount.balance < 6000) {
    showToast(`Sample statement printing unlocks at ${activeAccount.symbol}6,000.00. Current balance: ${formatMoney(activeAccount, activeAccount.balance)}.`);
    return;
  }
  window.print();
});

document.querySelector('#review-submit').addEventListener('click', () => {
  if (!activeAccount || activeAccount.review) return;
  const requestedAt = new Date();
  const expectedAt = new Date(requestedAt);
  expectedAt.setDate(expectedAt.getDate() + 3);
  activeAccount.review = { type: document.querySelector('#review-type').value, requestedAt: requestedAt.toISOString(), expectedAt: expectedAt.toISOString(), status: 'Processing' };
  persistDatabase();
  renderReviewStatus(activeAccount);
  showToast(`Review submitted. Processing status will update after ${reviewDateLabel(expectedAt)}.`);
});

document.querySelector('#install-app').addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  } else {
    showToast('Use your browser menu and choose Install app or Add to home screen.');
  }
});

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 4200);
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
