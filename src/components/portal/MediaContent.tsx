import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImageLightbox from '@/components/ui/ImageLightbox';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
  order: number;
}

export default function MediaContent() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'gallery_images'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        setImages(snap.docs.map(doc => ({ id: doc.id, title: doc.data().title, image: doc.data().image, order: doc.data().order } as GalleryImage)));
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-xl">
        <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No media available yet.</p>
        <p className="text-slate-500 text-sm mt-1">Check back later for photos and videos.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Media Gallery</h2>
        <p className="text-accent-silver/70">Browse photos and media from RAYAC events</p>
      </div>

      <div className="relative group">
        <div
          ref={galleryScrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              className="flex-shrink-0 w-72 h-56 rounded-xl overflow-hidden border-2 border-slate-600 hover:border-accent-red/50 transition-all cursor-pointer group/item relative"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-bold text-sm">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {images.length > 3 && (
          <>
            <button
              onClick={() => galleryScrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2.5 bg-gradient-to-r from-primary to-accent-red text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => galleryScrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2.5 bg-gradient-to-r from-primary to-accent-red text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </motion.div>
  );
}
