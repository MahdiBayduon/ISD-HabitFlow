import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

// Run after copying .dev.vars.example and applying local migrations.
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], { env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', chunk => { logs += chunk; });
server.stderr.on('data', chunk => { logs += chunk; });
const base = 'http://127.0.0.1:5174';
async function request(path, options = {}) { return fetch(base + path, { ...options, signal: AbortSignal.timeout(5000) }); }
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await request('/api/health')).ok) { ready = true; break; } } catch { /* Wait for local worker startup. */ }
    await setTimeout(250);
  }
  assert.ok(ready, `Local server did not start: ${logs}`);
  assert.equal((await (await request('/api/health')).json()).demo, true);
  assert.equal((await request('/api/habits')).status, 401);
  const login = await request('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'local-demo' }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const headers = { Cookie: cookie, 'Content-Type': 'application/json' };
  const created = await request('/api/habits', { method: 'POST', headers, body: JSON.stringify({ name: 'Smoke test habit', category: 'good' }) });
  assert.equal(created.status, 201);
  const habit = await created.json();
  try {
    const completion = await request('/api/habit-entries', { method: 'POST', headers, body: JSON.stringify({ habit_id: habit.id, date: new Date().toISOString().slice(0,10), completed: true }) });
    assert.equal(completion.status, 200);
    assert.ok((await (await request('/api/dashboard/stats', { headers })).json()).completedToday >= 1);
    assert.equal((await request('/api/analytics/monthly', { headers })).status, 200);
    assert.equal((await request('/dashboard')).status, 200);
  } finally { await request(`/api/habits/${habit.id}`, { method: 'DELETE', headers }); }
  console.log('Local Worker + D1 smoke passed: sessions, ownership gate, habit creation, check-in, stats, analytics and SPA route.');
} catch (error) { console.error(logs); throw error; }
finally { server.kill('SIGTERM'); }
