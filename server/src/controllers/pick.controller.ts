import { Request, Response } from "express";
import { pickService } from "../services/pick.service";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const userRepo = new UserRepository(); // Create an instance

const resolveUserIdFromRequest = (req: Request): string | undefined => {
  const userFromMiddleware = (req.user as any)?._id?.toString();
  if (userFromMiddleware) return userFromMiddleware;

  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    const rawCookie = req.headers.cookie || "";
    const cookies = Object.fromEntries(
      rawCookie
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const index = entry.indexOf("=");
          return index === -1
            ? [entry, ""]
            : [entry.slice(0, index), decodeURIComponent(entry.slice(index + 1))];
        }),
    ) as Record<string, string>;

    token =
      cookies.auth_token ||
      cookies.token ||
      cookies.access_token ||
      cookies.jwt;
  }

  if (!token || token === "null" || token === "undefined") {
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
    return (decoded.id || decoded._id || decoded.sub)?.toString();
  } catch {
    return undefined;
  }
};

export const pickController = {
  /**
   * CREATE: Process new social post
   */
  async createPick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const placeData = JSON.parse(req.body.placeInfo);
      const reviewData = JSON.parse(req.body.reviewInfo);

      // EXTRACT COORDINATES FROM FRONTEND
      // Expecting { lng: number, lat: number } in placeInfo
      const location = {
        type: "Point",
        coordinates: [placeData.lng, placeData.lat],
      };

      const newPick = await pickService.createNewPick(userId, placeData, {
        ...reviewData,
        location, // Pass location to the service
        mediaUrls: (req.files as any[]).map(
          (f) => `/uploads/picks/${f.filename}`,
        ),
      });

      res.status(201).json({ success: true, data: newPick });
    } catch (error: any) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Discovery Feed (Instagram-style)
   * Enhanced: Passes current userId to check 'isUpvoted' and 'isFollowing'
   */
  async getDiscoveryFeed(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const feedType = (req.query.type as "new" | "following") || "new";

      // Extract userId if available (optional for public feeds)
      const currentUserId = resolveUserIdFromRequest(req);

      const feed = await pickService.getDiscoveryFeed(
        page,
        limit,
        currentUserId,
        feedType,
      );
      res.status(200).json({ success: true, data: feed });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Single Pick details
   */
  async getPick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = (req.user as any)?._id;

      const pick = await pickService.getPickById(id, currentUserId);
      if (!pick) throw new HttpError(404, "Review not found.");

      res.status(200).json({ success: true, data: pick });
    } catch (error: any) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  },

  /**
   * READ: User Profile Grid
   */
  async getUserPicks(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const currentUserId = (req.user as any)?._id;

      const data = await pickService.getPicksByUser(userId, currentUserId);

      res.status(200).json({
        success: true,
        data: data, // <-- just return service result directly
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  },
  /**
   * READ: Place Hub Data
   */
  async getPlaceProfile(req: Request, res: Response) {
    try {
      const { linkId } = req.params;
      const currentUserId = (req.user as any)?._id;

      const data = await pickService.getPlaceHubDetails(
        decodeURIComponent(linkId),
        currentUserId,
      );
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  /**
   * UPDATE: Owner-only edit
   */
  async updatePick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;

      const updated = await pickService.updateUserPick(id, userId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res
        .status(error.statusCode || 403)
        .json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE: Strictly owner-only removal
   */
  async deletePick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;

      await pickService.deleteUserPick(id, userId);
      res.status(200).json({ success: true, message: "Review deleted." });
    } catch (error: any) {
      res
        .status(error.statusCode || 403)
        .json({ success: false, message: error.message });
    }
  },
  /**
   * READ: Fetch hydrated discussion thread for a specific Pick.
   * This retrieves all comments/replies linked to the parent post.
   */
  async getPickDiscussion(req: Request, res: Response) {
    try {
      const { id } = req.params; // The ID of the parent Pick

      // Optional: Extract current user ID from middleware to hydrate 'hasUpvoted' status
      const currentUserId = (req.user as any)?._id;

      const discussion = await pickService.getDiscussion(id, currentUserId);

      res.status(200).json({
        success: true,
        data: discussion,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to load discussion.",
      });
    }
  },

  /**
   * READ: Category-based feed filtering
   */
  async getPicksByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const currentUserId = (req.user as any)?._id;

      const picks = await pickService.getPicksByCategory(
        category,
        page,
        limit,
        currentUserId,
      );
      res.status(200).json({ success: true, data: picks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

 /**
   * READ: Fetch all picks
   * Used for the Pick_Registry UI
   */
  async getAllPicks(req: Request, res: Response) {
    try {
      const picks = await pickService.getAllPicks();
      // Use 'picks' key to match the AdminRegistry frontend expectations
      res.status(200).json({ success: true, picks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};