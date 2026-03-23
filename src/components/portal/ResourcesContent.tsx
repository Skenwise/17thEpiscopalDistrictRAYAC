import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'Audio': return <Music className="w-6 h-6" />;
    case 'PDF': return <FileText className="w-6 h-6" />;
    default: return <BookOpen className="w-6 h-6" />;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'Audio': return 'from-purple-500/20 to-purple-500/5';
    case 'Video': return 'from-blue-500/20 to-blue-500/5';
    case 'PDF': return 'from-green-500/20 to-green-500/5';
    default: return 'from-orange-500/20 to-orange-500/5';
  }
};

export default function ResourcesContent() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Resources & Downloads</h2>
        <p className="text-accent-silver/70">Access important documents and materials</p>
      </div>

      {isLoading ? (
        <p className="text-accent-silver/70">Loading resources...</p>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-accent-silver/70">No resources available yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, idx) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`bg-gradient-to-br ${getColor(resource.type)} border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all`}
            >
              <div className="text-accent-red mb-4">{getIcon(resource.type)}</div>
              <h3 className="text-lg font-semibold text-accent-red mb-1">{resource.title}</h3>
              <p className="text-accent-silver/70 text-sm mb-4">{resource.description}</p>
              <div className="flex items-center justify-between mb-4 text-xs text-accent-silver/60">
                <span className="bg-primary/20 px-2 py-1 rounded">{resource.type}</span>
              </div>
              <Button
                onClick={() => window.open(resource.url, '_blank')}
                className="w-full bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50 rounded-lg py-2 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}