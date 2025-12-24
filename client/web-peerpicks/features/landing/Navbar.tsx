'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';

interface Props {
  onSearchOpen: () => void;
}

export default function Navbar({ onSearchOpen }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold">
          <span className="text-green-500">Peer</span>Picks
        </div>

        <ul className="hidden items-center gap-8 md:flex">
          <li><a href="#home">Home</a></li>
          <li><a href="#about-us">About Us</a></li>
          <li><a href="#why-us">Why Us?</a></li>
          <li><a href="#top-ratings">Top Ratings</a></li>

          <Link
            href="/login"
            className="rounded-full bg-green-500 px-5 py-2 text-white"
          >
            Rate Now
          </Link>

          <button onClick={onSearchOpen}>
            <Search size={18} />
          </button>
        </ul>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
  );
}
