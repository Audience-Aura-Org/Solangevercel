'use client';

import Button from '@/components/ui/Button';
import { useSiteSettings } from '@/lib/hooks/useSiteSettings';
import ConversationTrigger from '@/components/ui/ConversationTrigger';

export default function ContactPage() {
  const { email, phone, address } = useSiteSettings();

  // Create a clean "display format" for phone if needed
  const displayPhone = phone || '+1.800.555.0199';
  const displayEmail = email || 'concierge@solange.maison';

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FDFBF7] selection:bg-[#C5A059] selection:text-white pt-32 lg:pt-40 pb-20">

      {/* Header */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-20 md:mb-32 text-center md:text-left mt-10 md:mt-0">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] block mb-8">Contact Us</span>
        <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-[1.1] tracking-tight max-w-4xl mx-auto md:mx-0">
          Get In <span className="italic font-light text-[#C5A059]">Touch.</span>
        </h1>
      </section>

      {/* Main Layout */}
      <section className="px-6 lg:px-12 border-t border-[#1A1A1A] py-20 lg:py-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 lg:gap-32">

          {/* Left Column: Direct Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-16">

              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] block mb-4">Salon Safety & Rules</span>
                <p className="text-sm font-light text-gray-200 leading-relaxed max-w-md">
                  Because we have a very busy schedule, we work only by appointment. We cannot take walk-ins at this time. Please contact our team below to book.
                </p>
              </div>

              <div className="space-y-12">
                <div className="group">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-2 transition-colors group-hover:text-[#C5A059]">Email Us</span>
                  <a href={`mailto:${displayEmail}`} className="text-2xl font-serif text-[#FDFBF7] border-b border-transparent hover:border-[#C5A059] transition-all pb-1">
                    {displayEmail}
                  </a>
                </div>

                <div className="group">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-2 transition-colors group-hover:text-[#C5A059]">Call or Text</span>
                  <a href={`tel:${displayPhone.replace(/[^\d+]/g, '')}`} className="text-2xl font-serif text-[#FDFBF7] border-b border-transparent hover:border-[#C5A059] transition-all pb-1 block w-fit">
                    {displayPhone}
                  </a>
                </div>

                {address && (
                  <div className="group">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-2 transition-colors group-hover:text-[#C5A059]">Our Location</span>
                    <span className="text-sm font-serif text-gray-200 max-w-xs block leading-relaxed">
                      {address}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-[#0F0F0F] border border-[#1A1A1A] p-8 md:p-12 h-fit">
            <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full bg-transparent border-b border-[#333] py-2 text-sm text-white focus:border-[#C5A059] focus:outline-none transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full bg-transparent border-b border-[#333] py-2 text-sm text-white focus:border-[#C5A059] focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full bg-transparent border-b border-[#333] py-2 text-sm text-white focus:border-[#C5A059] focus:outline-none transition-colors"
                  placeholder="+1 (---) --- ----"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  How can we help?
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    defaultValue=""
                    className="w-full bg-transparent border-b border-[#333] py-2 text-sm focus:border-[#C5A059] focus:outline-none transition-colors appearance-none text-gray-200"
                  >
                    <option value="" disabled>Select an option...</option>
                    <option value="booking" className="bg-[#111]">Booking Question</option>
                    <option value="consultation" className="bg-[#111]">Style Consultation</option>
                    <option value="other" className="bg-[#111]">Other Question</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="w-full bg-transparent border-b border-[#333] py-2 text-sm text-white focus:border-[#C5A059] focus:outline-none transition-colors resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </div>
            </form>
          </div>

        </div>
      </section>

      <ConversationTrigger
        position="bottom-left"
        style="bubble"
        message="Have questions? Let's chat about your braids."
        buttonText="Chat Now"
      />
    </main>
  );
}
