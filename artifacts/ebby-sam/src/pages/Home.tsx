import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import AOS from 'aos';
import { useGetProducts } from '@workspace/api-client-react';
import type { Product } from '@workspace/api-client-react';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import { Button } from '@/components/ui-elements';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");
  const heroRef = useRef<HTMLDivElement>(null);
  const heroAnimated = useRef(false);

  const { data: allProducts = [], isLoading } = useGetProducts();

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: false,
      offset: 60,
      easing: 'ease-out-cubic',
      mirror: true,
      anchorPlacement: 'top-bottom',
    });

    if (heroRef.current && !heroAnimated.current) {
      heroAnimated.current = true;
      const elements = heroRef.current.querySelectorAll('.gsap-reveal');
      gsap.fromTo(
        elements,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [allProducts, activeTab]);

  const categories = ["All", ...Array.from(new Set(allProducts.map(p => p.categoryName).filter(Boolean))) as string[]];

  const filteredProducts = activeTab === "All"
    ? allProducts
    : allProducts.filter(p => p.categoryName === activeTab);

  const featuredProducts = allProducts.filter(p => p.featured).slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Ebby Sam Luxury"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>

        <div ref={heroRef} className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full mt-16">
          <p className="gsap-reveal text-primary uppercase tracking-[0.3em] text-xs md:text-sm mb-5 font-medium">New Collection 2024</p>
          <h1 className="gsap-reveal font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground font-bold mb-5 tracking-wide drop-shadow-2xl">
            <span className="gold-gradient">EBBY</span> SAM
          </h1>
          <p className="gsap-reveal text-base md:text-xl lg:text-2xl text-foreground/80 font-light tracking-widest uppercase mb-10 max-w-2xl mx-auto">
            Where Elegance Meets Excellence
          </p>
          <div className="gsap-reveal">
            <Button
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 md:px-12 md:py-5 text-sm md:text-base shadow-2xl"
            >
              Explore Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border">
          <div className="flex justify-between items-end mb-10 md:mb-16" data-aos="fade-up">
            <div>
              <h2 className="text-xs md:text-sm text-primary uppercase tracking-[0.3em] font-bold mb-2 md:mb-3">Highlights</h2>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-display text-foreground">Featured Pieces</h3>
            </div>
            <Button variant="ghost" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* The Brand Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/about-bg.png`}
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6" data-aos="zoom-in" data-aos-duration="1200">
          <span className="text-primary uppercase tracking-[0.3em] text-xs md:text-sm font-bold mb-3 md:mb-4 block">The Brand</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display text-foreground mb-5 md:mb-8">Uncompromising Quality</h2>
          <p className="text-base md:text-xl lg:text-2xl text-foreground/70 font-light leading-relaxed">
            Every Ebby Sam piece is meticulously crafted using only the finest materials. We believe true luxury whispers rather than shouts. Experience fashion that transcends seasons.
          </p>
        </div>
      </section>

      {/* Main Collection */}
      <section id="collection" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16" data-aos="fade-up">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display text-foreground mb-6 md:mb-8">The Collection</h2>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 md:px-6 py-2 text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === cat
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-card aspect-[3/4] mb-4 rounded-sm" />
                <div className="h-5 bg-card w-3/4 mb-2 rounded-sm" />
                <div className="h-3 bg-card w-1/4 rounded-sm" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 md:py-32 text-muted-foreground">
            <p className="text-base md:text-xl">No pieces found in this category.</p>
          </div>
        )}
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
