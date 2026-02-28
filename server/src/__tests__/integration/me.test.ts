import { testApp } from '../helpers/testApp';
import { UserModel } from '../../models/user.model';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

describe('AUTH — /me', () => {
  it('returns profile for valid token', async () => {
    const user = await UserModel.create({
      fullName: 'Auth User',
      email: 'me@test.com',
      password: 'hashed',
      gender: 'female',
      dob: new Date(),
      phone: '123',
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    const res = await testApp
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects missing token', async () => {
    const res = await testApp.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});