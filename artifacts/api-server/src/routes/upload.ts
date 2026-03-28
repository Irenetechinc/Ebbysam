import { Router, type IRouter } from "express";
import { GetUploadUrlBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

router.post("/upload-url", async (req, res) => {
  try {
    GetUploadUrlBody.parse(req.body);
    const { filename, contentType } = req.body as { filename: string; contentType: string };

    const ext = filename.split(".").pop() ?? "jpg";
    const key = `products/${crypto.randomUUID()}.${ext}`;

    const uploadUrl = `https://via.placeholder.com/600x800?text=Upload+not+configured`;
    const publicUrl = `https://via.placeholder.com/600x800?text=${encodeURIComponent(filename)}`;

    res.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    req.log.error({ err }, "Failed to get upload URL");
    res.status(400).json({ error: "Invalid upload request" });
  }
});

export default router;
