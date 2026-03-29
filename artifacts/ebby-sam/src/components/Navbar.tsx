import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/store/use-cart';

function scrollToCollection() {
  const el = document.getElementById('collection');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCart(state => state.items);
  const setIsCartOpen = useCart(state => state.setIsOpen);
  const [location] = useLocation();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCollectionClick = (e: React.MouseEvent) => {
    if (location === '/') {
      e.preventDefault();
      scrollToCollection();
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'glass-panel py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors p-1"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="font-display text-xl md:text-3xl font-bold tracking-widest text-primary flex-1 text-center md:text-left">
            EBBY SAM
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <Link
              href="/"
              className={`text-sm uppercase tracking-widest hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-foreground/80'}`}
            >
              Home
            </Link>
            <a
              href="/#collection"
              onClick={handleCollectionClick}
              className="text-sm uppercase tracking-widest hover:text-primary transition-colors text-foreground/80 cursor-pointer"
            >
              Collection
            </a>
            <Link
              href="/admin"
              className={`text-sm uppercase tracking-widest hover:text-primary transition-colors ${location === '/admin' ? 'text-primary' : 'text-foreground/80'}`}
            >
              Admin
            </Link>
          </div>

          {/* Cart Button */}
          <div className="flex items-center justify-end flex-1">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-center items-center animate-in fade-in duration-300">
          <button
            className="absolute top-5 right-5 text-foreground hover:text-primary p-2"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <div className="flex flex-col items-center space-y-8">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-display uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <a
              href="/#collection"
              onClick={(e) => { handleCollectionClick(e); setMobileMenuOpen(false); }}
              className="text-2xl font-display uppercase tracking-widest text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Collection
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-display uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
