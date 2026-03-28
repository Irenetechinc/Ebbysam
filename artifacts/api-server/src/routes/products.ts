import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  GetProductsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const query = GetProductsQueryParams.parse(req.query);

    let products;
    if (query.category || query.featured) {
      const conditions = [];
      if (query.featured === "true") {
        conditions.push(eq(productsTable.featured, true));
      }

      if (query.category) {
        const category = await db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.slug, query.category))
          .limit(1);
        if (category.length > 0) {
          conditions.push(eq(productsTable.categoryId, category[0].id));
        }
      }

      products = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          description: productsTable.description,
          price: productsTable.price,
          originalPrice: productsTable.originalPrice,
          imageUrl: productsTable.imageUrl,
          images: productsTable.images,
          categoryId: productsTable.categoryId,
          categoryName: categoriesTable.name,
          categorySlug: categoriesTable.slug,
          stock: productsTable.stock,
          featured: productsTable.featured,
          badge: productsTable.badge,
          sizes: productsTable.sizes,
          colors: productsTable.colors,
          material: productsTable.material,
          sku: productsTable.sku,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(productsTable.createdAt));
    } else {
      products = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          description: productsTable.description,
          price: productsTable.price,
          originalPrice: productsTable.originalPrice,
          imageUrl: productsTable.imageUrl,
          images: productsTable.images,
          categoryId: productsTable.categoryId,
          categoryName: categoriesTable.name,
          categorySlug: categoriesTable.slug,
          stock: productsTable.stock,
          featured: productsTable.featured,
          badge: productsTable.badge,
          sizes: productsTable.sizes,
          colors: productsTable.colors,
          material: productsTable.material,
          sku: productsTable.sku,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .orderBy(desc(productsTable.createdAt));
    }

    const formatted = products.map((p) => ({
      ...p,
      price: parseFloat(p.price as string),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : null,
    }));

    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);

    const [product] = await db
      .insert(productsTable)
      .values({
        name: body.name,
        description: body.description,
        price: String(body.price),
        originalPrice: body.originalPrice != null ? String(body.originalPrice) : null,
        imageUrl: body.imageUrl,
        images: body.images ?? [],
        categoryId: body.categoryId ?? null,
        stock: body.stock ?? 0,
        featured: body.featured ?? false,
        badge: body.badge ?? null,
        sizes: body.sizes ?? [],
        colors: body.colors ?? [],
        material: body.material ?? null,
        sku: body.sku ?? null,
      })
      .returning();

    let categoryName = null;
    let categorySlug = null;
    if (product.categoryId) {
      const cats = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, product.categoryId))
        .limit(1);
      if (cats.length > 0) {
        categoryName = cats[0].name;
        categorySlug = cats[0].slug;
      }
    }

    res.status(201).json({
      ...product,
      price: parseFloat(product.price as string),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice as string) : null,
      categoryName,
      categorySlug,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(400).json({ error: "Invalid product data" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse(req.params);

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        stock: productsTable.stock,
        featured: productsTable.featured,
        badge: productsTable.badge,
        sizes: productsTable.sizes,
        colors: productsTable.colors,
        material: productsTable.material,
        sku: productsTable.sku,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id))
      .limit(1);

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const p = products[0];
    res.json({
      ...p,
      price: parseFloat(p.price as string),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse(req.params);
    const body = UpdateProductBody.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice != null ? String(body.originalPrice) : null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.material !== undefined) updateData.material = body.material;
    if (body.sku !== undefined) updateData.sku = body.sku;

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    let categoryName = null;
    let categorySlug = null;
    if (updated.categoryId) {
      const cats = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, updated.categoryId))
        .limit(1);
      if (cats.length > 0) {
        categoryName = cats[0].name;
        categorySlug = cats[0].slug;
      }
    }

    res.json({
      ...updated,
      price: parseFloat(updated.price as string),
      originalPrice: updated.originalPrice ? parseFloat(updated.originalPrice as string) : null,
      categoryName,
      categorySlug,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(400).json({ error: "Invalid product data" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse(req.params);

    const deleted = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning({ id: productsTable.id });

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/admin/stats", async (req, res) => {
  try {
    const [totalProducts] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(productsTable);
    const [totalCategories] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(categoriesTable);
    const [featuredProducts] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(productsTable)
      .where(eq(productsTable.featured, true));
    const [outOfStock] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(productsTable)
      .where(eq(productsTable.stock, 0));

    res.json({
      totalProducts: totalProducts.count,
      totalCategories: totalCategories.count,
      featuredProducts: featuredProducts.count,
      outOfStock: outOfStock.count,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
