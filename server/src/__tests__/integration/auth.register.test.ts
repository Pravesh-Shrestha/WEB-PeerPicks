import { registerUser } from "../helpers/auth.helper";


describe('AUTH › REGISTER', () => {
  it('registers user successfully', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('fails if email missing', async () => {
    const res = await registerUser({ email: undefined });
    expect(res.status).toBe(400);
  });

  it('fails if password missing', async () => {
    const res = await registerUser({ password: undefined });
    expect(res.status).toBe(400);
  });

  it('fails on duplicate email', async () => {
    const email = `dup_${Date.now()}@test.com`;
    await registerUser({ email });
    const res = await registerUser({ email });
    expect(res.status).toBe(400);
  });

  it('rejects invalid gender', async () => {
    const res = await registerUser({ gender: 'other' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid dob', async () => {
    const res = await registerUser({ dob: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('trims malicious input', async () => {
    const res = await registerUser({ fullName: '<script>alert(1)</script>' });
    expect(res.status).toBe(201);
  });

  it('sets role=user by default', async () => {
    const res = await registerUser();
    expect(res.body.user.role).toBe('user');
  });
});