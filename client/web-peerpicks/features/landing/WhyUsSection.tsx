import { Users, ShieldCheck, MapPin, Filter, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyUsSection() {
  const features = [
    { icon: Users, title: 'Authentic Reviews' },
    { icon: ShieldCheck, title: 'Transparent Ratings' },
    { icon: MapPin, title: 'Local Focus' },
    { icon: Filter, title: 'Personalized Picks' },
    { icon: MessageSquare, title: 'Detailed Feedback' },
  ];

  return (
    <section id="why-us" className="bg-gray-50 py-24 px-6">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-bold">Why Choose PeerPicks?</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title }) => (
            <motion.div
              key={title}
              whileHover={{ y: -8 }}
              className="rounded-xl bg-white p-6 shadow"
            >
              <Icon className="mx-auto text-green-500" size={32} />
              <h3 className="mt-4 font-semibold">{title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
