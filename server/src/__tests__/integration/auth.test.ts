import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Authentication Integration Tests', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'Test@1234',
    fullName: 'Test User',
    dob: '1990-01-01',
    gender: 'male',
    phone: '+1234567890'
  };

  beforeAll(async () => {
    await UserModel.deleteOne({ email: testUser.email });
  });

  afterEach(async () => {
    // Clean up after each test
    await UserModel.deleteOne({ email: testUser.email });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: testUser.email });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('should fail with validation errors', async () => {
      const invalidUser = { email: 'newuser@example.com' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail when email already exists', async () => {
      // First signup
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Duplicate signup should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
    });
  });
});