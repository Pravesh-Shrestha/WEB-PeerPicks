import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../errors/http-error";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryClient, cloudinaryFolderPrefix } from "../config/cloudinary";

// Cloudinary storage keeps uploads off the local filesystem
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryClient,
    params: async (req, file) => {
        const folder = req.baseUrl.includes("picks") || file.fieldname === "images"
            ? `${cloudinaryFolderPrefix}/picks`
            : `${cloudinaryFolderPrefix}/profiles`;

        return {
            folder,
            resource_type: "auto", // allow images and videos
            public_id: uuidv4(),
        };
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // UPDATED: Added video mime types to support your new features
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'video/mp4', 
        'video/mpeg', 
        'video/quicktime', // .mov
        'video/webm'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HttpError(400, 'Invalid file type. Images and MP4/MOV/WEBM videos are allowed.') as any);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // Increased limit slightly to 20MB to accommodate video files
    limits: { fileSize: 20 * 1024 * 1024 } 
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};