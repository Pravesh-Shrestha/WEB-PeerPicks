import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../../errors/http-error';

// 1. Mock the dependencies
jest.mock('../../../repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

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
  });
});