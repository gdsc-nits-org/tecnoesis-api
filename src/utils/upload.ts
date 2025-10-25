import multer from "multer";
import multerS3 from "multer-s3";
import { initializeAWS, s3 } from "@utils/aws";

let upload: multer.Multer;

function initializeMulter() {
  initializeAWS();
  upload = multer({
    storage: multerS3({
      s3,
      cacheControl: "max-age=31536000",
      bucket: process.env.AWS_S3_BUCKET_NAME!,
      // acl: "public-read", // <-- THIS LINE IS REMOVED
      contentDisposition: "inline",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (_, file, cb) {
        cb(null, Date.now().toString() + "_" + file.originalname);
      },
    }),
    // ADD THIS 'limits' OBJECT TO FIX THE 413 ERROR
    limits: {
      fileSize: 50 * 1024 * 1024, // Set to 50MB (or your desired limit)
    },
  });
}

export { initializeMulter, upload };