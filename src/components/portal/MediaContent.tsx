import { motion } from 'framer-motion';
import { Play, Image as ImageIcon } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function MediaContent() {
  const mediaItems = [
    { id: 1, title: 'Youth Leadership Retreat 2025', type: 'photo', thumbnail: 'https://static.wixstatic.com/media/20287c_e5eeb160821640138688cee508065544~mv2.png?originWidth=256&originHeight=192', category: 'Events' },
    { id: 2, title: 'RAYAC Convention Highlights', type: 'video', thumbnail: 'https://static.wixstatic.com/media/20287c_0756f8bb86cb4d98ac903235fe151374~mv2.png?originWidth=256&originHeight=192', category: 'Conferences' },
    { id: 3, title: 'Community Outreach Program', type: 'photo', thumbnail: 'https://static.wixstatic.com/media/20287c_5ce0eb28b1804eed8dbdf169b14ac70b~mv2.png?originWidth=256&originHeight=192', category: 'Community' },
    { id: 4, title: 'Training Workshop Session', type: 'video', thumbnail: 'https://static.wixstatic.com/media/20287c_1acb4aceae14440f8c2f90dd109c7d99~mv2.png?originWidth=256&originHeight=192', category: 'Training' },
    { id: 5, title: 'Youth Fellowship Gathering', type: 'photo', thumbnail: 'https://static.wixstatic.com/media/20287c_1e083c93a67f4f1691b1937302bd5554~mv2.png?originWidth=256&originHeight=192', category: 'Events' },
    { id: 6, title: 'Volunteer Service Day', type: 'photo', thumbnail: 'https://static.wixstatic.com/media/20287c_344c538dd8b94246a2e3453d83c1101a~mv2.png?originWidth=256&originHeight=192', category: 'Volunteer' },
  ];

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
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-xl overflow-hidden border border-primary/30 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden bg-slate-800">
              <Image
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                width={300}
                originWidth={300}
                originHeight={200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {item.type === 'video' ? (
                  <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-semibold">
                {item.type === 'video' ? 'Video' : 'Photo'}
              </div>
              <div className="absolute bottom-2 left-2 bg-accent-red/80 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-semibold">
                {item.category}
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