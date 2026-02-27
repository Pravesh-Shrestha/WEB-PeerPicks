// src/__tests__/unit/models/pick_fav.test.ts
import Favorite from '../../../models/favorites.model';
import Pick from '../../../models/pick.model';

describe('Pick and Favorite Schema Tests', () => {
  it('should require both a user and a pick ID for a Favorite', () => {
    const fav = new Favorite({});
    const err = fav.validateSync();
    expect(err?.errors.user).toBeDefined();
    expect(err?.errors.pick).toBeDefined();
  });

  it('should fail Pick validation if coordinates are missing', () => {
    const pick = new Pick({ location: { type: 'Point' } });
    const err = pick.validateSync();
    expect(err?.errors['location.coordinates']).toBeDefined();
  });

  it('should default upvoteCount and commentCount to 0 for new picks', () => {
    const pick = new Pick({});
    expect(pick.upvoteCount).toBe(0);
    expect(pick.commentCount).toBe(0);
  });

  it('should have timestamps enabled on Favorites', () => {
    const fav = new Favorite({ user: '507f1f77bcf86cd799439011', pick: '507f1f77bcf86cd799439011' });
    expect(fav.createdAt).toBeUndefined(); // Should exist after save, but schema should have it
    expect(Favorite.schema.options.timestamps).toBe(true);
  });
});