import { Upload } from 'lucide-react';

interface VideoSectionProps {
  videoUrl: string;
  onReplaceVideo: (file: File) => void;
}

export function VideoSection({ videoUrl, onReplaceVideo }: VideoSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplaceVideo(file);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-[#1A1918] ring-1 ring-white/50 group/video">
      <video
        src={videoUrl}
        controls
        className="w-full aspect-video object-contain"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-6 right-6 opacity-0 group-hover/video:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
        <label className="cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-6 py-3 rounded-full font-medium flex items-center gap-3 hover:bg-white transition-all shadow-2xl tracking-wide text-xs">
          <Upload className="w-4 h-4" />
          REPLACE VIDEO
          <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
