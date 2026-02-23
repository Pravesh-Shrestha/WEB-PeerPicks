import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  pick: Types.ObjectId;   // The specific analysis being discussed
  author: Types.ObjectId; // The user who wrote the comment (Nick/Pravesh)
  content: string;        // The actual text signal
  parentComment?: Types.ObjectId; // For nested replies (Protocol enhancement)
  isDeleted: boolean;     // [2026-02-01] Soft delete support
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    pick: { 
      type: Schema.Types.ObjectId, 
      ref: 'Pick', 
      required: true,
      index: true // Optimized for fast thread fetching
    },
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 1000 
    },
    parentComment: { 
      type: Schema.Types.ObjectId, 
      ref: 'Comment', 
      default: null 
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware to ensure we don't fetch "deleted" comments by default
CommentSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;