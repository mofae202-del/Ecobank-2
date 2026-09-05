import { supabase } from './supabaseClient.js';

const eventMessage = document.querySelector('#event-message');

function money(profile, value) {
  return `${profile.currency === 'EUR' ? 'EUR ' : '$'}${Number(value).toFixed(2)}`;
}

function setLoading(element, loading) {
  if (loading) {
    element.innerHTML = '<p class="admin-note">Loading...</p>';
  }
}

async function renderAccounts() {
  const tableDiv = document.querySelector('#accounts-table');
  setLoading(tableDiv, true);

  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    tableDiv.innerHTML = `<p class="admin-note">Unable to load accounts: ${error.message}</p>`;
    document.querySelector('#account-count').textContent = '0';
    document.querySelector('#review-count').textContent = '0';
    return;
  }

  const { data: reviews } = await supabase.from('reviews').select('user_id');

  document.querySelector('#account-count').textContent = profiles.length;
  document.querySelector('#review-count').textContent = reviews ? reviews.length : 0;
  tableDiv.innerHTML = `<table class="admin-table"><thead><tr><th>Name</th><th>Account</th><th>Balance</th><th>Status</th></tr></thead><tbody>${profiles.map((account) => `<tr><td>${account.name}<br><small>${account.email}</small></td><td>${account.account_number}</td><td>${money(account, account.balance)}</td><td class="ok">Active</td></tr>`).join('')}</tbody></table>`;
}

async function renderEvents() {
  const secret = document.querySelector('#admin-secret').value;
  const eventsTable = document.querySelector('#events-table');
  const refreshBtn = document.querySelector('#refresh-events');

  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Refreshing...';
  eventMessage.textContent = 'Loading masked events...';

  try {
    const response = await fetch('http://localhost:8787/webhooks/events', { headers: { 'x-webhook-secret': secret } });
    if (!response.ok) throw new Error('Unable to access event feed');
    const data = await response.json();
    document.querySelector('#event-count').textContent = data.events.length;
    eventMessage.textContent = data.events.length ? 'Most recent masked events are shown below.' : 'No events have been received yet.';
    eventsTable.innerHTML = `<table class="admin-table"><thead><tr><th>Received</th><th>Event</th><th>Status</th><th>Amount</th><th>Details</th></tr></thead><tbody>${data.events.map((event) => `<tr><td>${new Date(event.receivedAt).toLocaleString()}</td><td>${event.event}</td><td class="${event.status === 'Succeeded' ? 'ok' : 'pending'}">${event.status}</td><td>${event.amount || '-'}</td><td>${event.cardLast4 ? `Card ending ${event.cardLast4}` : event.recipient || event.accountId}</td></tr>`).join('')}</tbody></table>`;
  } catch (error) {
    eventMessage.textContent = `${error.message}. Start webhook-server.js and check the demo secret.`;
    document.querySelector('#event-count').textContent = '0';
    eventsTable.innerHTML = '';
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh events';
  }
}

renderAccounts();
renderEvents();
document.querySelector('#refresh-events').addEventListener('click', renderEvents);
