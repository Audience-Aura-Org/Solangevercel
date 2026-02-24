'use client';

const testimonials = [
  {
    name: 'Amara J.',
    role: 'Editorial Model',
    content:
      'The attention to detail and absolute luxury of the studio is unmatched. I walk out feeling flawless every single time.',
  },
  {
    name: 'Zara W.',
    role: 'Creative Director',
    content:
      'The aesthetic of the salon is stunning, making you feel instantly relaxed. The braids are precise, painless, and perfect.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-20 px-6 lg:px-12 bg-dark-surface border-y border-surface">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-12 font-medium">The Muses</span>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 w-full text-center md:text-left">
          {testimonials.map((t, index) => (
            <div key={index} className="flex flex-col items-center md:items-start max-w-md mx-auto">
              <span className="text-5xl font-serif text-primary leading-none mb-6">"</span>
              <p className="text-xl md:text-2xl font-serif text-primary italic font-light leading-relaxed mb-10 text-center md:text-left">
                {t.content}
              </p>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-1">{t.name}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{t.role}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
