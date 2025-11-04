import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import path from "path";

const hasCloudinaryCreds =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// Middleware to upload req.files.image (from express-formidable) to Cloudinary
// and set req.fields.image to the secure URL for downstream controllers.
const cloudinaryUpload = async (req, res, next) => {
  try {
    if (req.files && req.files.image && req.files.image.path) {
      const filePath = req.files.image.path;
      // If Cloudinary credentials are present, upload to Cloudinary.
      if (hasCloudinaryCreds) {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: "products",
          resource_type: "image",
        });

        // ensure fields object exists (formidable sets req.fields)
        req.fields = req.fields || {};
        req.fields.image = uploadResult.secure_url || uploadResult.url;

        // remove temporary file
        await fs.unlink(filePath).catch(() => {});
      } else {
        // Fallback: move the uploaded temp file into project's /uploads folder and set a public URL.
        const uploadsDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const ext = path.extname(filePath);
        const fileName = `image-${Date.now()}${ext}`;
        const destPath = path.join(uploadsDir, fileName);

        // move temp file to uploads directory
        try {
          await fs.rename(filePath, destPath);
        } catch (moveErr) {
          // On some platforms (Windows) moving files across devices/drives
          // can throw EXDEV. Fall back to copy+unlink to support cross-drive moves.
          if (moveErr && moveErr.code === "EXDEV") {
            await fs.copyFile(filePath, destPath);
            await fs.unlink(filePath).catch(() => {});
          } else {
            // rethrow other errors
            throw moveErr;
          }
        }

        req.fields = req.fields || {};
        // public URL that the frontend can load (index.js serves /uploads statically)
        req.fields.image = `/uploads/${fileName}`;
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default cloudinaryUpload;
