import { Router, type IRouter } from "express";
import { db, categoriesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(desc(categoriesTable.createdAt));

    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to get categories");
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const body = CreateCategoryBody.parse(req.body);

    const [category] = await db
      .insert(categoriesTable)
      .values({
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
      })
      .returning();

    res.status(201).json(category);
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(400).json({ error: "Invalid category data or slug already exists" });
  }
});

export default router;
