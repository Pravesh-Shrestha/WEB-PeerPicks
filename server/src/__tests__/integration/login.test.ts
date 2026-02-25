import { testApp } from '../helpers/testApp';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';

describe('AUTH — Login', () => {
  const password = 'StrongPass123!';

  beforeEach(async () => {
    const hashed = await bcrypt.hash(password, 10);

    await UserModel.create({
      fullName: 'Test User',
      email: 'test@login.com',
      password: hashed,
      gender: 'male',
      dob: new Date('2000-01-01'),
      phone: '1234567890',
      role: 'user',
    });
  });

  it('logs in successfully with valid credentials', async () => {
    const res = await testApp
      .post('/api/auth/login')
      .send({
        email: 'test@login.com',
        password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@login.com');
  });

  it('fails with wrong password', async () => {
    const res = await testApp
      .post('/api/auth/login')
      .send({
        email: 'test@login.com',
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('fails with unknown email', async () => {
    const res = await testApp
      .post('/api/auth/login')
      .send({
        email: 'ghost@none.com',
        password,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid payload', async () => {
    const res = await testApp.post('/api/auth/login').send({
      email: 'not-an-email',
    });

    expect(res.status).toBe(401);
  });
});