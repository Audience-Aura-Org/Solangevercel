'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  // ─── Play helper ───────────────────────────────────────────────────
  const playVideo = (vid: HTMLVideoElement | null) => {
    if (!vid) return;
    vid.muted = true;       // must be set imperatively before play()
    vid.playsInline = true; // iOS requirement
    const p = vid.play();
    if (p) p.catch(() => { /* blocked — handled below */ });
  };

  // ─── useLayoutEffect: fires synchronously before browser paint ─────
  useLayoutEffect(() => {
    playVideo(bgVideoRef.current);
    playVideo(videoRefs.current[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Aggressive Polling on Mount ───────────────────────────────────
  // Mobile browsers (especially Safari) will sometimes falsely block
  // `.play()` if it is called EXACTLY during the heaviest rendering frames of hydration.
  // Polling it a few times over the first 1-2 seconds gracefully overcomes this race condition.
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      playVideo(bgVideoRef.current);
      playVideo(videoRefs.current[currentVideoIndex]);

      // Stop trying aggressively after 2 seconds
      if (attempts >= 10) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [currentVideoIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fallback: play on FIRST interaction of any kind ──────────────
  // Covers browsers that require user-activation for autoplay.
  // 'scroll' is counted as a user gesture on Chrome/Safari mobile.
  useEffect(() => {
    let played = false;

    const activate = () => {
      if (played) return;
      played = true;
      playVideo(bgVideoRef.current);
      playVideo(videoRefs.current[currentVideoIndex]);
    };

    // Listen to every reasonable first-activation signal
    window.addEventListener('touchstart', activate, { once: true, passive: true });
    window.addEventListener('scroll', activate, { once: true, passive: true });
    window.addEventListener('click', activate, { once: true, passive: true });
    window.addEventListener('keydown', activate, { once: true, passive: true });
    window.addEventListener('pointerdown', activate, { once: true, passive: true });

    // Resume when the tab comes back into focus
    const onVisible = () => { if (!document.hidden) activate(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('touchstart', activate);
      window.removeEventListener('scroll', activate);
      window.removeEventListener('click', activate);
      window.removeEventListener('keydown', activate);
      window.removeEventListener('pointerdown', activate);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Manage slider switching ───────────────────────────────────────
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentVideoIndex) {
        vid.currentTime = 0;
        playVideo(vid);
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
    <section className="hero-section relative w-full min-h-[100svh] pt-32 pb-16 px-6 lg:px-12 flex items-center justify-center overflow-hidden">

      {/* ── Ambient Background Video ── */}
        <div className="absolute inset-0 z-0">
        <video
          ref={(el) => {
            bgVideoRef.current = el;
            if (el) {
              el.defaultMuted = true;
              el.muted = true;
              el.playsInline = true;
            }
          }}
          src={videoList[0]}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          className="w-full h-full object-cover opacity-80 md:opacity-40 mix-blend-luminosity scale-105"
          poster={fallbackImage}
          onCanPlay={() => playVideo(bgVideoRef.current)}
          onLoadedData={() => playVideo(bgVideoRef.current)}
        />
        <div className="absolute inset-0 bg-dark-gradient backdrop-blur-[2px] pointer-events-none" style={{opacity: 0.32}} />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center justify-between gap-8 md:gap-16 z-20">

        {/* ── Video Slider ── */}
        <div
          className="w-full md:w-1/2 flex justify-center md:justify-end"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="hero-video-container relative rounded-2xl overflow-hidden border border-surface shadow-2xl bg-dark">

            {videoList.map((video, idx) => (
              <video
                key={video}
                ref={(el) => {
                  videoRefs.current[idx] = el;
                  if (el) {
                    el.defaultMuted = true;
                    el.muted = true;
                    el.playsInline = true;
                  }
                }}
                src={video}
                autoPlay={idx === 0}
                muted={true}
                playsInline={true}
                loop={videoList.length === 1}
                preload={idx === 0 ? 'auto' : 'metadata'}
                disablePictureInPicture
                onEnded={handleNext}
                onTimeUpdate={idx === currentVideoIndex ? handleTimeUpdate : undefined}
                onCanPlay={() => { if (idx === currentVideoIndex) playVideo(videoRefs.current[idx]); }}
                onLoadedData={() => { if (idx === currentVideoIndex) playVideo(videoRefs.current[idx]); }}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                poster={idx === 0 ? fallbackImage : undefined}
              />
            ))}

            {/* Slider Controls */}
            {videoList.length > 1 && (
              <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center items-center gap-6">
                    <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-dark/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-dark/60 transition-all" aria-label="Previous Video">&#8592;</button>
                <div className="flex gap-2">
                  {videoList.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentVideoIndex(idx)} aria-label={`Video ${idx + 1}`}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentVideoIndex ? 'bg-primary scale-125' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
                <button onClick={handleNext} className="w-10 h-10 rounded-full bg-dark/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-dark/60 transition-all" aria-label="Next Video">&#8594;</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Text Content ── */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-0">
          <div className="flex flex-col mb-8 gap-3 items-center md:items-start">
            <span className="text-[10px] text-gray-400 tracking-[0.4em] uppercase font-medium">La Maison de Beauté</span>
            <span className="text-[9px] text-accent tracking-[0.3em] uppercase font-light border-l border-accent pl-3">DMV Braider • Home services available!</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif mb-8 text-primary leading-[1.05] tracking-tight">
            {title.split(' ').map((word, i) => {
              const w = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
              return (w === 'hair' || w === 'braiding')
                ? <span key={i} className="italic font-light text-accent pr-3">{word} </span>
                : <span key={i}>{word} </span>;
            })}
          </h1>

          <p className="text-sm md:text-base text-gray-400 mb-14 font-light max-w-md mx-auto md:mx-0 tracking-wide leading-relaxed">{subtitle}</p>

          <Link href={ctaLink} className="inline-block text-[11px] uppercase tracking-[0.25em] font-medium text-accent border border-accent/50 hover:border-accent hover:bg-primary/10 px-8 py-4 transition-all duration-300">
            {ctaText}
          </Link>
        </div>

      </div>
    </section>
  );
}
