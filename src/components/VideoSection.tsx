import { Upload, Loader2, Play, Pause } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface VideoSectionProps {
  videoUrl: string;
  onReplaceVideo: (file: File) => Promise<void>;
}

export function VideoSection({ videoUrl, onReplaceVideo }: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevUrl, setPrevUrl] = useState(videoUrl);

  useEffect(() => {
    if (videoUrl !== prevUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
      setPrevUrl(videoUrl);
      setIsPlaying(true);
    }
  }, [videoUrl, prevUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      await onReplaceVideo(file);
      setIsSaving(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-[#1A1918] ring-1 ring-white/50 group/video flex items-center justify-center min-h-[400px]">
      {isSaving && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-[#E5D3B3] backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-sm tracking-widest uppercase">Saving Media...</p>
          <p className="text-xs text-white/50 mt-2 font-light">Processing high-resolution video</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full max-h-[85vh] aspect-video object-contain"
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={isPlaying}
      >
        Your browser does not support the video tag.
      </video>

      {!isPlaying && !isSaving && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors duration-500 cursor-pointer" onClick={togglePlay}>
          <div className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110">
            <Play className="w-8 h-8 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6 opacity-0 group-hover/video:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
        <label className={`cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-6 py-3 rounded-full font-medium flex items-center gap-3 shadow-2xl tracking-wide text-xs transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}>
          <Upload className="w-4 h-4" />
          REPLACE VIDEO
          <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={isSaving} />
        </label>
      </div>
    </div>
  );
}
