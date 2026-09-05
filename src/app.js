import { supabase } from './supabaseClient.js';

let activeProfile = null;
let allProfiles = [];
let rotationTimer = null;
let deferredInstallPrompt = null;

const loginScreen = document.querySelector('#login-screen');
const dashboard = document.querySelector('#dashboard');
const loginForm = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const errorMessage = document.querySelector('#login-error');
const signupForm = document.querySelector('#signup-form');
const accountSelect = document.querySelector('#account-select');

function formatMoney(profile, value) {
  return `${profile.symbol}${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function reviewDateLabel(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadAllProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Failed to load profiles:', error.message);
    allProfiles = [];
    return;
  }
  allProfiles = data || [];
}

async function loadTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to load transactions:', error.message);
    return [];
  }
  return data || [];
}

async function loadReview(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('Failed to load review:', error.message);
    return null;
  }
  return data;
}

function renderAccountOptions() {
  accountSelect.innerHTML = allProfiles
    .map((p) => `<option value="${p.id}">${p.name} / ${p.currency}</option>`)
    .join('');
  if (activeProfile) accountSelect.value = activeProfile.id;
}

async function renderDashboard(profile) {
  activeProfile = profile;
  const transactions = await loadTransactions(profile.id);
  const review = await loadReview(profile.id);

  renderAccountOptions();
  document.querySelector('#first-name').textContent = profile.name.split(' ')[0];
  document.querySelector('#profile-name').textContent = profile.name;
  document.querySelector('#profile-location').textContent = `${profile.location} / ${profile.country}`;
  document.querySelector('#avatar').textContent = profile.initials;
  document.querySelector('#account-number').textContent = profile.account_number;
  document.querySelector('#profile-email').textContent = profile.email;
  document.querySelector('#profile-dob').textContent = profile.dob;
  document.querySelector('#balance').textContent = formatMoney(profile, profile.balance);
  document.querySelector('#balance-caption').textContent = profile.balance < 25 ? 'Low balance reminder' : 'Ready to spend';
  document.querySelector('#deposited').textContent = formatMoney(profile, profile.deposited);
  document.querySelector('#withdrawn').textContent = formatMoney(profile, profile.withdrawn);
  document.querySelector('#deposit-date').textContent = profile.deposit_date;
  document.querySelector('#card-holder').textContent = (profile.card_holder || profile.name).toUpperCase();
  renderReviewStatus(review);
  document.querySelector('#transactions').innerHTML = transactions
    .map((tx) => {
      const amount = tx.amount == 0 ? '-' : `${tx.type === 'credit' ? '+' : '-'}${formatMoney(profile, Math.abs(tx.amount))}`;
      return `<div class="transaction"><div class="transaction-icon">${tx.icon}</div><div class="transaction-main"><strong>${tx.title}</strong><small>${tx.date}</small></div><span class="transaction-amount ${tx.type}">${amount}</span></div>`;
    })
    .join('');
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  startRotation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderReviewStatus(review) {
  const status = document.querySelector('#review-status');
  const submit = document.querySelector('#review-submit');
  if (!review) {
    status.innerHTML = '<span class="status-dot"></span><span>No review request submitted</span>';
    submit.disabled = false;
    submit.innerHTML = 'Submit review request <span>-></span>';
    return;
  }
  status.innerHTML = `<span class="status-dot processing-dot"></span><span><strong>${review.review_type}: Processing</strong><small>Requested ${reviewDateLabel(review.requested_at)}. Review and approval decision expected after ${reviewDateLabel(review.expected_at)}.</small></span>`;
  submit.disabled = true;
  submit.innerHTML = 'Review request processing <span>...</span>';
}

function switchAccount(step) {
  if (!allProfiles.length) return;
  const currentIndex = Math.max(0, allProfiles.findIndex((p) => p.id === activeProfile?.id));
  const nextIndex = (currentIndex + step + allProfiles.length) % allProfiles.length;
  renderDashboard(allProfiles[nextIndex]);
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

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value.trim().toLowerCase(),
    password: passwordInput.value,
  });
  if (error) {
    errorMessage.textContent = 'Email or password does not match a demo profile.';
    return;
  }
  errorMessage.textContent = '';
  await loadAllProfiles();
  const myProfile = allProfiles.find((p) => p.id === data.user.id);
  if (myProfile) {
    renderDashboard(myProfile);
  } else {
    errorMessage.textContent = 'No banking profile found for this account.';
  }
});

document.querySelectorAll('.credential').forEach((button) =>
  button.addEventListener('click', () => {
    emailInput.value = button.dataset.email;
    passwordInput.value = button.dataset.password;
    errorMessage.textContent = '';
  })
);

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

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#signup-name').value.trim();
  const email = document.querySelector('#signup-email').value.trim().toLowerCase();
  const city = document.querySelector('#signup-city').value.trim();
  const country = document.querySelector('#signup-country').value;
  const password = document.querySelector('#signup-password').value;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    document.querySelector('#signup-message').textContent = signUpError.message;
    return;
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    document.querySelector('#signup-message').textContent = 'Account creation failed. Please try again.';
    return;
  }

  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const accountNumber = `HL-DEMO-${String(Date.now()).slice(-6)}`;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    name,
    email,
    initials,
    location: city,
    country,
    dob: 'Not provided',
    currency: 'USD',
    symbol: '$',
    account_number: accountNumber,
    balance: 0,
    deposited: 0,
    withdrawn: 0,
    deposit_date: 'No deposits yet',
    card_last4: '3046',
    iban_masked: 'IT21 **** **** **** 79253',
    bic: 'PPAYITR1XXX',
    card_holder: name.toUpperCase(),
  });

  if (profileError) {
    document.querySelector('#signup-message').textContent = `Profile creation failed: ${profileError.message}`;
    return;
  }

  const { error: txError } = await supabase.from('transactions').insert({
    user_id: userId,
    icon: 'i',
    title: 'Demo account created',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: 0,
    type: 'neutral',
  });

  if (txError) console.error('Transaction insert failed:', txError.message);

  signupForm.reset();
  document.querySelector('#signup-message').textContent = 'Account created. Opening your dashboard...';
  await loadAllProfiles();
  const newProfile = allProfiles.find((p) => p.id === userId);
  if (newProfile) renderDashboard(newProfile);
});

document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  event.currentTarget.textContent = showing ? 'Show' : 'Hide';
});

document.querySelector('#sign-out').addEventListener('click', async () => {
  stopRotation();
  await supabase.auth.signOut();
  activeProfile = null;
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  loginForm.reset();
});

accountSelect.addEventListener('change', (event) => {
  const profile = allProfiles.find((p) => p.id === event.target.value);
  if (profile) renderDashboard(profile);
});
document.querySelector('#previous-account').addEventListener('click', () => switchAccount(-1));
document.querySelector('#next-account').addEventListener('click', () => switchAccount(1));
document.querySelector('#autoplay-toggle').addEventListener('click', (event) => {
  if (rotationTimer) stopRotation();
  else startRotation();
  event.currentTarget.focus();
});

document.querySelector('#statement-button').addEventListener('click', () => {
  if (!activeProfile) return;
  const threshold = 6000;
  if (Number(activeProfile.balance) < threshold) {
    showToast(`Sample statement printing unlocks at ${activeProfile.symbol}6,000.00. Current balance: ${formatMoney(activeProfile, activeProfile.balance)}.`);
    return;
  }
  window.print();
});

document.querySelector('#review-submit').addEventListener('click', async () => {
  if (!activeProfile) return;
  const reviewType = document.querySelector('#review-type').value;
  const requestedAt = new Date();
  const expectedAt = new Date(requestedAt);
  expectedAt.setDate(expectedAt.getDate() + 3);

  const { data, error } = await supabase.from('reviews').insert({
    user_id: activeProfile.id,
    review_type: reviewType,
    requested_at: requestedAt.toISOString(),
    expected_at: expectedAt.toISOString(),
    status: 'Processing',
  }).select().single();

  if (error) {
    showToast('Review submission failed. Please try again.');
    return;
  }

  renderReviewStatus(data);
  showToast(`Review submitted. Processing status will update after ${reviewDateLabel(expectedAt)}.`);
});

function showMoneyStatus(message, success) {
  const status = document.querySelector('#money-status');
  status.textContent = message;
  status.className = `money-status ${success ? 'money-success' : 'money-failure'}`;
}

function cardNumberIsUsable(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 12 && digits.length <= 19;
}

document.querySelector('#deposit-tab').addEventListener('click', () => {
  document.querySelector('#deposit-tab').classList.add('active');
  document.querySelector('#send-tab').classList.remove('active');
  document.querySelector('#deposit-panel').classList.remove('hidden');
  document.querySelector('#send-panel').classList.add('hidden');
});

document.querySelector('#send-tab').addEventListener('click', () => {
  document.querySelector('#send-tab').classList.add('active');
  document.querySelector('#deposit-tab').classList.remove('active');
  document.querySelector('#send-panel').classList.remove('hidden');
  document.querySelector('#deposit-panel').classList.add('hidden');
});

document.querySelector('#deposit-submit').addEventListener('click', async () => {
  if (!activeProfile) return;
  const amount = Number(document.querySelector('#deposit-amount').value);
  const card = document.querySelector('#deposit-card').value;
  if (!Number.isFinite(amount) || amount <= 0 || !cardNumberIsUsable(card)) {
    showMoneyStatus('Deposit failed: enter a positive amount and a 12 to 19 digit demo card number.', false);
    return;
  }
  const digits = card.replace(/\D/g, '');
  const newBalance = Number(activeProfile.balance) + amount;
  const newDeposited = Number(activeProfile.deposited) + amount;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: newBalance, deposited: newDeposited })
    .eq('id', activeProfile.id);

  if (updateError) {
    showMoneyStatus('Deposit failed in simulation. Please try again.', false);
    return;
  }

  const { error: txError } = await supabase.from('transactions').insert({
    user_id: activeProfile.id,
    icon: '+',
    title: `Postepay demo deposit (•••• ${digits.slice(-4)})`,
    date: reviewDateLabel(new Date()),
    amount,
    type: 'credit',
  });

  if (txError) console.error('Transaction insert failed:', txError.message);

  activeProfile.balance = newBalance;
  activeProfile.deposited = newDeposited;
  await renderDashboard(activeProfile);
  showMoneyStatus(`Deposit successful in simulation: ${formatMoney(activeProfile, amount)} added from card ending ${digits.slice(-4)}.`, true);
  document.querySelector('#deposit-amount').value = '';
  document.querySelector('#deposit-card').value = '';
});

document.querySelector('#send-submit').addEventListener('click', async () => {
  if (!activeProfile) return;
  const amount = Number(document.querySelector('#send-amount').value);
  const recipient = document.querySelector('#send-recipient').value.trim();
  if (!Number.isFinite(amount) || amount <= 0 || !recipient) {
    showMoneyStatus('Transfer failed: enter a positive amount and recipient.', false);
    return;
  }
  if (amount > Number(activeProfile.balance)) {
    showMoneyStatus(`Transfer failed: available balance is ${formatMoney(activeProfile, activeProfile.balance)}.`, false);
    return;
  }
  const newBalance = Number(activeProfile.balance) - amount;
  const newWithdrawn = Number(activeProfile.withdrawn) + amount;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: newBalance, withdrawn: newWithdrawn })
    .eq('id', activeProfile.id);

  if (updateError) {
    showMoneyStatus('Transfer failed in simulation. Please try again.', false);
    return;
  }

  const { error: txError } = await supabase.from('transactions').insert({
    user_id: activeProfile.id,
    icon: '-',
    title: `Demo transfer to ${recipient}`,
    date: reviewDateLabel(new Date()),
    amount: -amount,
    type: 'debit',
  });

  if (txError) console.error('Transaction insert failed:', txError.message);

  activeProfile.balance = newBalance;
  activeProfile.withdrawn = newWithdrawn;
  await renderDashboard(activeProfile);
  showMoneyStatus(`Transfer successful in simulation: ${formatMoney(activeProfile, amount)} sent to ${recipient}.`, true);
  document.querySelector('#send-amount').value = '';
  document.querySelector('#send-recipient').value = '';
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

supabase.auth.onAuthStateChange((event, session) => {
  (async () => {
    if (event === 'SIGNED_IN' && session) {
      await loadAllProfiles();
      const myProfile = allProfiles.find((p) => p.id === session.user.id);
      if (myProfile && !activeProfile) {
        renderDashboard(myProfile);
      }
    } else if (event === 'SIGNED_OUT') {
      stopRotation();
      activeProfile = null;
      dashboard.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    }
  })();
});

(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await loadAllProfiles();
    const myProfile = allProfiles.find((p) => p.id === session.user.id);
    if (myProfile) {
      renderDashboard(myProfile);
    }
  }
})();
