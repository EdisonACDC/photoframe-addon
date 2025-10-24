import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: string;
  url: string;
  filename: string;
}

interface PhotoViewerProps {
  photos: Photo[];
  currentIndex: number;
  isPlaying: boolean;
  transitionDuration?: number;
}

export default function PhotoViewer({
  photos,
  currentIndex,
  isPlaying,
  transitionDuration = 0.7,
}: PhotoViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  if (photos.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Nessuna foto disponibile</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="w-screen h-screen bg-background overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.filename}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setImageLoaded(true)}
            data-testid={`photo-${currentPhoto.id}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
