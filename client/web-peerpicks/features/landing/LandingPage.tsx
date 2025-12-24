'use client';

import Navbar from './Navbar';
import SearchModal from './SearchModal';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import WhyUsSection from './WhyUsSection';
import TopRatingsSection from './TopRatingSection';
import Footer from './Footer';
import { useState } from 'react';

export default function LandingPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <HeroSection />
      <AboutSection />
      <WhyUsSection />
      <TopRatingsSection />
      <Footer />
    </>
  );
}
