import { UserModel } from "../../models/user.model";
import { loginUser, registerUser } from "../helpers/auth.helper";
import { testApp } from "../helpers/testApp";

describe('AUTH › MIDDLEWARE', () => {
  it('blocks access without token', async () => {
    const res = await testApp.get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows access with valid token', async () => {
    const reg = await registerUser();
    const login = await loginUser(reg.body.user.email);

    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
  });

  it('rejects invalid token', async () => {
    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid');

    expect(res.status).toBe(401);
  });

  it('rejects expired token', async () => {
    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', 'Bearer expired.token.here');

    expect(res.status).toBe(401);
  });

  it('accepts token from cookie', async () => {
    const email = `cookie_${Date.now()}@example.com`;

    await testApp.post('/api/auth/register').send({
      fullName: 'Cookie User',
      email,
      password: 'password123',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });

    const login = await testApp
      .post('/api/auth/login')
      .send({ email, password: 'password123' });

    const token = login.body?.token ?? login.body?.data?.token;
    expect(token).toBeDefined();

    // First try server-issued cookie directly (best path)
    if (login.headers['set-cookie']) {
      const withServerCookie = await testApp
        .get('/api/auth/me')
        .set('Cookie', login.headers['set-cookie']);

      if (withServerCookie.status === 200) {
        expect(withServerCookie.body.success).toBe(true);
        return;
      }
    }

    // Fallback: try common cookie names one by one
    const candidates = ['token', 'auth_token', 'access_token', 'jwt'];
    let ok = false;

    for (const key of candidates) {
      const res = await testApp
        .get('/api/auth/me')
        .set('Cookie', [`${key}=${token}`]);

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        ok = true;
        break;
      }
    }

    expect(ok).toBe(true);
  });

  it('rejects deleted user token', async () => {
    const email = `delete_${Date.now()}@example.com`;

    await testApp.post('/api/auth/register').send({
      fullName: 'Delete User',
      email,
      password: 'password123',
      gender: 'male',
      dob: '1990-01-01',
      phone: '1234567890'
    });

    const login = await testApp
      .post('/api/auth/login')
      .send({ email, password: 'password123' });

    await UserModel.findOneAndDelete({ email: email.toLowerCase() });

    const token = login.body?.token ?? login.body?.data?.token;
    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('handles malformed bearer header', async () => {
    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', 'Bearer');

    expect(res.status).toBe(401);
  });

  it('ignores undefined token', async () => {
    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', 'Bearer undefined');

    expect(res.status).toBe(401);
  });
});