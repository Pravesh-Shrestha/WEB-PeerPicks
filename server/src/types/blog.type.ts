import z from 'zod';

export const BlogSchema = z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(20),
    authorId: z.string(),
});

export type Blog = z.infer<typeof BlogSchema>;
