import { Upload, Loader2, Play, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface VideoSectionProps {
  videoUrls: string[];
  onReplaceVideo: (index: number, file: File) => Promise<void>;
  onAddVideo: (file: File) => Promise<void>;
}

export function VideoSection({ videoUrls, onReplaceVideo, onAddVideo }: VideoSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentUrl = currentIndex < videoUrls.length ? videoUrls[currentIndex] : '';
  const [prevUrl, setPrevUrl] = useState(currentUrl);

  const totalSlides = videoUrls.length + 1;

  useEffect(() => {
    if (currentUrl && currentUrl !== prevUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
      setPrevUrl(currentUrl);
      setIsPlaying(true);
    }
  }, [currentUrl, prevUrl]);

  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentIndex]);

  const handleReplaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      await onReplaceVideo(currentIndex, file);
      setIsSaving(false);
    }
  };

  const handleAddChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      await onAddVideo(file);
      setCurrentIndex(videoUrls.length); // Stay on the newly added video slide
      setIsSaving(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current && currentUrl) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const next = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };
  
  const prev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="space-y-8">
      <div className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-[#1A1918] ring-1 ring-white/50 group/video flex items-center justify-center min-h-[400px]">
        {isSaving && (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-[#E5D3B3] backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm tracking-widest uppercase">Saving Media...</p>
            <p className="text-xs text-white/50 mt-2 font-light">Processing high-resolution video</p>
          </div>
        )}
        
        {currentIndex < videoUrls.length ? (
          <video
            key={currentIndex}
            ref={videoRef}
            src={currentUrl}
            className="w-full max-h-[85vh] aspect-video object-contain"
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={isPlaying}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full max-h-[85vh] aspect-video flex flex-col items-center justify-center text-[#E5D3B3]/50 bg-black/40">
            <label className={`cursor-pointer pointer-events-auto bg-white text-[#2C2A28] px-8 py-4 rounded-full font-medium flex items-center gap-3 shadow-2xl tracking-wide transition-all hover:bg-[#FDFBF7] hover:scale-105 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Plus className="w-6 h-6" />
              ADD NEW VIDEO
              <input type="file" accept="video/*" className="hidden" onChange={handleAddChange} disabled={isSaving} />
            </label>
          </div>
        )}

        {!isPlaying && !isSaving && currentIndex < videoUrls.length && currentUrl && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors duration-500 cursor-pointer" onClick={togglePlay}>
            <div className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110">
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Navigation */}
        {totalSlides > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/70 hover:bg-white backdrop-blur-md rounded-full shadow-lg transition-all text-[#2C2A28] opacity-0 group-hover/video:opacity-100 z-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/70 hover:bg-white backdrop-blur-md rounded-full shadow-lg transition-all text-[#2C2A28] opacity-0 group-hover/video:opacity-100 z-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute top-6 right-6 opacity-0 group-hover/video:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
          {currentIndex < videoUrls.length && currentUrl && (
            <label className={`cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-6 py-3 rounded-full font-medium flex items-center gap-3 shadow-2xl tracking-wide text-xs transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}>
              <Upload className="w-4 h-4" />
              REPLACE VIDEO {currentIndex + 1}
              <input type="file" accept="video/*" className="hidden" onChange={handleReplaceChange} disabled={isSaving} />
            </label>
          )}
        </div>
        
        {/* Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(false); setCurrentIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-white scale-150' : 'bg-white/40 hover:bg-white/80'
                }`} 
                aria-label={i === videoUrls.length ? "Add new video" : `Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
