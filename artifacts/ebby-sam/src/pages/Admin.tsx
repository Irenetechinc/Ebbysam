import { useState } from 'react';
import { useGetProducts, useGetCategories, useGetAdminStats, useCreateProduct, useDeleteProduct, getGetProductsQueryKey, getGetAdminStatsQueryKey, useCreateCategory, getGetCategoriesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Package, Tags, Star, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';
import { Input, Textarea, Select, Button, Label } from '@/components/ui-elements';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add-product' | 'categories'>('overview');
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-display text-primary mb-2">Atelier Control</h1>
            <p className="text-muted-foreground">Manage your luxury collection</p>
          </div>
          <div className="flex mt-6 md:mt-0 bg-card p-1 rounded-md border border-border">
            {['overview', 'products', 'add-product', 'categories'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 text-sm uppercase tracking-wider rounded-sm transition-all ${
                  activeTab === tab ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 min-h-[60vh] shadow-2xl">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab setTab={setActiveTab} />}
          {activeTab === 'add-product' && <AddProductTab setTab={setActiveTab} />}
          {activeTab === 'categories' && <CategoriesTab />}
        </div>
        
      </div>
    </div>
  );
}

// --- Tabs Components ---

function OverviewTab() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading intelligence...</div>;
  if (!stats) return <div className="text-center py-20 text-destructive">Failed to load stats. API endpoint might not exist yet.</div>;

  const statCards = [
    { label: "Total Collection", value: stats.totalProducts, icon: Package, color: "text-blue-400" },
    { label: "Categories", value: stats.totalCategories, icon: Tags, color: "text-purple-400" },
    { label: "Featured Pieces", value: stats.featuredProducts, icon: Star, color: "text-yellow-400" },
    { label: "Out of Stock", value: stats.outOfStock, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((s, i) => (
        <div key={i} className="bg-background border border-border p-6 rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors">
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-3xl font-display text-foreground">{s.value}</p>
          </div>
          <s.icon size={32} className={s.color} opacity={0.8} />
        </div>
      ))}
    </div>
  );
}

function ProductsTab({ setTab }: { setTab: (t: any) => void }) {
  const { data: products = [], isLoading } = useGetProducts();
  const deleteMutation = useDeleteProduct();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Permanently delete this piece?")) {
      deleteMutation.mutate(
        { id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() }) }
      );
    }
  };

  if (isLoading) return <div className="animate-pulse py-20 text-center text-muted-foreground">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-display">Collection Inventory</h2>
        <Button onClick={() => setTab('add-product')} className="gap-2"><Plus size={16} /> New Piece</Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">Piece</th>
              <th className="py-4 px-4 font-medium">Category</th>
              <th className="py-4 px-4 font-medium">Price</th>
              <th className="py-4 px-4 font-medium">Stock</th>
              <th className="py-4 px-4 font-medium">Status</th>
              <th className="py-4 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-background/50 transition-colors">
                <td className="py-4 px-4 flex items-center gap-4">
                  <div className="w-12 h-16 bg-background rounded-sm overflow-hidden shrink-0">
                    <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="font-medium text-foreground">{p.name}</span>
                </td>
                <td className="py-4 px-4 text-muted-foreground">{p.categoryName || '—'}</td>
                <td className="py-4 px-4 text-primary">₦{Number(p.price).toLocaleString()}</td>
                <td className="py-4 px-4 text-muted-foreground">{p.stock}</td>
                <td className="py-4 px-4">
                  {p.featured && <span className="text-[10px] uppercase bg-primary/20 text-primary px-2 py-1 rounded-sm mr-2">Featured</span>}
                  {p.stock <= 0 && <span className="text-[10px] uppercase bg-destructive/20 text-destructive px-2 py-1 rounded-sm">Sold Out</span>}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Inventory is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddProductTab({ setTab }: { setTab: (t: any) => void }) {
  const { data: categories = [] } = useGetCategories();
  const createMutation = useCreateProduct();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const sizesStr = fd.get('sizes') as string;
    const colorsStr = fd.get('colors') as string;
    const originalPriceStr = fd.get('originalPrice') as string;
    const catIdStr = fd.get('categoryId') as string;
    
    createMutation.mutate({
      data: {
        name: fd.get('name') as string,
        description: fd.get('description') as string,
        price: Number(fd.get('price')),
        originalPrice: originalPriceStr ? Number(originalPriceStr) : undefined,
        imageUrl: fd.get('imageUrl') as string,
        stock: Number(fd.get('stock') || 0),
        featured: fd.get('featured') === 'on',
        categoryId: catIdStr ? Number(catIdStr) : undefined,
        badge: (fd.get('badge') as string) || undefined,
        sizes: sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: colorsStr ? colorsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        material: (fd.get('material') as string) || undefined,
        sku: (fd.get('sku') as string) || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setTab('products');
        alert("Product successfully added to collection.");
      },
      onError: (err) => alert(`Failed to create: ${err.message || 'Validation error'}`)
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-display mb-8">Add New Piece</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-6 md:col-span-2">
            <div>
              <Label>Piece Name</Label>
              <Input name="name" required placeholder="e.g. Imperial Gold Necklace" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" required placeholder="Detailed description of the piece..." />
            </div>
          </div>

          <div>
            <Label>Price (₦)</Label>
            <Input name="price" type="number" step="0.01" required placeholder="0.00" />
          </div>
          <div>
            <Label>Original Price (₦) - Optional</Label>
            <Input name="originalPrice" type="number" step="0.01" placeholder="0.00 (shows strike-through)" />
          </div>

          <div className="md:col-span-2">
            <Label>Primary Image URL</Label>
            <Input name="imageUrl" required placeholder="https://example.com/image.jpg" />
          </div>

          <div>
            <Label>Category</Label>
            <Select name="categoryId">
              <option value="">Select a category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label>Stock Quantity</Label>
            <Input name="stock" type="number" required defaultValue="10" />
          </div>

          <div>
            <Label>Sizes (Comma separated)</Label>
            <Input name="sizes" placeholder="S, M, L, XL" />
          </div>
          <div>
            <Label>Colors (Comma separated)</Label>
            <Input name="colors" placeholder="Gold, Silver, Rose Gold" />
          </div>

          <div>
            <Label>Material</Label>
            <Input name="material" placeholder="18k Gold Plated" />
          </div>
          <div>
            <Label>Badge / Tag</Label>
            <Input name="badge" placeholder="e.g. New Arrival, Best Seller" />
          </div>
          
        </div>
        
        <div className="flex items-center space-x-3 pt-4 border-t border-border">
          <input type="checkbox" id="featured" name="featured" className="w-5 h-5 accent-primary bg-card border-border rounded-sm" />
          <Label htmlFor="featured" className="mb-0 text-foreground cursor-pointer">Feature on landing page</Label>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => setTab('products')}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Add to Collection'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories = [], isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const queryClient = useQueryClient();

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    createMutation.mutate({
      data: { name, slug, description: fd.get('description') as string }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  if (isLoading) return <div className="animate-pulse">Loading categories...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="text-2xl font-display mb-6">Categories</h2>
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {categories.map(c => (
            <div key={c.id} className="p-4 border-b border-border last:border-0 flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div className="p-4 text-muted-foreground">No categories defined.</div>}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-display mb-6">Add Category</h2>
        <form onSubmit={handleAddCategory} className="space-y-6 bg-background p-6 rounded-lg border border-border">
          <div>
            <Label>Category Name</Label>
            <Input name="name" required placeholder="e.g. Fine Jewelry" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea name="description" placeholder="Short description..." className="min-h-[80px]" />
          </div>
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            Create Category
          </Button>
        </form>
      </div>
    </div>
  );
}
