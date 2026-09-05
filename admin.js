const database = JSON.parse(localStorage.getItem('harborline-demo-db') || '{}');
const eventMessage = document.querySelector('#event-message');

function money(account, value) { return `${account.currency === 'EUR' ? 'EUR ' : '$'}${Number(value).toFixed(2)}`; }
function renderAccounts() {
  const accounts = Object.values(database);
  document.querySelector('#account-count').textContent = accounts.length;
  document.querySelector('#review-count').textContent = accounts.filter((account) => account.review).length;
  document.querySelector('#accounts-table').innerHTML = `<table class="admin-table"><thead><tr><th>Name</th><th>Account</th><th>Balance</th><th>Status</th></tr></thead><tbody>${accounts.map((account) => `<tr><td>${account.name}<br><small>${account.email}</small></td><td>${account.account}</td><td>${money(account, account.balance)}</td><td class="${account.review ? 'pending' : 'ok'}">${account.review ? 'Review processing' : 'Active'}</td></tr>`).join('')}</tbody></table>`;
}
async function renderEvents() {
  const secret = document.querySelector('#admin-secret').value;
  try {
    const response = await fetch('http://localhost:8787/webhooks/events', { headers: { 'x-webhook-secret': secret } });
    if (!response.ok) throw new Error('Unable to access event feed');
    const data = await response.json();
    document.querySelector('#event-count').textContent = data.events.length;
    eventMessage.textContent = data.events.length ? 'Most recent masked events are shown below.' : 'No events have been received yet.';
    document.querySelector('#events-table').innerHTML = `<table class="admin-table"><thead><tr><th>Received</th><th>Event</th><th>Status</th><th>Amount</th><th>Details</th></tr></thead><tbody>${data.events.map((event) => `<tr><td>${new Date(event.receivedAt).toLocaleString()}</td><td>${event.event}</td><td class="${event.status === 'Succeeded' ? 'ok' : 'pending'}">${event.status}</td><td>${event.amount || '-'}</td><td>${event.cardLast4 ? `Card ending ${event.cardLast4}` : event.recipient || event.accountId}</td></tr>`).join('')}</tbody></table>`;
  } catch (error) {
    eventMessage.textContent = `${error.message}. Start webhook-server.js and check the demo secret.`;
    document.querySelector('#event-count').textContent = '0';
  }
}
renderAccounts();
renderEvents();
document.querySelector('#refresh-events').addEventListener('click', renderEvents);
