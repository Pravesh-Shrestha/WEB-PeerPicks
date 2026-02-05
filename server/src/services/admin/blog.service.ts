import { BlogRepository } from "../../repositories/blog.repository";
const blogRepository = new BlogRepository();
export class AdminBlogService {
    async getAllBlogs(page?: string, size?: string, searchTerm?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;
        const { blogs, total } = await blogRepository.findAllPaginated(currentPage, pageSize, searchTerm);
        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        };
        return { blogs, pagination };
    }
}