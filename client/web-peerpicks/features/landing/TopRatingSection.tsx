import Image from 'next/image';
import { Star } from 'lucide-react';

export default function TopRatingsSection() {
  return (
    <section id="top-ratings" className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-center">Top Rated Places</h2>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {['Garden Kitchen', 'Genesis Cafe', 'Books Mandala'].map((name) => (
            <div key={name} className="rounded-xl border shadow hover:-translate-y-2 transition">
              <Image src="/placeholder.jpg" alt={name} width={400} height={250} />
              <div className="p-4">
                <h3 className="font-semibold">{name}</h3>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
