
import { IBlog } from "../models/blog.model";
import { BlogModel } from "../models/blog.model";

export interface IBlogRepository {
    create(blogData: any): Promise<IBlog>;
    findById(id: string): Promise<IBlog | null>;
    findAll(): Promise<IBlog[]>;
    findAllPaginated(page: number, size: number, searchTerm?: string)
        : Promise<{blogs: IBlog[], total: number}>;
    update(id: string, blogData: any): Promise<IBlog | null>;
    delete(id: string): Promise<boolean>;
}

export class BlogRepository implements IBlogRepository {
    async create(blogData: any): Promise<IBlog> {
        const blog = new BlogModel(blogData);
        const newBlog = await blog.save();
        return newBlog;
    }

    async findById(id: string): Promise<IBlog | null> {
        const blog = await BlogModel.findById(id)
            .populate('authorId', 'email username');
        return blog;
    }

    async findAllPaginated(page: number, size: number, searchTerm?: string)
        : Promise<{ blogs: IBlog[]; total: number; }> {
        const filter: any= {};
        if (searchTerm) {
            filter.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { content: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        const [blogs, total] = await Promise.all([
            BlogModel.find(filter)
                .skip((page - 1) * size)
                .limit(size)
                .populate('authorId', 'email username'),
            BlogModel.countDocuments(filter)
        ]);
        return { blogs, total};
    }
    
    async findAll(): Promise<IBlog[]> {
        const blogs = await BlogModel.find()
            .populate('authorId', 'email username')
            // .populate('comments'); // populate author details
        return blogs;
    }
    async update(id: string, blogData: any): Promise<IBlog | null> {
        const result = await BlogModel.findByIdAndUpdate(id, blogData, { new: true });
        return result;
    }

    async delete(id: string): Promise<boolean> {
        const deletedBlog = await BlogModel.findByIdAndDelete(id);
        return deletedBlog !== null;
    }
}