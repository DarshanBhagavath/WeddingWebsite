import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface SlideshowProps {
  photos: string[];
  onReplacePhoto: (index: number, newUrl: string) => void;
}

export function Slideshow({ photos, onReplacePhoto }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onReplacePhoto(currentIndex, url);
    }
  };

  if (!photos.length) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[3/2] bg-[#EAE5DF] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/50 group/slideshow">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={photos[currentIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover/slideshow:bg-black/30 pointer-events-none" />

      {/* Navigation */}
      <button 
        onClick={prev} 
        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/70 hover:bg-white backdrop-blur-md rounded-full shadow-lg transition-all text-[#2C2A28] opacity-0 group-hover/slideshow:opacity-100 z-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={next} 
        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/70 hover:bg-white backdrop-blur-md rounded-full shadow-lg transition-all text-[#2C2A28] opacity-0 group-hover/slideshow:opacity-100 z-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Edit Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slideshow:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
        <label className="cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-8 py-3.5 rounded-full font-medium flex items-center gap-3 hover:bg-white transition-all shadow-2xl tracking-wide text-sm">
          <Upload className="w-4 h-4" />
          REPLACE PHOTO {currentIndex + 1}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {photos.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white scale-150' : 'bg-white/40 hover:bg-white/80'
            }`} 
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
