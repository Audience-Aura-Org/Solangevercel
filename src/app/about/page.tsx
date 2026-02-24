import { connectToDatabase } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';

const FALLBACK_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-combing-hair-of-a-woman-in-a-salon-4048-large.mp4';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1595476108018-0e817c1bf194?auto=format&fit=crop&q=80&w=1000';

async function getAboutVideo() {
  try {
    await connectToDatabase();
    const settings = await AdminSettings.findOne().lean() as any;
    if (settings?.media) {
      const v = settings.media.find((m: any) => m.id === 'about-v1');
      if (v?.url) return v.url;
    }
    return FALLBACK_VIDEO;
  } catch {
    return FALLBACK_VIDEO;
  }
}

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const videoUrl = await getAboutVideo();

  return (
    <main className="min-h-screen bg-dark text-primary selection:bg-accent selection:text-primary pt-32 lg:pt-40">

      {/* Header */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-20 md:mb-32 text-center md:text-left mt-10 md:mt-0">
        <span className="text-[10px] uppercase tracking-[0.4em] text-accent block mb-8">La Maison de Beauté</span>
        <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-[1.1] tracking-tight max-w-4xl mx-auto md:mx-0">
          The Art of <span className="italic font-light text-accent">Precision</span> & Elegance.
        </h1>
      </section>

      {/* Main Imagery / Philosophy */}
      <section className="border-t border-surface px-6 lg:px-12 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-start">

          <div className="relative aspect-[3/4] w-full bg-dark rounded-2xl overflow-hidden border border-surface">
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80"
              poster={FALLBACK_POSTER}
            />
            <div className="absolute inset-0 pointer-events-none" />
          </div>

          <div className="flex flex-col justify-center text-center md:text-left mt-8 md:mt-0">
            <h2 className="text-3xl font-serif mb-8 text-accent">Our Philosophy</h2>
            <div className="space-y-6 text-sm font-light leading-relaxed text-muted tracking-wide max-w-xl mx-auto md:mx-0">
              <p>
                Solange was established as a sanctuary for those who view their hair as a canvas. We reject the standard salon experience in favor of something deeply intentional, meticulously crafted, and undeniably luxurious.
              </p>
              <p>
                With over 15 years of absolute dedication to the craft, our master artisans understand that true luxury lies in the tension, the parting, and the longevity of the style. We do not rush. We do not compromise.
              </p>
              <p>
                Every service at La Maison is an editorial piece. You are not just receiving a protective style; you are experiencing an architectural elevation of your crown.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-12 border-t border-surface pt-12">
              <div>
                <span className="block text-4xl font-serif text-primary mb-2">15+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Years Expertise</span>
              </div>
              <div>
                <span className="block text-4xl font-serif text-primary mb-2">10k</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Crowns Adorned</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* The Artisans */}
      <section className="border-t border-surface px-6 lg:px-12 py-20 lg:py-32 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-4 block">The Team</span>
            <h2 className="text-4xl md:text-5xl font-serif">Master <span className="italic font-light text-accent">Artisans</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                name: 'Solange A.',
                role: 'Founder & Master Artisan',
                bio: 'The visionary behind La Maison. Specializing in tension-free architectural partings.',
              },
              {
                name: 'Amara J.',
                role: 'Senior Stylist',
                bio: 'An expert in custom design patterns and seamless, undetectable extensions.',
              },
              {
                name: 'Zara W.',
                role: 'Lead Technician',
                bio: 'Focuses entirely on the health, hydration, and foundational care of protective styles.',
              },
            ].map((artisan, i) => (
              <div key={artisan.name} className="group cursor-default text-center md:text-left border-b border-surface md:border-none pb-12 md:pb-0 last:border-none last:pb-0">
                <div className="text-[10px] text-muted mb-6 tracking-[0.2em]">0{i + 1}</div>
                <h3 className="text-2xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">{artisan.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-6">{artisan.role}</p>
                <p className="text-sm font-light text-muted leading-relaxed max-w-sm mx-auto md:mx-0">
                  {artisan.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Standards */}
      <section className="border-t border-surface px-6 lg:px-12 py-20 lg:py-32 bg-dark">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-12 block">The Standard</span>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="text-xl font-serif mb-4 text-primary">Immaculate Hygiene</h4>
              <p className="text-xs font-light text-muted leading-relaxed">Sterile environments, single-use implements, and clinical-grade sanitation between every client.</p>
            </div>
            <div>
              <h4 className="text-xl font-serif mb-4 text-primary">Premium Fibers</h4>
              <p className="text-xs font-light text-muted leading-relaxed">We source only the highest grade, lightweight, and hypoallergenic extensions available globally.</p>
            </div>
            <div>
              <h4 className="text-xl font-serif mb-4 text-primary">Time Respected</h4>
              <p className="text-xs font-light text-muted leading-relaxed">Your time is absolute. We do not double-book. Your appointment is dedicated solely to you.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
