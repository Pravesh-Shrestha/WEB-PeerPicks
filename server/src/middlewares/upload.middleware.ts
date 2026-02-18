import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http-error";

const baseUploadDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let targetDir = baseUploadDir;

        // Route 'images' (which now includes videos) to the picks folder
        if (req.baseUrl.includes('picks') || file.fieldname === 'images') {
            targetDir = path.join(baseUploadDir, 'picks');
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
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