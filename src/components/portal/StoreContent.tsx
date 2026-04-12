import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
}

export default function StoreContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'store_products'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Store</h2>
        <p className="text-accent-silver/70">Shop for resources and merchandise</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No products available at this time.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
            >
              {product.image && (
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-accent-red">{product.name}</h3>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">{product.category}</span>
                </div>
                <p className="text-accent-silver/70 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-green-400 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{product.currency} {product.price}</span>
                  </div>
                  <Button
                    onClick={() => window.location.href = `/website-checkout?product=${encodeURIComponent(product.name)}&price=${product.price}&currency=${product.currency}&type=store&itemId=${product.id}`}
                    disabled={!product.inStock}
                    className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg px-4 py-2 transition-all disabled:opacity-50"
                  >
                    {product.inStock ? 'Buy Now' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
