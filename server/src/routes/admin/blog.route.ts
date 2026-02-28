import { AdminBlogController } from "../../controllers/admin/blog.controller";
import { Router } from "express";
import { protect,isAdmin } from "../../middlewares/admin.middleware";
const adminBlogRouter = Router();
const adminBlogController = new AdminBlogController();

adminBlogRouter.use(protect);
adminBlogRouter.use(isAdmin);

adminBlogRouter.get("/", adminBlogController.getAllBlogs);

export default adminBlogRouter;