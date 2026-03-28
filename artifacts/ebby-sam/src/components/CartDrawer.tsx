import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { Button } from './ui-elements';

const WHATSAPP_NUMBER = "2348123456789";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCart();
  
  const total = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

  const handleOrder = () => {
    let message = `Hello Ebby Sam! 👋\n\nI'd like to place an order:\n\n`;
    items.forEach(item => {
      message += `• ${item.product.name}\n`;
      if (item.size) message += `   Size: ${item.size}\n`;
      if (item.color) message += `   Color: ${item.color}\n`;
      message += `   Qty: ${item.quantity} | Price: ₦${Number(item.product.price).toLocaleString()}\n\n`;
    });
    message += `Order Total: ₦${total.toLocaleString()}\n\nPlease confirm availability and arrange delivery. Thank you!`;
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" 
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl text-foreground flex items-center gap-3">
            <ShoppingBag className="text-primary" /> Your Cart
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="text-lg">Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-background p-4 rounded-lg border border-border">
                <div className="w-20 h-24 bg-card overflow-hidden rounded-sm flex-shrink-0">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-foreground pr-4 line-clamp-2 leading-tight">{item.product.name}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                        <X size={16} />
                      </button>
                    </div>
                    {(item.size || item.color) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    )}
                    <p className="text-primary font-medium mt-1">₦{Number(item.product.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-sm border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-sm border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-background">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-display text-primary">₦{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Delivery arranged after order confirmation via WhatsApp.</p>
            <Button className="w-full" onClick={handleOrder}>
              Place Order via WhatsApp
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
