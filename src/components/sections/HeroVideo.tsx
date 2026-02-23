'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface HeroVideoProps {
  videos?: string[];
  videoUrl?: string; // fallback if single
  fallbackImage?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function HeroVideo({
  videos,
  videoUrl = '/videos/hero.mp4',
  fallbackImage = '/images/hero-fallback.jpg',
  title,
  subtitle,
  ctaText = 'Make a Reservation',
  ctaLink = '/booking',
}: HeroVideoProps) {
  // If videos array isn't provided, use videoUrl, otherwise fallback to default list
  const videoList = videos || [videoUrl, '/videos/hero-2.mp4', '/videos/hero-3.mp4'];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Manage video playback: only play the active video, pause/reset others
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentVideoIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => { /* Auto-play may be blocked initially by browser */ });
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [currentVideoIndex]);


  const handleNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoList.length);
  };

  const handlePrev = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoList.length) % videoList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchStartX.current - touchEndX.current > swipeThreshold) {
      handleNext(); // Swipe left
    }
    if (touchEndX.current - touchStartX.current > swipeThreshold) {
      handlePrev(); // Swipe right
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    // ensure videos never play longer than 30 seconds per slot
    if (vid.currentTime >= 30) {
      handleNext();
    }
  };

  return (
    <section className="relative w-full min-h-[100vh] pt-32 pb-16 px-6 lg:px-12 flex items-center justify-center overflow-hidden">
      {/* Ambient Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src={videoList[0]}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 md:opacity-30 mix-blend-luminosity scale-105"
          poster={fallbackImage}
        />
        {/* Darkening overlay with blur to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/90 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center justify-between gap-16 z-20">

        {/* Right Video Slider (Top on Mobile to sit right after Nav) */}
        <div
          className="w-full md:w-1/2 flex justify-center md:justify-end"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile Screen Ratio Container */}
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-[9/16] rounded-2xl overflow-hidden border border-[#222] shadow-2xl bg-[#0A0A0A]">

            {videoList.map((video, idx) => (
              <video
                key={idx}
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={video}
                muted
                playsInline
                autoPlay={idx === currentVideoIndex}
                onEnded={handleNext}
                onTimeUpdate={idx === currentVideoIndex ? handleTimeUpdate : undefined}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                poster={fallbackImage}
              />
            ))}

            {/* Slider Controls Overlay */}
            {videoList.length > 1 && (
              <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center items-center gap-6">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all font-light"
                  aria-label="Previous Video"
                >
                  &#8592;
                </button>
                <div className="flex gap-2">
                  {videoList.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentVideoIndex ? 'bg-[#C5A059] scale-125' : 'bg-white/30'
                        }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all font-light"
                  aria-label="Next Video"
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Left Content (Bottom on Mobile) */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mt-8 md:mt-0">
          <div className="flex flex-col mb-8 gap-3 items-center md:items-start">
            <span className="text-[10px] text-gray-400 tracking-[0.4em] uppercase font-medium">
              La Maison de Beauté
            </span>
            <span className="text-[9px] text-[#C5A059] tracking-[0.3em] uppercase font-light border-l border-[#C5A059] pl-3">
              DMV Braider • Home services available!
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif mb-8 text-[#FDFBF7] leading-[1.05] tracking-tight">
            {title.split(' ').map((word, i) => {
              const cleanedWord = word.replace(/[^a-zA-Z]/g, '');
              if (cleanedWord.toLowerCase() === 'hair' || cleanedWord.toLowerCase() === 'braiding') {
                return <span key={i} className="italic font-light text-[#C5A059] pr-3">{word} </span>;
              }
              return <span key={i}>{word} </span>;
            })}
          </h1>

          <p className="text-sm md:text-base text-gray-400 mb-14 font-light max-w-md mx-auto md:mx-0 tracking-wide leading-relaxed">
            {subtitle}
          </p>

          <div className="flex">
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = ctaLink)}
            >
              {ctaText}
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
