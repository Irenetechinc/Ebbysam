import type { Product } from '@workspace/api-client-react';
import { Button } from './ui-elements';
import { useCart } from '@/store/use-cart';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

export default function ProductCard({ product, onClick, index }: ProductCardProps) {
  const addItem = useCart(state => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      product,
      quantity: 1,
      size: product.sizes?.[0],
      color: product.colors?.[0]
    });
  };

  return (
    <div 
      className="group relative cursor-pointer flex flex-col"
      data-aos="fade-up"
      data-aos-delay={Math.min(index * 100, 600)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-card mb-5 rounded-sm" onClick={onClick}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {product.badge && (
          <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-md">
            {product.badge}
          </span>
        )}
        
        {/* Quick Actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-10 flex gap-2">
          <Button 
            className="flex-1 bg-black/80 backdrop-blur-md text-white border border-primary/50 hover:bg-primary py-3" 
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? "Quick Add" : "Sold Out"}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-start flex-1 px-1">
        <div className="pr-4">
          <h3 className="font-display text-lg text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">{product.categoryName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-medium text-primary">₦{Number(product.price).toLocaleString()}</p>
          {product.originalPrice && (
            <p className="text-xs text-muted-foreground line-through mt-0.5">₦{Number(product.originalPrice).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
