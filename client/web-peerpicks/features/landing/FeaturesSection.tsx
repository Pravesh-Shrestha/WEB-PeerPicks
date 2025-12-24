"use client";

import { motion } from "framer-motion";

const features = [
  { title: "Authentic Reviews", desc: "Real feedback from real users." },
  { title: "Transparent System", desc: "Clear rating logic with no bias." },
  { title: "Community Powered", desc: "Driven by shared experiences." },
  { title: "Local Focus", desc: "Find trusted places near you." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold">
          Why Choose PeerPicks?
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="mb-2 text-lg font-semibold">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
