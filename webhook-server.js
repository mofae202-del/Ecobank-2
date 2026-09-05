const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.WEBHOOK_PORT || 8787);
const SECRET = process.env.DEMO_WEBHOOK_SECRET || 'harborline-demo-secret';
const EVENTS_FILE = path.join(__dirname, 'webhook-events.jsonl');

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:8000', 'Access-Control-Allow-Headers': 'content-type,x-webhook-secret' });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10000) reject(new Error('Payload too large'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { ok: true, service: 'harborline-demo-webhook' });
    return;
  }
  if (request.method !== 'POST' || request.url !== '/webhooks/transactions') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }
  if (request.headers['x-webhook-secret'] !== SECRET) {
    sendJson(response, 401, { error: 'Invalid webhook secret' });
    return;
  }
  try {
    const payload = JSON.parse(await readBody(request));
    const event = { receivedAt: new Date().toISOString(), event: payload.event, accountId: payload.accountId, status: payload.status, amount: payload.amount, currency: payload.currency, cardLast4: payload.cardLast4, recipient: payload.recipient };
    if (!event.event || !event.accountId || !event.status) {
      sendJson(response, 400, { error: 'event, accountId, and status are required' });
      return;
    }
    fs.appendFileSync(EVENTS_FILE, `${JSON.stringify(event)}\n`, 'utf8');
    sendJson(response, 202, { accepted: true, receivedAt: event.receivedAt });
  } catch (error) {
    sendJson(response, 400, { error: error.message === 'Payload too large' ? error.message : 'Invalid JSON payload' });
  }
});

server.listen(PORT, () => console.log(`Harborline demo webhook listening on http://localhost:${PORT}`));
