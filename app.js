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
let activeAccount = null;
let deferredInstallPrompt = null;

function formatMoney(account, value) {
  return `${account.symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function persistDatabase() {
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(database));
}

function renderDashboard(account) {
  activeAccount = account;
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
  document.querySelector('#transactions').innerHTML = account.transactions.map((transaction) => {
    const amount = transaction.amount === 0 ? '-' : `${transaction.type === 'credit' ? '+' : '-'}${formatMoney(account, Math.abs(transaction.amount))}`;
    return `<div class="transaction"><div class="transaction-icon">${transaction.icon}</div><div class="transaction-main"><strong>${transaction.title}</strong><small>${transaction.date}</small></div><span class="transaction-amount ${transaction.type}">${amount}</span></div>`;
  }).join('');
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  event.currentTarget.textContent = showing ? 'Show' : 'Hide';
});

document.querySelector('#sign-out').addEventListener('click', () => {
  activeAccount = null;
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  loginForm.reset();
});

document.querySelector('#statement-button').addEventListener('click', () => {
  if (!activeAccount) return;
  if (activeAccount.balance < 6000) {
    showToast(`Sample statement printing unlocks at ${activeAccount.symbol}6,000.00. Current balance: ${formatMoney(activeAccount, activeAccount.balance)}.`);
    return;
  }
  window.print();
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
