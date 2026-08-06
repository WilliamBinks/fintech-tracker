const { test, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app, pool } = require('./server.js');


const email = `test-${Date.now()}@example.com`;
const password = 'correct horse battery staple';


after(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [email]);
  await pool.end();
});


test('signup creates a user and returns a token', async () => {
  const res = await request(app)
    .post('/api/signup')
    .send({ email, password });

  assert.strictEqual(res.status, 201);
  assert.ok(res.body.token, 'expected a JWT in the response body');
});


test('login with correct password returns a token', async () => {
  
  const res = await request(app)
    .post('/api/login')
    .send({ email, password})

    assert.strictEqual(res.status, 200)
    assert.ok(res.body.token, 'expected a JWT in the response body')
});

test('login with wrong password is rejected', async () => {
  
  const res = await request(app)
    .post('/api/login')
    .send({ email, password: 'wrong'})

    assert.strictEqual(res.status, 401)
});
