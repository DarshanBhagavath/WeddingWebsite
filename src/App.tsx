/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Heart, Video, Upload, Edit3 } from 'lucide-react';
import { Slideshow } from './components/Slideshow';
import { VideoSection } from './components/VideoSection';
import { motion } from 'motion/react';

const INITIAL_PHOTOS = [
  'https://images.unsplash.com/photo-1583939000140-6c66ce62194c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1605256247963-c6001a182956?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1549416878-b9ca95e4e7e4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1610173826079-994fb699d799?auto=format&fit=crop&w=1600&q=80'
];

const INITIAL_VIDEO = 'https://upload.wikimedia.org/wikipedia/commons/9/94/Punjabi_Wedding_by_Sumita_Roy.webm';
const INITIAL_HERO = 'https://images.unsplash.com/photo-1583939000140-6c66ce62194c?auto=format&fit=crop&w=2000&q=80';

const compressImage = (file: File, maxWidth = 1920, maxHeight = 1080): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        }, 'image/jpeg', 0.85); // 0.85 quality to reduce size
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export default function App() {
  const [heroImage, setHeroImage] = useState(INITIAL_HERO);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [videos, setVideos] = useState<string[]>([INITIAL_VIDEO]);

  // Load from Server on mount
  useEffect(() => {
    const loadMedia = async () => {
      try {
        const response = await fetch('/api/media');
        if (response.ok) {
          const data = await response.json();
          if (data.heroImage) setHeroImage(data.heroImage);
          if (data.photos && data.photos.length > 0) {
             setPhotos(data.photos.map((p: string, i: number) => p || INITIAL_PHOTOS[i] || INITIAL_PHOTOS[0]));
          }
          if (data.videos && data.videos.length > 0) {
             setVideos(data.videos.map((v: string) => v || INITIAL_VIDEO));
          }
        }
      } catch (err) {
        console.error('Failed to load media from Server:', err);
      }
    };
    loadMedia();
  }, []);

  const handleReplacePhoto = async (index: number, file: File) => {
    try {
      let compressedFile = file;
      try {
        compressedFile = await compressImage(file);
      } catch (err) {
        console.warn('Compression failed, using original file', err);
      }

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('index', index.toString());
      formData.append('action', 'replace');

      const res = await fetch('/api/media/photo', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos.map((p: string, i: number) => p || INITIAL_PHOTOS[i] || INITIAL_PHOTOS[0]));
      } else {
        alert(`Failed to save photo: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Failed to save photo:', err);
      alert('Network error while saving photo.');
    }
  };

  const handleAddPhoto = async (file: File) => {
    try {
      let compressedFile = file;
      try {
        compressedFile = await compressImage(file);
      } catch (err) {
        console.warn('Compression failed, using original file', err);
      }

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('action', 'add');

      const res = await fetch('/api/media/photo', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos.map((p: string, i: number) => p || INITIAL_PHOTOS[i] || INITIAL_PHOTOS[0]));
      } else {
        alert(`Failed to add photo: ${res.statusText}. The file might be too large.`);
      }
    } catch (err) {
      console.error('Failed to add photo:', err);
      alert('Network error while adding photo.');
    }
  };

  const handleReplaceHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        let compressedFile = file;
        try {
          compressedFile = await compressImage(file, 2560, 1440);
        } catch (err) {
          console.warn('Compression failed, using original file', err);
        }

        const formData = new FormData();
        formData.append('file', compressedFile);
        
        const res = await fetch('/api/media/hero', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setHeroImage(data.url);
        } else {
          alert(`Failed to update cover photo: ${res.statusText}`);
        }
      } catch (err) {
        console.error('Failed to save hero image:', err);
        alert('Network error while saving cover photo.');
      }
    }
  };

  const handleReplaceVideo = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('index', index.toString());
      formData.append('action', 'replace');

      const res = await fetch('/api/media/video', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos.map((v: string) => v || INITIAL_VIDEO));
      } else {
        alert(`Failed to replace video: ${res.statusText}. The file might be too large.`);
      }
    } catch (err) {
      console.error('Failed to save video to Server:', err);
      alert('Network error while saving video.');
    }
  };

  const handleAddVideo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'add');

      const res = await fetch('/api/media/video', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos.map((v: string) => v || INITIAL_VIDEO));
      } else {
        alert(`Failed to add video: ${res.statusText}. The file might be too large.`);
      }
    } catch (err) {
      console.error('Failed to save video to Server:', err);
      alert('Network error while saving video.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-['Montserrat'] text-[#2C2A28]">
      {/* Hero Section */}
      <header className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden group bg-[#1A1918]">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Wedding Hero" className="w-full h-full object-contain opacity-80" />
          <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover:bg-black/50" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
          <label className="cursor-pointer pointer-events-auto bg-white/90 text-[#2C2A28] px-8 py-3.5 rounded-full font-medium flex items-center gap-3 hover:bg-white transition-all shadow-2xl tracking-wide text-sm">
            <Upload className="w-4 h-4" />
            REPLACE COVER PHOTO
            <input type="file" accept="image/*" className="hidden" onChange={handleReplaceHero} />
          </label>
        </div>

        <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-['Cormorant_Garamond'] font-medium tracking-wider mb-6 drop-shadow-md">
              Chandini <span className="text-[#E5D3B3] italic font-light mx-2">&</span> Darshan
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base font-light tracking-[0.3em] uppercase mt-12 drop-shadow-md">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#E5D3B3]" />
                November 3, 2019
              </div>
              <div className="hidden md:block w-1 h-1 rounded-full bg-[#E5D3B3]" />
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#E5D3B3]" />
                Bengaluru, India
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content Sections */}
      <main className="max-w-6xl mx-auto px-4 py-32 space-y-40">
        
        {/* Slideshow Section */}
        <section className="space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-[#2C2A28] tracking-wide">Captured Moments</h2>
            <div className="w-12 h-[1px] bg-[#D4C3A3] mx-auto"></div>
            <p className="text-[#7A7571] max-w-2xl mx-auto text-base font-light tracking-wide leading-relaxed">
              A glimpse into our beautiful beginning, surrounded by loved ones.
            </p>
          </div>
          
          <Slideshow 
            photos={photos} 
            onReplacePhoto={handleReplacePhoto} 
            onAddPhoto={handleAddPhoto}
          />
        </section>

        {/* Video Section */}
        <section className="space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-[#2C2A28] tracking-wide">Wedding Film</h2>
            <div className="w-12 h-[1px] bg-[#D4C3A3] mx-auto"></div>
            <p className="text-[#7A7571] max-w-2xl mx-auto text-base font-light tracking-wide leading-relaxed">
              Relive the magic and emotion of our special day.
            </p>
          </div>

          <VideoSection 
            videoUrls={videos} 
            onReplaceVideo={handleReplaceVideo} 
            onAddVideo={handleAddVideo}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1A1918] text-[#D8CFC4] py-24 text-center space-y-8">
        <h3 className="text-4xl font-['Cormorant_Garamond'] text-[#E5D3B3] tracking-widest">C <span className="italic font-light mx-2">&</span> D</h3>
        <p className="tracking-[0.3em] uppercase text-xs font-light text-[#A39D98]">Forever starts here</p>
        <div className="w-8 h-[1px] bg-[#4A4744] mx-auto mt-12 mb-8"></div>
        <p className="text-[#7A7571] text-[10px] tracking-widest uppercase">Bengaluru, India • 2019</p>
      </footer>
    </div>
  );
}
