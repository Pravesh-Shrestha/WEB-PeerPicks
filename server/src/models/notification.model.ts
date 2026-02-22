import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: 'VOTE' | 'COMMENT' | 'SAVE' | 'WELCOME' | 'SYSTEM';
  status: 'success' | 'error' | 'info' | 'warning'; // For UI color mapping
  pickId?: Types.ObjectId;
  message?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  actor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Actor can be null for SYSTEM/WELCOME types
  },
  type: { 
    type: String, 
    enum: ['VOTE', 'COMMENT', 'SAVE', 'WELCOME', 'SYSTEM'], 
    required: true 
  },
  status: {
    type: String,
    enum: ['success', 'error', 'info', 'warning'],
    default: 'info'
  },
  pickId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Pick', 
    required: false,
    index: true 
  },
  message: { type: String, required: false },
  read: { 
    type: Boolean, 
    default: false,
    index: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- PERFORMANCE INDEXES ---

// For the main "Signal Feed" history
notificationSchema.index({ recipient: 1, createdAt: -1 });

// For the Sidebar Badge (the 401/500 performance killer)
notificationSchema.index({ recipient: 1, read: 1 });

/**
 * PROTOCOL COMPLIANT: Auto-Delete old signals [2026-02-01]
 * Keeps the node memory clean by removing notifications older than 30 days.
 */
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// --- VIRTUALS ---

// Friendly time for the UI (e.g., "2 mins ago")
notificationSchema.virtual('age').get(function() {
  return this.createdAt; 
});

export const NotificationModel = model<INotification>('Notification', notificationSchema);
export default NotificationModel;