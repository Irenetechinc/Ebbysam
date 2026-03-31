import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import {
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  GetProductsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
    imageUrl: p.image_url,
    images: p.images ?? [],
    categoryId: p.category_id,
    categoryName: p.categories?.name ?? null,
    categorySlug: p.categories?.slug ?? null,
    stock: p.stock,
    featured: p.featured,
    badge: p.badge,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    material: p.material,
    sku: p.sku,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

router.get("/products", async (req, res) => {
  try {
    const query = GetProductsQueryParams.parse(req.query);

    let q = supabase
      .from("products")
      .select("*, categories(name, slug)")
      .order("created_at", { ascending: false });

    if (query.featured === "true") q = q.eq("featured", true);

    if (query.category) {
      const { data: cat } = await supabase
        .from("categories").select("id").eq("slug", query.category).single();
      if (cat) q = q.eq("category_id", cat.id);
    }

    const { data, error } = await q;
    if (error) throw error;

    res.json((data ?? []).map(formatProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.originalPrice ?? null,
        image_url: body.imageUrl,
        images: body.images ?? [],
        category_id: body.categoryId ?? null,
        stock: body.stock ?? 0,
        featured: body.featured ?? false,
        badge: body.badge ?? null,
        sizes: body.sizes ?? [],
        colors: body.colors ?? [],
        material: body.material ?? null,
        sku: body.sku ?? null,
      })
      .select("*, categories(name, slug)")
      .single();

    if (error) throw error;
    res.status(201).json(formatProduct(data));
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(400).json({ error: "Invalid product data" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse(req.params);

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Product not found" });
    res.json(formatProduct(data));
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse(req.params);
    const body = UpdateProductBody.parse(req.body);

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = body.price;
    if (body.originalPrice !== undefined) updates.original_price = body.originalPrice;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.images !== undefined) updates.images = body.images;
    if (body.categoryId !== undefined) updates.category_id = body.categoryId;
    if (body.stock !== undefined) updates.stock = body.stock;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.badge !== undefined) updates.badge = body.badge;
    if (body.sizes !== undefined) updates.sizes = body.sizes;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.material !== undefined) updates.material = body.material;
    if (body.sku !== undefined) updates.sku = body.sku;

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*, categories(name, slug)")
      .single();

    if (error || !data) return res.status(404).json({ error: "Product not found" });
    res.json(formatProduct(data));
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(400).json({ error: "Invalid product data" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse(req.params);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/admin/stats", async (req, res) => {
  try {
    const [p, c, f, o] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("featured", true),
      supabase.from("products").select("*", { count: "exact", head: true }).lte("stock", 0),
    ]);
    res.json({
      totalProducts: p.count ?? 0,
      totalCategories: c.count ?? 0,
      featuredProducts: f.count ?? 0,
      outOfStock: o.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
