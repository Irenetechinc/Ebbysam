import { Router } from "express";
import { verifyCredentials, createToken, verifyToken } from "../lib/auth";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  if (!verifyCredentials(username, password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({ token: createToken() });
});

router.post("/auth/verify", (req, res) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  res.json({ valid: verifyToken(token) });
});

export default router;
