import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { MOCHA_SESSION_TOKEN_COOKIE_NAME } from '@getmocha/users-service/backend';
import app from '../.test-build/worker.mjs';

function setup(t) {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('migrations/1.sql', 'utf8'));
  db.exec(readFileSync('migrations/2.sql', 'utf8'));
  t.after(() => db.close());
  const DB = { prepare(query) { let values = []; return {
    bind(...args) { values = args; return this; },
    async first() { return db.prepare(query).get(...values) ?? null; },
    async all() { return { results: db.prepare(query).all(...values) }; },
    async run() { const result = db.prepare(query).run(...values); return { meta: { last_row_id: Number(result.lastInsertRowid), changes: result.changes } }; },
  }; } };
  const env = { DB, DEMO_MODE: 'true' };
  const request = (path, { method = 'GET', body, authenticated = true, headers = {} } = {}) => app.request(`http://localhost${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(authenticated ? { Cookie: `${MOCHA_SESSION_TOKEN_COOKIE_NAME}=dev-session-token` } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }, env);
  return { db, env, request };
}
const today = () => new Date().toISOString().slice(0, 10);

test('demo requires explicit flag, localhost and a sign-in cookie; production fails closed', async t => {
  const { request, env } = setup(t);
  assert.equal((await request('/api/habits', { authenticated: false })).status, 401);
  assert.equal((await app.request('https://habitflow.example/api/habits', {}, env)).status, 503);
  assert.equal((await app.request('http://localhost/api/habits', {}, { DB: env.DB })).status, 503);
  const response = await request('/api/sessions', { method: 'POST', authenticated: false, body: { code: 'local-demo' } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
});

test('habit mutations validate input and enforce ownership', async t => {
  const { request, db } = setup(t);
  assert.equal((await request('/api/habits', { method: 'POST', body: { name: '  ', category: 'good' } })).status, 400);
  assert.equal((await request('/api/habits', { method: 'POST', body: { name: 'Read', category: 'good', target_frequency: 3 } })).status, 400);
  const habit = await (await request('/api/habits', { method: 'POST', body: { name: ' Read ', category: 'good' } })).json();
  assert.equal(habit.name, 'Read');
  db.prepare('INSERT INTO habits(user_id,name,category) VALUES (?,?,?)').run('someone-else', 'Private', 'good');
  const other = db.prepare('SELECT id FROM habits WHERE user_id=?').get('someone-else').id;
  assert.equal((await request(`/api/habits/${other}`, { method: 'PUT', body: { name: 'Changed' } })).status, 404);
  assert.equal((await request(`/api/habits/${other}`, { method: 'DELETE' })).status, 404);
  assert.equal((await request('/api/habit-entries', { method: 'POST', body: { habit_id: other, date: today(), completed: true } })).status, 404);
});

test('daily upserts remain unique and archiving keeps metrics consistent', async t => {
  const { request, db } = setup(t);
  const habit = await (await request('/api/habits', { method: 'POST', body: { name: 'Walk', category: 'good' } })).json();
  const body = { habit_id: habit.id, date: today(), completed: true };
  const responses = await Promise.all(Array.from({ length: 4 }, () => request('/api/habit-entries', { method: 'POST', body })));
  assert.ok(responses.every(response => response.ok));
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM habit_entries').get().count, 1);
  let stats = await (await request('/api/dashboard/stats')).json();
  assert.equal(stats.completedToday, 1); assert.equal(stats.totalHabits, 1);
  assert.equal((await request(`/api/habits/${habit.id}`, { method: 'DELETE' })).status, 200);
  stats = await (await request('/api/dashboard/stats')).json();
  assert.equal(stats.completedToday, 0); assert.equal(stats.totalHabits, 0);
  assert.equal((await request('/api/habit-entries', { method: 'POST', body })).status, 404);
});

test('invalid calendar dates, future completions and cross-origin writes are rejected', async t => {
  const { request } = setup(t);
  assert.equal((await request('/api/habit-entries?date=2026-02-30')).status, 400);
  assert.equal((await request('/api/habit-entries', { method: 'POST', body: { habit_id: 1, date: '2999-01-01', completed: true } })).status, 400);
  assert.equal((await request('/api/habits', { method: 'POST', body: { name: 'Test', category: 'good' }, headers: { Origin: 'https://other.example' } })).status, 403);
});

test('journal and chat disclose fallback mode without requiring an AI key', async t => {
  const { request } = setup(t);
  const journal = await request('/api/journal', { method: 'POST', body: { date: today(), content: 'I feel happy and accomplished' } });
  assert.equal(journal.status, 201);
  const entry = await journal.json();
  assert.equal(entry.sentiment_score, 0.5); assert.equal(entry.analysis_source, 'basic');
  assert.equal((await (await request('/api/journal')).json())[0].analysis_source, 'basic');
  const chat = await (await request('/api/ai/coach/chat', { method: 'POST', body: { message: 'Help me start', context: { habits: [{ name: 'Untrusted client habit' }] } } })).json();
  assert.equal(chat.source, 'fallback');
  assert.equal((await request('/api/ai/coach/chat', { method: 'POST', body: { message: '' } })).status, 400);
});

test('monthly analytics returns one ordered row per elapsed UTC day', async t => {
  const { request } = setup(t);
  const rows = await (await request('/api/analytics/monthly')).json();
  assert.equal(rows.length, Number(today().slice(-2)));
  assert.equal(rows.at(-1).date, today());
  assert.ok(rows.every(row => row.completed === 0));
});

test('upgrade migration keeps newest duplicate and creates a unique key', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(readFileSync('migrations/1.sql', 'utf8'));
    db.exec("INSERT INTO habit_entries(user_id,habit_id,date,completed) VALUES ('u',1,'2026-01-01',0),('u',1,'2026-01-01',1)");
    db.exec(readFileSync('migrations/2.sql', 'utf8'));
    assert.equal(db.prepare('SELECT COUNT(*) AS n, MAX(completed) AS completed FROM habit_entries').get().n, 1);
    assert.equal(db.prepare('SELECT completed FROM habit_entries').get().completed, 1);
    assert.throws(() => db.exec("INSERT INTO habit_entries(user_id,habit_id,date) VALUES ('u',1,'2026-01-01')"), /UNIQUE/);
  } finally { db.close(); }
});

test('AI coach uses owned server context and ignores client-injected context', async t => {
  const { request, env } = setup(t);
  env.OPENAI_API_KEY = 'test-only-key';
  await request('/api/habits', { method: 'POST', body: { name: 'Owned reading habit', category: 'good' } });
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let sent;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return Response.json({ choices: [{ message: { content: 'Start with two pages after breakfast.' } }] });
  };
  const reply = await (await request('/api/ai/coach/chat', { method: 'POST', body: { message: 'Help me read', context: { habits: [{ name: 'Injected private information' }] } } })).json();
  assert.equal(reply.source, 'ai');
  assert.match(JSON.stringify(sent), /Owned reading habit/);
  assert.doesNotMatch(JSON.stringify(sent), /Injected private information/);
  assert.equal(sent.messages.at(-1).content, 'Help me read');
});

test('invalid model journal output falls back to validated basic feedback', async t => {
  const { request, env } = setup(t);
  env.OPENAI_API_KEY = 'test-only-key';
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify({ sentiment_score: 'nonsense', feedback: 'Invalid result' }) } }] });
  const response = await request('/api/journal', { method: 'POST', body: { date: today(), content: 'I feel happy' } });
  assert.equal(response.status, 201);
  const entry = await response.json();
  assert.equal(entry.analysis_source, 'basic');
  assert.equal(entry.sentiment_score, 0.5);
});
