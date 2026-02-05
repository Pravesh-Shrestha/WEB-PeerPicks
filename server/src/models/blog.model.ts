import mongoose, {Schema, Model} from "mongoose";
import { Blog } from "types/blog.type";

export interface IBlog extends Omit<Blog, 'authorId'> {
    authorId: mongoose.Types.ObjectId; // mongo implementation of ObjectId
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
const blogSchema: Schema<IBlog> = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);
export const BlogModel: Model<IBlog> = mongoose.model<IBlog>('Blog', blogSchema);