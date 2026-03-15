import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

export default function StoreContent() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const products = [
    { id: '1', name: 'RAYAC T-Shirt', price: 25, currency: 'USD', image: 'https://static.wixstatic.com/media/20287c_7eb1678ef5a14f2288188757b18b56ca~mv2.png?originWidth=256&originHeight=192', category: 'Merchandise', rating: 4.5, reviews: 12 },
    { id: '2', name: 'Youth Conference Ticket', price: 150, currency: 'USD', image: 'https://static.wixstatic.com/media/20287c_144cc94a40b044298c542a00f97fc832~mv2.png?originWidth=256&originHeight=192', category: 'Events', rating: 5, reviews: 8 },
    { id: '3', name: 'Leadership Training Course', price: 75, currency: 'USD', image: 'https://static.wixstatic.com/media/20287c_dee4ed9bc7084253b5bbbee8aa157865~mv2.png?originWidth=256&originHeight=192', category: 'Training', rating: 4.8, reviews: 15 },
    { id: '4', name: 'Devotional Book', price: 20, currency: 'USD', image: 'https://static.wixstatic.com/media/20287c_0bf24f5cd70b47609c69db16b7e979f7~mv2.png?originWidth=256&originHeight=192', category: 'Books', rating: 4.6, reviews: 10 },
    { id: '5', name: 'Church Merchandise Bundle', price: 45, currency: 'USD', image: 'https://static.wixstatic.com/media/20287c_ef577b9961364b798da687df7f5a6bd9~mv2.png?originWidth=256&originHeight=192', category: 'Merchandise', rating: 4.7, reviews: 9 },
    { id: '6', name: 'Digital Hymn Book', price: 50, currency: 'ZMW', image: '/assets/logo.jpeg', category: 'Digital', rating: 4.4, reviews: 6 },
  ];

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">RAYAC Store</h2>
          <p className="text-accent-silver/70">Shop for church items, courses, and merchandise</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl overflow-hidden hover:border-primary/50 transition-all group"
          >
            <div className="relative h-48 overflow-hidden bg-slate-700">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                width={300}
                originWidth={300}
                originHeight={200}
              />
              <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                {product.category}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </motion.button>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="text-lg font-semibold text-accent-red line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-accent-silver/30'}`} />
                  ))}
                </div>
                <span className="text-xs text-accent-silver/60">({product.reviews})</span>
              </div>
              <p className="text-2xl font-bold text-accent-red">{product.currency} {product.price.toFixed(2)}</p>
              <Button
                onClick={() => window.location.href = `/checkout?product=${encodeURIComponent(product.name)}&price=${product.price}&currency=${product.currency}`}
                className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}