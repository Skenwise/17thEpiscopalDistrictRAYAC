import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Product type
interface Product {
  _id: string;
  itemName?: string;
  itemPrice?: number;
  itemImage?: string;
  itemDescription?: string;
}

// Helper: format price
const formatPrice = (price: number, currency = 'USD') =>
  `${currency} ${price.toFixed(2)}`;

// Dummy API call placeholder
const fetchProducts = async (): Promise<Product[]> => {
  // Replace this with your backend API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: '1',
          itemName: 'Sample Product',
          itemPrice: 29.99,
          itemDescription: 'This is a sample product.',
          itemImage: 'https://via.placeholder.com/400x256',
        },
        {
          _id: '2',
          itemName: 'Another Product',
          itemPrice: 49.99,
          itemDescription: 'Another example product.',
          itemImage: 'https://via.placeholder.com/400x256',
        },
      ]);
    }, 500);
  });
};

export default function DigitalMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const currency = 'USD';

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        setProducts(result);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const addToCart = async (productId: string) => {
    setAddingItemId(productId);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    setAddingItemId(null);
    alert(`Added product ${productId} to cart!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-[100rem] mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="font-heading text-6xl font-bold text-primary mb-4">Digital Marketplace</h1>
          <p className="font-paragraph text-lg text-gray-700">Explore our collection of digital resources and materials.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg border border-accent-silver overflow-hidden hover:shadow-lg transition-shadow">
                {product.itemImage && (
                  <div className="w-full h-64 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.itemImage}
                      alt={product.itemName || 'Product'}
                      width={400}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="font-heading text-2xl font-bold text-primary mb-2">{product.itemName}</h2>
                  {product.itemDescription && (
                    <p className="font-paragraph text-gray-600 mb-4 text-sm">{product.itemDescription}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-heading text-3xl font-bold text-primary">
                      {formatPrice(product.itemPrice || 0, currency)}
                    </span>

                    <Button
                      onClick={() => addToCart(product._id)}
                      disabled={addingItemId === product._id}
                      className="bg-primary hover:bg-accent-red text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {addingItemId === product._id ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-paragraph text-lg text-gray-600">No products available at the moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
