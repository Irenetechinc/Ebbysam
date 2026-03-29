import { useState, useRef } from 'react';
import {
  useGetProducts, useGetCategories, useGetAdminStats,
  useCreateProduct, useDeleteProduct,
  getGetProductsQueryKey, getGetAdminStatsQueryKey,
  useCreateCategory, getGetCategoriesQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Package, Tags, Star, AlertCircle, Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Input, Textarea, Select, Button, Label } from '@/components/ui-elements';

const BADGE_OPTIONS = [
  '', 'New Arrival', 'Best Seller', 'Limited Edition',
  'Exclusive', 'Trending', 'Sale', 'Restocked', 'Sold Out',
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size', 'Free Size'];
const JEWELRY_SIZES = ['5', '6', '7', '8', '9', '10'];
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

const ALL_SIZES = [...STANDARD_SIZES, ...JEWELRY_SIZES, ...SHOE_SIZES];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add-product' | 'categories'>('overview');

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 border-b border-border pb-5 md:pb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-display text-primary mb-1 md:mb-2">Atelier Control</h1>
            <p className="text-sm text-muted-foreground">Manage your luxury collection</p>
          </div>
          <div className="flex flex-wrap gap-1 bg-card p-1 rounded-md border border-border w-full md:w-auto">
            {(['overview', 'products', 'add-product', 'categories'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-3 md:px-6 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 md:p-8 min-h-[60vh] shadow-2xl">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab setTab={setActiveTab} />}
          {activeTab === 'add-product' && <AddProductTab setTab={setActiveTab} />}
          {activeTab === 'categories' && <CategoriesTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useGetAdminStats();
  if (isLoading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading intelligence...</div>;
  if (!stats) return <div className="text-center py-20 text-destructive">Failed to load stats.</div>;

  const statCards = [
    { label: "Total Collection", value: stats.totalProducts, icon: Package, color: "text-blue-400" },
    { label: "Categories", value: stats.totalCategories, icon: Tags, color: "text-purple-400" },
    { label: "Featured Pieces", value: stats.featuredProducts, icon: Star, color: "text-yellow-400" },
    { label: "Out of Stock", value: stats.outOfStock, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((s, i) => (
        <div key={i} className="bg-background border border-border p-4 md:p-6 rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl md:text-3xl font-display text-foreground">{s.value}</p>
          </div>
          <s.icon size={28} className={`${s.color} opacity-80`} />
        </div>
      ))}
    </div>
  );
}

function ProductsTab({ setTab }: { setTab: (t: 'overview' | 'products' | 'add-product' | 'categories') => void }) {
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
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-display">Collection Inventory</h2>
        <Button onClick={() => setTab('add-product')} className="gap-2 text-xs"><Plus size={14} /> New Piece</Button>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Piece</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Price</th>
              <th className="py-3 px-4 font-medium">Stock</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-background/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-background rounded-sm overflow-hidden shrink-0 border border-border">
                      <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="font-medium text-foreground text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{p.categoryName || '—'}</td>
                <td className="py-3 px-4 text-primary text-sm font-medium">₦{Number(p.price).toLocaleString()}</td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{p.stock}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {p.featured && <span className="text-[10px] uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-sm">Featured</span>}
                    {p.stock <= 0 && <span className="text-[10px] uppercase bg-destructive/20 text-destructive px-2 py-0.5 rounded-sm">Sold Out</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete product"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Inventory is empty. Add your first piece.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SizeBadgeSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState('');

  const toggle = (size: string) => {
    onChange(value.includes(size) ? value.filter(s => s !== size) : [...value, size]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setCustom('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ALL_SIZES.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={`px-3 py-1.5 text-xs border rounded-sm uppercase tracking-wider transition-all duration-200 ${
              value.includes(size)
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Custom size..."
          className="flex-1 px-3 py-2 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <button type="button" onClick={addCustom} className="px-3 py-2 bg-primary/20 text-primary text-xs rounded-sm hover:bg-primary/30 transition-colors">
          Add
        </button>
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected: {value.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded-sm mr-1 hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              {s} <X size={10} />
            </button>
          ))}
        </p>
      )}
    </div>
  );
}

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (files: FileList | null) => {
    if (files?.[0]) upload(files[0]);
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-sm transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        } ${value ? 'p-2' : 'p-8'}`}
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
      >
        {value ? (
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 rounded-sm overflow-hidden bg-background shrink-0">
              <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{value}</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-primary hover:underline"
                >
                  Change image
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading to Supabase...</p>
              </div>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-muted-foreground mb-3 opacity-60" />
                <p className="text-sm text-foreground font-medium mb-1">Drop image here or click to browse</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 10MB</p>
              </>
            )}
          </div>
        )}
        {uploading && value === '' && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="relative">
        <span className="text-xs text-muted-foreground block mb-1">Or paste an image URL directly:</span>
        <div className="flex gap-2 items-center">
          <ImageIcon size={14} className="text-muted-foreground shrink-0" />
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />
    </div>
  );
}

function AddProductTab({ setTab }: { setTab: (t: 'overview' | 'products' | 'add-product' | 'categories') => void }) {
  const { data: categories = [] } = useGetCategories();
  const createMutation = useCreateProduct();
  const queryClient = useQueryClient();

  const [imageUrl, setImageUrl] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colorsInput, setColorsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [badge, setBadge] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload or provide an image URL.');
      return;
    }
    const fd = new FormData(e.currentTarget);

    const originalPriceStr = fd.get('originalPrice') as string;
    const catIdStr = fd.get('categoryId') as string;

    createMutation.mutate({
      data: {
        name: fd.get('name') as string,
        description: fd.get('description') as string,
        price: Number(fd.get('price')),
        originalPrice: originalPriceStr ? Number(originalPriceStr) : undefined,
        imageUrl,
        images: imageUrl ? [imageUrl] : [],
        stock: Number(fd.get('stock') || 0),
        featured: isFeatured,
        categoryId: catIdStr ? Number(catIdStr) : undefined,
        badge: badge || undefined,
        sizes: selectedSizes,
        colors: colorsInput ? colorsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        material: (fd.get('material') as string) || undefined,
        sku: (fd.get('sku') as string) || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setTab('products');
      },
      onError: (err) => alert(`Failed to create: ${err.message || 'Validation error'}`)
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-display mb-6 md:mb-8">Add New Piece</h2>
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="md:col-span-2">
            <Label>Piece Name *</Label>
            <Input name="name" required placeholder="e.g. Imperial Gold Necklace" />
          </div>
          <div className="md:col-span-2">
            <Label>Description *</Label>
            <Textarea name="description" required placeholder="Detailed description of the piece..." />
          </div>

          <div>
            <Label>Price (₦) *</Label>
            <Input name="price" type="number" step="0.01" min="0" required placeholder="0.00" />
          </div>
          <div>
            <Label>Original Price (₦) — shows as strikethrough</Label>
            <Input name="originalPrice" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
        </div>

        <div>
          <Label>Product Image *</Label>
          <ImageUploader value={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
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
            <Label>Stock Quantity *</Label>
            <Input name="stock" type="number" min="0" required defaultValue="10" />
          </div>

          <div>
            <Label>Badge / Tag</Label>
            <Select value={badge} onChange={e => setBadge(e.target.value)}>
              {BADGE_OPTIONS.map(b => (
                <option key={b} value={b}>{b || '— None —'}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Material</Label>
            <Input name="material" placeholder="e.g. 18k Gold Plated, 100% Silk" />
          </div>
          <div>
            <Label>SKU / Reference</Label>
            <Input name="sku" placeholder="e.g. ES-NKL-001" />
          </div>
          <div>
            <Label>Colors (comma-separated)</Label>
            <Input
              value={colorsInput}
              onChange={e => setColorsInput(e.target.value)}
              placeholder="Gold, Silver, Rose Gold"
            />
          </div>
        </div>

        <div>
          <Label>Available Sizes</Label>
          <SizeBadgeSelector value={selectedSizes} onChange={setSelectedSizes} />
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setIsFeatured(!isFeatured)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isFeatured ? 'bg-primary' : 'bg-border'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <Label className="mb-0 cursor-pointer text-foreground" onClick={() => setIsFeatured(!isFeatured)}>
            Feature on landing page
          </Label>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => setTab('products')}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending || !imageUrl}>
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
    const name = (fd.get('name') as string).trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    createMutation.mutate({
      data: { name, slug, description: (fd.get('description') as string) || null }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        (e.target as HTMLFormElement).reset();
      },
      onError: (err) => alert(`Failed: ${err.message}`)
    });
  };

  if (isLoading) return <div className="animate-pulse py-10 text-muted-foreground text-center">Loading categories...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <div>
        <h2 className="text-xl md:text-2xl font-display mb-5 md:mb-6">Categories</h2>
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {categories.map(c => (
            <div key={c.id} className="p-4 border-b border-border last:border-0 flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">slug: {c.slug}</p>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div className="p-4 text-muted-foreground text-sm">No categories defined.</div>}
        </div>
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-display mb-5 md:mb-6">Add Category</h2>
        <form onSubmit={handleAddCategory} className="space-y-5 bg-background p-5 md:p-6 rounded-lg border border-border">
          <div>
            <Label>Category Name *</Label>
            <Input name="name" required placeholder="e.g. Fine Jewelry" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea name="description" placeholder="Short description..." className="min-h-[80px]" />
          </div>
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </form>
      </div>
    </div>
  );
}
