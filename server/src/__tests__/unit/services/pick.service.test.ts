import { pickService } from '../../../services/pick.service';
import { pickRepository } from '../../../repositories/pick.repository';
import { socialRepository } from '../../../repositories/social.repository';
import { UserRepository } from '../../../repositories/user.repository';
import mongoose from 'mongoose';

jest.mock('../../../repositories/pick.repository');
jest.mock('../../../repositories/social.repository');
jest.mock('../../../repositories/user.repository');

describe('PickService Unit Tests', () => {
  const mockId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the internal UserRepo used by hydratePicks
    UserRepository.prototype.getUserById = jest.fn().mockResolvedValue({ 
      _id: mockId, 
      fullName: 'Test User' 
    });
  });

  it('should decrement parent comment count when a reply-pick is deleted', async () => {
    const parentId = new mongoose.Types.ObjectId().toString();
    const childPick = { _id: mockId, parentPick: parentId };
    
    (pickRepository.findById as jest.Mock).mockResolvedValue(childPick);
    (pickRepository.delete as jest.Mock).mockResolvedValue(true);
    (socialRepository.decrementCommentCount as jest.Mock).mockResolvedValue({});

    const result = await pickService.deleteUserPick(mockId, 'user123');

    expect(result).toBe(true);
    expect(socialRepository.decrementCommentCount).toHaveBeenCalledWith(parentId);
  });
});