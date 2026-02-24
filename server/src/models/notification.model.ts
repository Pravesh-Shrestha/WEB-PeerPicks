import { Schema, model, Document, Types } from 'mongoose';

// Define the shape of a populated User for the actor field
export interface IPopulatedActor {
  _id: string;
  fullName: string;
  profilePicture?: string;
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  // UPDATE: Allow actor to be the ID or the populated object
  actor: Types.ObjectId | IPopulatedActor; 
  type: 'VOTE' | 'COMMENT' | 'SAVE' | 'WELCOME' | 'SYSTEM';
  status: 'success' | 'error' | 'info' | 'warning';
  pickId?: Types.ObjectId | any; // Allow for populated pick details
  message?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, enum: ['VOTE', 'COMMENT', 'SAVE', 'WELCOME', 'SYSTEM'], required: true },
  status: { type: String, enum: ['success', 'error', 'info', 'warning'], default: 'info' },
  pickId: { type: Schema.Types.ObjectId, ref: 'Pick', required: false, index: true },
  message: { type: String, required: false },
  read: { type: Boolean, default: false, index: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Protocol Compliant Delete Index [2026-02-01]
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
export default NotificationModel;