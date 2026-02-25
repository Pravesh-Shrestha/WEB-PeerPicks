import { loginUser, registerUser } from "../helpers/auth.helper";

describe('AUTH › LOGIN', () => {
  it('logs in with valid credentials', async () => {
    const reg = await registerUser();
    const res = await loginUser(reg.body.user.email);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('fails with wrong password', async () => {
    const reg = await registerUser();
    const res = await loginUser(reg.body.user.email, 'wrong');
    expect(res.status).toBe(401);
  });

  it('fails with non-existent email', async () => {
    const res = await loginUser('ghost@test.com');
    expect(res.status).toBe(401);
  });

  it('fails if email missing', async () => {
    const res = await loginUser(undefined as any);
    expect(res.status).toBe(401);
  });

  it('fails if password missing', async () => {
    const res = await loginUser('test@test.com', undefined as any);
    expect(res.status).toBe(401);
  });

  it('returns JWT token', async () => {
    const reg = await registerUser();
    const res = await loginUser(reg.body.user.email);
    expect(res.body.token.split('.').length).toBe(3);
  });

  it('does not expose password', async () => {
    const reg = await registerUser();
    const res = await loginUser(reg.body.user.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('login is case-insensitive email', async () => {
    const reg = await registerUser();
    const res = await loginUser(reg.body.user.email.toUpperCase());
    expect(res.status).toBe(200);
  });

  it('rejects malformed payload', async () => {
    const res = await loginUser({} as any);
    expect(res.status).toBe(401);
  });

  it('rejects SQL injection attempt', async () => {
    const res = await loginUser("' OR 1=1 --");
    expect(res.status).toBe(401);
  });
});