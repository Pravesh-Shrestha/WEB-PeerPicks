// src/__tests__/unit/models/user.model.test.ts
import {UserModel} from '../../../models/user.model';

describe('User Model Unit Tests', () => {
it('should fail validation if required fields are missing', () => {
    const user = new UserModel({});
    const err = user.validateSync();
    expect(err?.errors.fullName).toBeDefined();
    expect(err?.errors.email).toBeDefined();
    expect(err?.errors.password).toBeDefined();
  });

  it('should only allow "male" or "female" as gender', () => {
    const user = new UserModel({ gender: 'other' });
    const err = user.validateSync();
    expect(err?.errors.gender).toBeDefined();
  });

  it('should default the user role to "user"', () => {
    const user = new UserModel({ fullName: 'John Doe' });
    expect(user.role).toBe('user');
  });

  it('should initialize follower and following counts to 0', () => {
    const user = new UserModel({});
    expect(user.followerCount).toBe(0);
    expect(user.followingCount).toBe(0);
  });
});