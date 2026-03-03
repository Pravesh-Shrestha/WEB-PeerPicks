import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { cloudinaryClient, cloudinaryFolderPrefix } from "../config/cloudinary";
import { UserModel } from "../models/user.model";
import Pick from "../models/pick.model";
import { FILE_UPLOAD_PATH, MONGO_URI } from "../config";

// Load env before using config
dotenv.config();

const uploadsRoot = FILE_UPLOAD_PATH || path.join(__dirname, "../../uploads");

const uploadLocalFile = async (localPath: string, folder: string) => {
  const resolved = path.resolve(localPath);
  if (!fs.existsSync(resolved)) {
    console.warn(`SKIP: File not found ${resolved}`);
    return null;
  }

  const publicId = uuidv4();
  const result = await cloudinaryClient.uploader.upload(resolved, {
    folder,
    resource_type: "auto",
    public_id: publicId,
  });

  return result.secure_url || result.url;
};

const migrateUsers = async () => {
  const users = await UserModel.find({ profilePicture: { $regex: "^/uploads" } });
  let migrated = 0;

  for (const user of users) {
    const rel = user.profilePicture?.replace(/^\/uploads\/?/, "");
    if (!rel) continue;

    const localPath = path.join(uploadsRoot, rel);
    const folder = `${cloudinaryFolderPrefix}/profiles`;
    const url = await uploadLocalFile(localPath, folder);
    if (!url) continue;

    user.profilePicture = url;
    await user.save();
    migrated += 1;
    console.log(`User ${user._id} migrated -> ${url}`);
  }

  console.log(`Users migrated: ${migrated}/${users.length}`);
};

const migratePicks = async () => {
  const picks = await Pick.find({ mediaUrls: { $elemMatch: { $regex: "^/uploads" } } });
  let totalUrls = 0;
  let migratedUrls = 0;

  for (const pick of picks) {
    const updated: string[] = [];
    for (const url of pick.mediaUrls) {
      if (!url.startsWith("/uploads")) {
        updated.push(url);
        continue;
      }

      totalUrls += 1;
      const rel = url.replace(/^\/uploads\/?/, "");
      const localPath = path.join(uploadsRoot, rel);
      const folder = `${cloudinaryFolderPrefix}/picks`;
      const remote = await uploadLocalFile(localPath, folder);
      if (remote) {
        updated.push(remote);
        migratedUrls += 1;
        console.log(`Pick ${pick._id} asset migrated -> ${remote}`);
      }
    }

    // Only persist if changed; bypass validators to skip legacy bad records
    if (updated.length !== pick.mediaUrls.length || updated.some((u, i) => u !== pick.mediaUrls[i])) {
      await Pick.updateOne(
        { _id: pick._id },
        { $set: { mediaUrls: updated } },
        { runValidators: false }
      );
    }
  }

  console.log(`Pick media migrated: ${migratedUrls}/${totalUrls}`);
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await migrateUsers();
    await migratePicks();

    console.log("Migration complete");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();