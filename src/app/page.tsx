import { connectToDatabase } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';
import HeroVideo from '@/components/sections/HeroVideo';
import ServicesSection from '@/components/sections/ServicesSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import GallerySection from '@/components/sections/GallerySection';
import CTASection from '@/components/sections/CTASection';
import ConversationTrigger from '@/components/ui/ConversationTrigger';

const FALLBACK_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-woman-with-beautiful-braided-hair-41712-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-with-long-braids-posing-41706-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-combing-hair-of-a-woman-in-a-salon-4048-large.mp4',
];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1595476108018-0e817c1bf194?auto=format&fit=crop&q=80&w=2000';

async function getSiteSettings() {
  try {
    await connectToDatabase();
    const settings = await AdminSettings.findOne().lean();
    return settings as any;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic'; // always re-fetch on each request

export default async function Home() {
  const settings = await getSiteSettings();

  // Extract media library values
  const media: Array<{ id: string; label: string; url: string; type: string }> = settings?.media || [];
  const videoMedia = media.filter((m: any) => m.type === 'video' && m.url);
  const imageMedia = media.filter((m: any) => m.type === 'image' && m.url);

  const videos = videoMedia.length > 0 ? videoMedia.map((m: any) => m.url) : FALLBACK_VIDEOS;
  const fallbackImage = imageMedia[0]?.url || FALLBACK_IMAGE;
  const heroTitle = settings?.heroTitle || 'Beautiful Hair Braiding';
  const heroSubtitle = settings?.heroSubtitle || 'Expert hair braiding services. We also offer home visits!';
  const services = settings?.services || [];

  return (
    <div>
      <HeroVideo
        title={heroTitle}
        subtitle={heroSubtitle}
        videos={videos}
        fallbackImage={fallbackImage}
        ctaText="Book Now"
        ctaLink="/booking"
      />
      <ServicesSection services={services} />
      <ExperienceSection />
      <TestimonialsSection />
      <GallerySection />
      <CTASection />
      <ConversationTrigger
        position="bottom-right"
        style="bubble"
        message="Want new braids? Let's book your appointment!"
        buttonText="Book Now"
      />
    </div>
  );
}
