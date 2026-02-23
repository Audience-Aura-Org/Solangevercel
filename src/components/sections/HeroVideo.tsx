'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface HeroVideoProps {
  videos?: string[];
  videoUrl?: string;
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
  const videoList = videos || [videoUrl, '/videos/hero-2.mp4', '/videos/hero-3.mp4'];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activated, setActivated] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // ─── Attempt to play all active videos ─────────────────────────────
  const tryPlayActive = useCallback(() => {
    const slider = videoRefs.current[currentVideoIndex];
    const bg = bgVideoRef.current;

    [slider, bg].forEach((vid) => {
      if (!vid) return;
      vid.muted = true;
      if (vid.paused) {
        vid.play().catch(() => {/* blocked — will retry on interaction */ });
      }
    });
  }, [currentVideoIndex]);

  // ─── On mount: try immediately, then listen for first interaction ──
  useEffect(() => {
    // Attempt play straight away (works if page was previously activated)
    tryPlayActive();

    // On any user gesture — try play and mark activated
    const onActivate = () => {
      if (!activated) {
        setActivated(true);
        tryPlayActive();
      }
    };

    // Page visibility: resume when tab comes back into focus
    const onVisibility = () => {
      if (!document.hidden) tryPlayActive();
    };

    document.addEventListener('click', onActivate, { once: true, passive: true });
    document.addEventListener('touchstart', onActivate, { once: true, passive: true });
    document.addEventListener('keydown', onActivate, { once: true, passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('click', onActivate);
      document.removeEventListener('touchstart', onActivate);
      document.removeEventListener('keydown', onActivate);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Intersection Observer: play when section scrolls into view ────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlayActive();
      },
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [tryPlayActive]);

  // ─── Manage slider video switching ────────────────────────────────
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentVideoIndex) {
        vid.currentTime = 0;
        vid.muted = true;
        vid.play().catch(() => { });
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [currentVideoIndex]);

  const handleNext = () => setCurrentVideoIndex((p) => (p + 1) % videoList.length);
  const handlePrev = () => setCurrentVideoIndex((p) => (p - 1 + videoList.length) % videoList.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? handleNext() : handlePrev();
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.currentTarget.currentTime >= 30) handleNext();
  };

  return (
    <section
      ref={sectionRef}
      className="hero-section relative w-full min-h-[100svh] pt-32 pb-16 px-6 lg:px-12 flex items-center justify-center overflow-hidden"
    >
      {/* ── Ambient Background Video ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={bgVideoRef}
          src={videoList[0]}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          className="w-full h-full object-cover opacity-80 md:opacity-40 mix-blend-luminosity scale-105"
          poster={fallbackImage}
          onCanPlay={() => bgVideoRef.current?.play().catch(() => { })}
          onLoadedData={() => bgVideoRef.current?.play().catch(() => { })}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/90 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center justify-between gap-8 md:gap-16 z-20">

        {/* ── Video Slider ── */}
        <div
          className="w-full md:w-1/2 flex justify-center md:justify-end"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="hero-video-container relative rounded-2xl overflow-hidden border border-[#222] shadow-2xl bg-[#0A0A0A]">

            {videoList.map((video, idx) => (
              <video
                key={video}
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={video}
                muted
                playsInline
                preload={idx === 0 ? 'auto' : 'metadata'}
                autoPlay={idx === 0}
                loop={videoList.length === 1}
                onEnded={handleNext}
                onTimeUpdate={idx === currentVideoIndex ? handleTimeUpdate : undefined}
                onCanPlay={() => {
                  if (idx === currentVideoIndex) videoRefs.current[idx]?.play().catch(() => { });
                }}
                onLoadedData={() => {
                  if (idx === currentVideoIndex) videoRefs.current[idx]?.play().catch(() => { });
                }}
                disablePictureInPicture
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                poster={idx === 0 ? fallbackImage : undefined}
              />
            ))}

            {/* Slider Controls */}
            {videoList.length > 1 && (
              <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center items-center gap-6">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
                  aria-label="Previous Video"
                >&#8592;</button>
                <div className="flex gap-2">
                  {videoList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentVideoIndex(idx)}
                      aria-label={`Video ${idx + 1}`}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentVideoIndex ? 'bg-[#C5A059] scale-125' : 'bg-white/30'
                        }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
                  aria-label="Next Video"
                >&#8594;</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Text Content ── */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-0">
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
              const w = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
              return (w === 'hair' || w === 'braiding')
                ? <span key={i} className="italic font-light text-[#C5A059] pr-3">{word} </span>
                : <span key={i}>{word} </span>;
            })}
          </h1>

          <p className="text-sm md:text-base text-gray-400 mb-14 font-light max-w-md mx-auto md:mx-0 tracking-wide leading-relaxed">
            {subtitle}
          </p>

          {/* Use Next.js Link for instant client-side navigation */}
          <Link
            href={ctaLink}
            className="inline-block text-[11px] uppercase tracking-[0.25em] font-medium text-[#C5A059] border border-[#C5A059]/50 hover:border-[#C5A059] hover:bg-[#C5A059]/10 px-8 py-4 transition-all duration-300"
          >
            {ctaText}
          </Link>
        </div>

      </div>
    </section>
  );
}
