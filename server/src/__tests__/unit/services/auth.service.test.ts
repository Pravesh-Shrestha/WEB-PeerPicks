import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../../errors/http-error';

// 1. Mock the dependencies
jest.mock('../../../repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../config/email', () => ({ sendEmail: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn(), unlinkSync: jest.fn() }));

describe('AuthService Unit Tests', () => {
  let authService: AuthService;
  let mockRepoInstance: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Since AuthService uses a top-level "new UserRepository()", 
    // we access the mocked instance via the prototype or the mock constructor.
    authService = new AuthService();
    mockRepoInstance = UserRepository.prototype as jest.Mocked<UserRepository>;
  });

  describe('login', () => {
    it('should throw Error on invalid credentials', async () => {
      mockRepoInstance.findByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: 'wrong@me.com', password: '123' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('returns token and user payload on success', async () => {
      mockRepoInstance.findByEmail.mockResolvedValue({
        _id: 'u1',
        email: 'user@test.com',
        role: 'user',
        password: 'hashed',
        fullName: 'Test User',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const result = await authService.login({ email: 'user@test.com', password: 'pw' } as any);

      expect(result.token).toBe('signed-token');
      expect(result.user).toMatchObject({ id: 'u1', email: 'user@test.com', role: 'user' });
    });
  });

  describe('register', () => {
    it('should throw 409 error if email already exists', async () => {
      mockRepoInstance.findByEmail.mockResolvedValue({ _id: 'exists' } as any);
      
      await expect(authService.register({ email: 'test@me.com', password: '123' } as any))
        .rejects.toThrow(new HttpError(409, 'User already exists'));
    });

    it('should lowercase and trim email during registration', async () => {
      mockRepoInstance.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockRepoInstance.create.mockResolvedValue({ _id: 'new123' } as any);
      
      const inputData = { 
        email: '  NewUser@Example.Com  ', 
        password: '123',
        fullName: 'Test User'
      };

      await authService.register(inputData as any);
      
      // Verify normalization
      expect(mockRepoInstance.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(mockRepoInstance.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newuser@example.com' })
      );
    });
  });

  describe('getUser helpers', () => {
    it('getUserById throws when user is missing', async () => {
      await expect(authService.getUserById('')).rejects.toThrow('User ID is required');
    });

    it('getUserById throws when user not found', async () => {
      mockRepoInstance.getUserById.mockResolvedValue(null as any);
      await expect(authService.getUserById('uid')).rejects.toThrow('User not found');
    });

    it('getUserByEmail normalizes and throws when not found', async () => {
      mockRepoInstance.findByEmail.mockResolvedValue(null as any);
      await expect(authService.getUserByEmail('NoOne@Mail.com')).rejects.toThrow('User not found');
      expect(mockRepoInstance.findByEmail).toHaveBeenCalledWith('NoOne@Mail.com');
    });
  });

  describe('updateUser', () => {
    it('throws when email already exists', async () => {
      mockRepoInstance.getUserById.mockResolvedValue({ _id: 'u1', email: 'old@mail.com' } as any);
      mockRepoInstance.findByEmail.mockResolvedValue({ _id: 'u2' } as any);

      await expect(authService.updateUser('u1', { email: 'new@mail.com' })).rejects.toThrow(
        new HttpError(409, 'Email already exists'),
      );
    });

    it('hashes password and cleans old profile asset', async () => {
      const fsMock = require('fs');
      mockRepoInstance.getUserById.mockResolvedValue({
        _id: 'u1',
        email: 'old@mail.com',
        profilePicture: 'uploads/old.png',
      } as any);
      mockRepoInstance.findByEmail.mockResolvedValue(null as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      fsMock.existsSync.mockReturnValue(true);

      await authService.updateUser('u1', { password: 'pw', email: 'new@mail.com', profilePicture: 'uploads/new.png' });

      expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
      expect(fsMock.unlinkSync).toHaveBeenCalled();
      expect(mockRepoInstance.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({ password: 'new_hash' }));
    });
  });

  describe('resetPassword', () => {
    it('should update user password after successful token verification', async () => {
      const mockDecoded = { id: 'user123' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      mockRepoInstance.getUserById.mockResolvedValue({ _id: 'user123' } as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');

      await authService.resetPassword('valid_token', 'new_pass_123');

      expect(mockRepoInstance.updateUser).toHaveBeenCalledWith('user123', {
        password: 'new_hash'
      });
    });

    it('throws invalid token when verification fails or input missing', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('bad'); });
      await expect(authService.resetPassword(undefined as any, 'pw')).rejects.toThrow('Invalid or expired token');
      await expect(authService.resetPassword('bad', 'pw')).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('validates email input and existence', async () => {
      await expect(authService.sendResetPasswordEmail()).rejects.toThrow(new HttpError(400, 'Email is required'));
      mockRepoInstance.findByEmail.mockResolvedValue(null as any);
      await expect(authService.sendResetPasswordEmail('missing@mail.com')).rejects.toThrow(new HttpError(404, 'User not found'));
    });

    it('sends email when user exists', async () => {
      const { sendEmail } = require('../../../config/email');
      mockRepoInstance.findByEmail.mockResolvedValue({ _id: 'u1', email: 'u1@mail.com', fullName: 'User' } as any);
      (jwt.sign as jest.Mock).mockReturnValue('reset-token');

      await authService.sendResetPasswordEmail('u1@mail.com');

      expect(sendEmail).toHaveBeenCalled();
    });
  });
});