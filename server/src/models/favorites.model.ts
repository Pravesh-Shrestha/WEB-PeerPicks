import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  pick: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pick: { type: Schema.Types.ObjectId, ref: 'Pick', required: true },
}, { 
  timestamps: true 
});

// Ensure a user can't favorite the same pick twice at the DB level
FavoriteSchema.index({ user: 1, pick: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);