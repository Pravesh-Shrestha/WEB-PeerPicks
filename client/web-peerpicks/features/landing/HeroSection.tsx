import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      id="home"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-white pt-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl text-center px-6"
      >
        <h1 className="text-5xl font-bold">
          Community-Powered <span className="text-green-500">Ratings</span>
        </h1>
        <p className="mt-6 text-gray-600">
          Discover the best places and services with genuine reviews from real users.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#top-ratings" className="rounded-full bg-green-500 px-6 py-3 text-white">
            Explore Top Picks
          </a>
          <Link href="/login" className="rounded-full border px-6 py-3 text-green-500">
            Share Experience
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
