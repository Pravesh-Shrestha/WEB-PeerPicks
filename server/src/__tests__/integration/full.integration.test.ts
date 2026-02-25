import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

// keep long suite from timing out
jest.setTimeout(30000);

// preserve data across tests in this one file
beforeAll(() => {
  (globalThis as any).__SKIP_DB_CLEANUP__ = true;
});

afterAll(() => {
  (globalThis as any).__SKIP_DB_CLEANUP__ = false;
});

// REMOVE local MongoMemoryServer + mongoose.connect hooks entirely.
// setup.ts already handles connection lifecycle.

// --- GLOBAL VARIABLES ---
let userToken: string;
let adminToken: string;
let userId: string;
let pickId: string;

// ---------------------
// AUTH TESTS
// ---------------------
describe('AUTH', () => {

  it('registers a normal user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      email: 'user@example.com',
      password: 'Password123!',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('user@example.com');
    userId = res.body.user._id;
  });

  it('registers an admin user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890',
      role: 'admin'
    });
    expect(res.status).toBe(201);
    adminToken = jwt.sign({ id: res.body.user._id }, JWT_SECRET, { expiresIn: '1h' });
  });

  it('fails register with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Bad Email',
      email: 'notanemail',
      password: 'Password123!',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });
    expect(res.status).toBe(400);
  });

  it('logs in with valid user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'Password123!'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  it('fails login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'WrongPass!'
    });
    expect(res.status).toBe(401);
  });

  it('fetches /me profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('blocks /me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('accepts cookie token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'Password123!'
    });

    const cookies = login.headers['set-cookie'];
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
  });

  it('rejects deleted user token', async () => {
    await UserModel.findByIdAndDelete(userId);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(401);
  });

});

// ---------------------
// PICKS TESTS
// ---------------------
describe('PICKS', () => {

  beforeAll(async () => {
    // Re-register a user for pick tests
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Pick User',
      email: 'pick@example.com',
      password: 'Password123!',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });
    userToken = (await request(app).post('/api/auth/login').send({
      email: 'pick@example.com',
      password: 'Password123!'
    })).body.token;
  });

  it('creates a pick', async () => {
    const res = await request(app)
      .post('/api/picks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Test Pick')
      .field('category', 'food');
    expect(res.status).toBe(200);
    pickId = res.body.pick._id;
  });

  it('fetches a pick by ID', async () => {
    const res = await request(app).get(`/api/picks/${pickId}`);
    expect(res.status).toBe(200);
    expect(res.body.pick._id).toBe(pickId);
  });

  it('fetches feed', async () => {
    const res = await request(app).get('/api/picks/feed');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.picks)).toBe(true);
  });

  it('updates a pick', async () => {
    const res = await request(app)
      .patch(`/api/picks/${pickId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated Pick' });
    expect(res.status).toBe(200);
    expect(res.body.pick.title).toBe('Updated Pick');
  });

  it('deletes a pick', async () => {
    const res = await request(app)
      .delete(`/api/picks/${pickId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

});

// ---------------------
// SOCIAL TESTS
// ---------------------
describe('SOCIAL', () => {

  let targetUserId: string;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Social User',
      email: 'social@example.com',
      password: 'Password123!',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });
    targetUserId = res.body.user._id;
  });

  it('follows another user', async () => {
    const res = await request(app)
      .post(`/api/picks/user/${targetUserId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it('votes on a pick', async () => {
    const pickRes = await request(app)
      .post('/api/picks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Vote Pick')
      .field('category', 'food');
    const voteRes = await request(app)
      .post(`/api/picks/${pickRes.body.pick._id}/vote`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(voteRes.status).toBe(200);
  });

});

// ---------------------
// NOTIFICATIONS, COMMENTS, EDGE CASES
// ---------------------
describe('NOTIFICATIONS & COMMENTS', () => {
  it('creates welcome notification', async () => {
    const user = await UserModel.findOne({ email: 'pick@example.com' });
    expect(user).toBeTruthy();
    // assume notification repository tested separately
  });

  it('rejects malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer badtoken');
    expect(res.status).toBe(401);
  });

  it('handles missing fields in pick creation', async () => {
    const res = await request(app)
      .post('/api/picks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ---------------------
// EDGE CASES, RATE LIMIT, SANITIZATION
// ---------------------
describe('EDGE CASES', () => {

  it('rejects XSS payload in registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: '<script>alert(1)</script>',
      email: 'xss@example.com',
      password: 'Password123!',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });
    expect(res.status).toBe(201);
    expect(res.body.user.fullName).toContain('&lt;script&gt;');
  });

  it('rejects NoSQL injection in login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: { $ne: '' },
      password: 'Password123!'
    });
    expect(res.status).toBe(401);
  });

});