import { Router, type IRouter } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import crypto from "crypto";

const router: IRouter = Router();
const BUCKET = "product-images";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.post("/upload-image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const ext = req.file.originalname.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `products/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      req.log.error({ error }, "Supabase upload failed");
      return res.status(500).json({ error: `Upload failed: ${error.message}` });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
    res.json({ publicUrl: urlData.publicUrl, key });
  } catch (err: unknown) {
    req.log.error({ err }, "Image upload error");
    res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
});

export default router;
