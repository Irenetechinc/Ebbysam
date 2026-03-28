import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '@workspace/api-client-react';
import { Button } from './ui-elements';
import { useCart } from '@/store/use-cart';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart(state => state.addItem);

  // Disable body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAddToCart = () => {
    addItem({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor
    });
    onClose();
  };

  const handleDirectOrder = () => {
    const number = "2348123456789";
    const message = `Hello Ebby Sam! 👋\n\nI'd like to place an order for:\n\n• ${product.name}\nSize: ${selectedSize || 'N/A'}\nColor: ${selectedColor || 'N/A'}\nQty: ${quantity}\nPrice: ₦${Number(product.price).toLocaleString()}\n\nPlease confirm availability and arrange delivery. Thank you!`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-xl overflow-hidden flex flex-col sm:flex-row relative shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full sm:w-1/2 h-[40vh] sm:h-auto bg-card relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <div className="absolute top-6 left-6 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 uppercase tracking-wider shadow-lg">
              {product.badge}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full sm:w-1/2 p-6 sm:p-12 overflow-y-auto flex flex-col">
          <div className="mb-2 text-primary text-sm uppercase tracking-widest font-semibold">{product.categoryName}</div>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4 leading-tight">{product.name}</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl text-primary font-medium">₦{Number(product.price).toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">₦{Number(product.originalPrice).toLocaleString()}</span>
            )}
          </div>

          <div className="prose prose-invert max-w-none text-muted-foreground mb-8">
            <p className="leading-relaxed">{product.description}</p>
            <ul className="mt-4 text-sm space-y-1">
              {product.material && <li><strong>Material:</strong> {product.material}</li>}
              {product.sku && <li><strong>SKU:</strong> {product.sku}</li>}
              <li><strong>Availability:</strong> {product.stock > 0 ? <span className="text-green-500">In Stock</span> : <span className="text-destructive">Out of Stock</span>}</li>
            </ul>
          </div>

          {/* Variants */}
          <div className="space-y-6 mb-8 mt-auto">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-3 text-foreground">Select Size</h4>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border transition-all ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-3 text-foreground">Select Color</h4>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm border transition-all ${
                        selectedColor === color 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
               <h4 className="text-sm uppercase tracking-wider mb-3 text-foreground">Quantity</h4>
               <div className="flex items-center border border-border w-fit">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:text-primary transition-colors">-</button>
                 <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:text-primary transition-colors">+</button>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={handleAddToCart} disabled={product.stock <= 0} className="w-full">
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button variant="outline" onClick={handleDirectOrder} disabled={product.stock <= 0} className="w-full">
              Order via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
