import { testApp } from './testApp';

export async function registerUser(overrides = {}) {
  return testApp.post('/api/auth/register').send({
    fullName: 'Test User',
    email: `user_${Date.now()}@test.com`,
    password: 'Password123!',
    gender: 'male',
    dob: '1999-01-01',
    phone: '9999999999',
    ...overrides,
  });
}

export async function loginUser(email: string, password = 'Password123!') {
  return testApp.post('/api/auth/login').send({ email, password });
}