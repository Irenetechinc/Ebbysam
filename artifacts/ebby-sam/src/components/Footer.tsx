import { Instagram, Tiktok, Facebook } from 'lucide-react';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="font-display text-3xl font-bold tracking-widest text-primary mb-6">EBY SAM FASHION COLLECTION</h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Where Elegance Meets Excellence. Redefining luxury through meticulously crafted clothing, striking accessories, and timeless jewelry.
            </p>
          </div>
          
          <div>
            <h3 className="font-display text-lg tracking-widest uppercase mb-6 text-foreground">Explore</h3>
            <ul className="space-y-4">
              <li><Link href="/#collection" className="text-muted-foreground hover:text-primary transition-colors">Latest Collection</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Clothing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Accessories</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Jewelry</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display text-lg tracking-widest uppercase mb-6 text-foreground">Contact</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li>support@ebbysam.adroomai.com</li>
              <li>+234 703 9275 166.</li>
              <li>Lagos, Nigeria</li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.instagram.com/samuel.eby.7?igsh=MWlncDFmMmEwNm1wNg== " className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@ebysam.collection?_r=1&_t=ZS-95TUwPuD5Eb " className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all">
                <Tiktok size={18} />
              </a>
              <a href="https://www.facebook.com/share/18e75jq62K/ " className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Eby Sam Fashion Luxury. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
