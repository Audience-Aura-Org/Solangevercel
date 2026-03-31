'use client';

const testimonials = [
  {
    name: 'Amara J.',
    role: 'Customer',
    content:
      'The attention to detail and friendly atmosphere of the salon is unmatched. I walk out feeling beautiful every single time.',
  },
  {
    name: 'Zara W.',
    role: 'Regular Client',
    content:
      'The look of the salon is lovely, and it\'s a very nice place to be. My braids are always neat, painless, and perfect.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-20 px-6 lg:px-12 bg-dark-surface border-y border-surface">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-12 font-bold">What People Say</span>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 w-full text-center md:text-left text-white">
          {testimonials.map((t, index) => (
            <div key={index} className="flex flex-col items-center md:items-start max-w-md mx-auto">
              <span className="text-5xl font-serif text-accent leading-none mb-6">"</span>
              <p className="text-xl md:text-2xl font-serif text-white italic font-light leading-relaxed mb-10 text-center md:text-left">
                {t.content}
              </p>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">{t.name}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-200">{t.role}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
