import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Image as ImageIcon, Loader2 } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
  order?: number;
  createdAt?: any;
}

export default function MediaContent() {
  const [mediaItems, setMediaItems] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const q = query(collection(db, 'gallery_images'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const images = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GalleryImage));
      setMediaItems(images);
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-accent-red animate-spin" />
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Media Gallery</h2>
          <p className="text-accent-silver/70">Explore photos and videos from RAYAC events and activities</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No media uploaded yet.</p>
          <p className="text-slate-500 text-sm mt-2">Check back soon for photos from our events!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Media Gallery</h2>
        <p className="text-accent-silver/70">Explore photos and videos from RAYAC events and activities</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-xl overflow-hidden border border-primary/30 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden bg-slate-800">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
              <h3 className="text-sm font-semibold text-accent-red line-clamp-2">{item.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}