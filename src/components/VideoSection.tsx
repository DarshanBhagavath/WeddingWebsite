import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface VideoSectionProps {
  videoUrl: string;
  onReplaceVideo: (file: File) => Promise<void>;
}

export function VideoSection({ videoUrl, onReplaceVideo }: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [prevUrl, setPrevUrl] = useState(videoUrl);

  useEffect(() => {
    if (videoUrl !== prevUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
      setPrevUrl(videoUrl);
    }
  }, [videoUrl, prevUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      // Simulate video compression/optimization delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onReplaceVideo(file);
      setIsCompressing(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-[#1A1918] ring-1 ring-white/50 group/video flex items-center justify-center min-h-[300px]">
      {isCompressing && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-[#E5D3B3] backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-sm tracking-widest uppercase">Compressing Video...</p>
          <p className="text-xs text-white/50 mt-2 font-light">Optimizing size and resolution</p>
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full max-h-[75vh] aspect-video object-contain"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-6 right-6 opacity-0 group-hover/video:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
        <label className={`cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-6 py-3 rounded-full font-medium flex items-center gap-3 shadow-2xl tracking-wide text-xs transition-all ${isCompressing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}>
          <Upload className="w-4 h-4" />
          REPLACE VIDEO
          <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={isCompressing} />
        </label>
      </div>
    </div>
  );
}
