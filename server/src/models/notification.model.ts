import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User receiving the notification
  issuer: mongoose.Types.ObjectId;    // User who triggered the action
  type: 'VOTE' | 'COMMENT' | 'SAVE' | 'SYSTEM';
  pickId?: mongoose.Types.ObjectId;   // Reference to the post
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  issuer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['VOTE', 'COMMENT', 'SAVE', 'SYSTEM'], required: true },
  pickId: { type: Schema.Types.ObjectId, ref: 'Pick' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);