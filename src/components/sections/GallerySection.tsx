'use client';

import Image from 'next/image';

const GALLERY_IMAGES = [
    '/images/1000055565.jpg',
    '/images/1000055589.jpg',
    '/images/1000055614.jpg',
    '/images/1000055604.jpg',
    '/images/1000055507-917x1024.jpg',
    '/images/1000055633-840x1024.jpg',
];

export default function GallerySection() {
    return (
        <section className="bg-dark py-32 lg:py-52 overflow-hidden border-t border-surface">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-20">
                <span className="text-[10px] uppercase tracking-[0.5em] text-accent block mb-6">Archive</span>
                <h2 className="text-4xl md:text-7xl font-serif text-primary">Editorial <span className="italic font-light text-accent">Portfolio</span>.</h2>
            </div>

            <div className="flex overflow-x-auto gap-8 px-6 lg:px-12 pb-12 no-scrollbar snap-x">
                {GALLERY_IMAGES.map((img, i) => (
                    <div key={i} className="flex-none w-[300px] md:w-[450px] aspect-[3/4] relative rounded-2xl overflow-hidden border border-surface snap-center group">
                        <Image
                            src={img}
                            alt={`Gallery Image ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                            sizes="(max-width: 768px) 300px, 450px"
                            priority={i < 2}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                            <span className="text-[10px] text-accent uppercase tracking-[0.3em]">Signature Hair Edition</span>
                            <p className="text-lg font-serif text-primary mt-1">La Maison Artistry</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 flex justify-end">
                <p className="text-muted text-[9px] uppercase tracking-[0.4em]">Scroll to explore archive</p>
            </div>

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </section>
    );
}
