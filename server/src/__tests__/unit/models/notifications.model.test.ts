import mongoose from 'mongoose';
import Notification from '../../../models/notification.model';

describe('Notification Model Unit Tests', () => {
 it('should only allow valid notification types', () => {
    const notif = new Notification({ type: 'INVALID_TYPE' });
    const err = notif.validateSync();
    expect(err?.errors.type).toBeDefined();
  });

  it('should default "read" status to false', () => {
    const notif = new Notification({ 
        type: 'WELCOME', 
        recipient: new mongoose.Types.ObjectId() 
    });
    expect(notif.read).toBe(false);
  });

  it('should require a recipient ID', () => {
    const notif = new Notification({ type: 'WELCOME' });
    const err = notif.validateSync();
    expect(err?.errors.recipient).toBeDefined();
  });
});