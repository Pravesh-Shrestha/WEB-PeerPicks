import { BlogRepository } from "../repositories/blog.repository";
const blogRepository = new BlogRepository();
export class BlogService {
    async createBlog(blogData: any) {
        const newBlog = await blogRepository.create(blogData);
        return newBlog;
    }
    async getAllBlogs() {
        const blogs = await blogRepository.findAll();
        return blogs;
    }

}