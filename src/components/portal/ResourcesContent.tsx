import { motion } from 'framer-motion';
import { Download, FileText, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResourcesContent() {
  const resources = [
    {
      id: 1,
      title: 'RAYAC Constitution',
      description: 'Official constitution and bylaws of RAYAC',
      type: 'PDF',
      size: '2.4 MB',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-500/5',
      downloadUrl: 'https://example.com/rayac-constitution.pdf',
    },
    {
      id: 2,
      title: 'Sermon Audio Archive',
      description: 'Collection of recent sermons and teachings',
      type: 'Audio',
      size: '156 MB',
      icon: <Music className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-500/5',
      downloadUrl: 'https://example.com/sermon-archive.zip',
    },
    {
      id: 3,
      title: 'Training Materials',
      description: 'Comprehensive training guides and resources',
      type: 'PDF',
      size: '5.2 MB',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-500/5',
      downloadUrl: 'https://example.com/training-materials.pdf',
    },
    {
      id: 4,
      title: 'Leadership Guides',
      description: 'Best practices for youth leaders',
      type: 'PDF',
      size: '3.8 MB',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-orange-500/20 to-orange-500/5',
      downloadUrl: 'https://example.com/leadership-guides.pdf',
    },
    {
      id: 5,
      title: 'Event Planning Toolkit',
      description: 'Templates and checklists for event planning',
      type: 'PDF',
      size: '1.9 MB',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-red-500/20 to-red-500/5',
      downloadUrl: 'https://example.com/event-planning-toolkit.pdf',
    },
    {
      id: 6,
      title: 'Digital Hymn Book',
      description: 'Complete collection of RAYAC hymns',
      type: 'PDF',
      size: '8.5 MB',
      icon: <Music className="w-6 h-6" />,
      color: 'from-pink-500/20 to-pink-500/5',
      downloadUrl: 'https://example.com/hymn-book.pdf',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Resources & Downloads</h2>
        <p className="text-accent-silver/70">Access important documents and materials</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, idx) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className={`bg-gradient-to-br ${resource.color} border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all`}
          >
            <div className="text-accent-red mb-4">{resource.icon}</div>

            <h3 className="text-lg font-semibold text-accent-red mb-1">{resource.title}</h3>
            <p className="text-accent-silver/70 text-sm mb-4">{resource.description}</p>

            <div className="flex items-center justify-between mb-4 text-xs text-accent-silver/60">
              <span className="bg-primary/20 px-2 py-1 rounded">{resource.type}</span>
              <span>{resource.size}</span>
            </div>

            <Button 
              onClick={() => window.open(resource.downloadUrl, '_blank')}
              className="w-full bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50 rounded-lg py-2 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
