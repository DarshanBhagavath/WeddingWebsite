import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Upload, Plus, Loader2 } from 'lucide-react';

interface SlideshowProps {
  photos: string[];
  onReplacePhoto: (index: number, file: File) => Promise<void>;
  onAddPhoto: (file: File) => Promise<void>;
}

export function Slideshow({ photos, onReplacePhoto, onAddPhoto }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const totalSlides = photos.length + 1;

  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentIndex]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  const handleReplaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      await onReplacePhoto(currentIndex, file);
      setIsSaving(false);
    }
  };

  const handleAddChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      await onAddPhoto(file);
      setCurrentIndex(photos.length);
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[3/2] bg-[#F5F2EB] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/50 group/slideshow">
      {isSaving && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-[#E5D3B3] backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-sm tracking-widest uppercase">Saving Media...</p>
          <p className="text-xs text-white/50 mt-2 font-light">Processing high-resolution photo</p>
        </div>
      )}

      {currentIndex < photos.length ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-[#2C2A28]/50 bg-black/5">
          <label className={`cursor-pointer pointer-events-auto bg-white text-[#2C2A28] px-8 py-4 rounded-full font-medium flex items-center gap-3 shadow-2xl tracking-wide transition-all hover:bg-[#FDFBF7] hover:scale-105 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Plus className="w-6 h-6" />
            ADD NEW PHOTO
            <input type="file" accept="image/*" className="hidden" onChange={handleAddChange} disabled={isSaving} />
          </label>
        </div>
      )}

      {currentIndex < photos.length && (
        <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover/slideshow:bg-black/30 pointer-events-none" />
      )}

      {/* Navigation */}
      {totalSlides > 1 && (
        <>
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
        </>
      )}

      {/* Edit Overlay */}
      {currentIndex < photos.length && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slideshow:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
          <label className={`cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-8 py-3.5 rounded-full font-medium flex items-center gap-3 hover:bg-white transition-all shadow-2xl tracking-wide text-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload className="w-4 h-4" />
            REPLACE PHOTO {currentIndex + 1}
            <input type="file" accept="image/*" className="hidden" onChange={handleReplaceChange} disabled={isSaving} />
          </label>
        </div>
      )}
      
      {/* Indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? (i < photos.length ? 'bg-white scale-150' : 'bg-[#2C2A28] scale-150') : (i < photos.length ? 'bg-white/40 hover:bg-white/80' : 'bg-[#2C2A28]/40 hover:bg-[#2C2A28]/80')
              }`} 
              aria-label={i === photos.length ? "Add new photo" : `Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
