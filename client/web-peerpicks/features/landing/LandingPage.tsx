"use client";
import React, { useState, useEffect, FC } from 'react';
import Image from 'next/image';
import logo1 from '../../public/logo1.png';

interface RatingPlace {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
}

const TOP_PLACES: RatingPlace[] = [
  {
    id: 1,
    name: "Garden Kitchen",
    category: "Restaurant",
    image: "https://noshnepal.s3.ap-southeast-1.amazonaws.com/7114efa7-e44d-45d5-836d-2a123f9a4c02image",
    rating: 4.5,
    reviews: 243,
    description: "Farm-to-table dining experience focusing on organic local produce and seasonal flavors."
  },
  {
    id: 2,
    name: "Genesis Cafe",
    category: "Cafe",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
    rating: 5.0,
    reviews: 187,
    description: "Specialty coffee roasters with a minimalist aesthetic, perfect for deep work and meetings."
  },
  {
    id: 3,
    name: "Books Mandala",
    category: "Bookstore",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2180&auto=format&fit=crop",
    rating: 5.0,
    reviews: 156,
    description: "A cultural hub offering a curated selection of literature and regular community events."
  }
];

const Home: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-secondary selection:text-black">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed w-full z-[100] transition-all duration-500 px-6 py-4 ${
          isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black italic tracking-tighter">
            PEER<span className="text-secondary">PICKS</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'About Us', 'Why Us?', 'Top Ratings'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-').replace('?', '')}`} 
                 className="text-[10px] uppercase font-bold tracking-[0.2em] hover:text-secondary transition-colors">
                {item}
              </a>
            ))}
            <a href="/signup" className="bg-secondary text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
              Join Community
            </a>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent opacity-30"></div>
        <div className="relative z-10 text-center px-6 animate-fade-in-up">
          <span className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Bringing To You</span>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-8">
          THE FUTURE OF <br/> <span className="text-secondary italic">REVIEWS.</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg mb-10 leading-relaxed">
          Discover the best places and services with genuine reviews from real users. 
            Make informed decisions based on community experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#top-ratings" className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-secondary transition-all">Explore Rankings</a>
            <a href="/signup" className="border border-white/20 px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">Write a Review</a>
          </div>
        </div>
      </section>

      {/* --- ABOUT US: STATS & VISION --- */}
      <section id="about-us" className="py-32 bg-white text-black rounded-t-[50px] relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">REAL STORIES. <br/>ZERO NOISE.</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                PeerPicks was founded on a simple realization: algorithmic reviews are broken. We have built a decentralized ecosystem where community consensus outweighs corporate sponsorship.
              </p>
              <div className="flex gap-12 pt-4">
                <div>
                  <div className="text-4xl font-black border-b-4 border-secondary inline-block">24k+</div>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-gray-400">Verified Reviews</p>
                </div>
                <div>
                  <div className="text-4xl font-black border-b-4 border-secondary inline-block">1.2k</div>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-gray-400">Trusted Places</p>
                </div>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="absolute -inset-4 bg-secondary/30 rounded-[2rem] rotate-3 -z-10"></div>
              <Image src={logo1} alt="Vision" className="rounded-[2rem]  hover:grayscale-0 transition-all duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY US: BENTO GRID --- */}
      <section id="why-us" className="py-32 bg-gray-50 text-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-black tracking-tighter">WHY WE ARE DIFFERENT ?</h2>
            <div className="w-20 h-2 bg-secondary mt-2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Feature */}
            <div className="md:col-span-2 bg-black text-white p-12 rounded-[2.5rem] flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10">
                <i className="fas fa-shield-check text-4xl text-secondary mb-8"></i>
                <h3 className="text-4xl font-black mb-4">Integrity-First <br/> Algorithm</h3>
                <p className="text-gray-400 max-w-sm">We use behavioral analysis to strip away fake ratings and paid promotions, leaving you with only the raw truth.</p>
              </div>
              <i className="fas fa-fingerprint absolute right-[-5%] bottom-[-10%] text-[200px] text-white/5 group-hover:text-secondary/5 transition-colors"></i>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 p-10 rounded-[2.5rem] hover:shadow-xl transition-shadow">
              <i className="fas fa-map-marked-alt text-3xl mb-6"></i>
              <h3 className="text-xl font-black mb-2">Hyper-Local</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Focused on neighborhood nuances that global platforms miss. We know the (secret menu) spots.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 p-10 rounded-[2.5rem] hover:shadow-xl transition-shadow">
              <i className="fas fa-users-crown text-3xl mb-6"></i>
              <h3 className="text-xl font-black mb-2">Peer Rewards</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Top contributors earn badges and exclusive discounts at top-rated local establishments.</p>
            </div>

            {/* CTA Bento */}
            <div className="md:col-span-2 bg-secondary p-10 rounded-[2.5rem] flex items-center justify-between group">
              <div>
                <h3 className="text-3xl font-black italic uppercase">Start Influencing</h3>
                <p className="font-bold text-xs tracking-widest uppercase opacity-60">Help your community grow</p>
              </div>
              <a href="/signup" className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-plus"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- TOP RATINGS --- */}
      <section id="top-ratings" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <h2 className="text-5xl font-black tracking-tighter text-black">HALL OF FAME</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">Current highest rated experiences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {TOP_PLACES.map((place) => (
              <div key={place.id} className="group cursor-pointer">
                <div className="relative h-[400px] w-full overflow-hidden rounded-[2rem] mb-6 shadow-2xl">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <button className="bg-secondary text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">View Details</button>
                  </div>
                  <div className="absolute top-6 left-6 bg-white text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {place.category}
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-2xl font-black text-black tracking-tight">{place.name}</h3>
                  <div className="text-secondary bg-black px-3 py-1 rounded-lg font-black text-sm">★ {place.rating}</div>
                </div>
                <p className="text-gray-500 text-sm mt-2 px-2 leading-relaxed">{place.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MEGA FOOTER --- */}
      <footer className="bg-black pt-24 pb-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="space-y-6">
              <div className="text-3xl font-black italic tracking-tighter">PEER<span className="text-secondary">PICKS</span></div>
              <p className="text-gray-500 text-sm leading-relaxed">
                The most trusted peer-to-peer rating platform. Empowering local decisions through collective wisdom.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-black transition-all">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-black transition-all">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-8">Navigation</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-bold uppercase">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#about-us" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#why-us" className="hover:text-white transition-colors">Integrity</a></li>
                <li><a href="#top-ratings" className="hover:text-white transition-colors">Picks</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-8">Contact</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-bold">
                <li className="flex items-center gap-3"><i className="fas fa-envelope text-secondary"></i> info@peerpicks.com</li>
                <li className="flex items-center gap-3"><i className="fas fa-phone text-secondary"></i> +977 9824120601</li>
                <li className="flex items-center gap-3"><i className="fas fa-map-marker-alt text-secondary"></i> Pokhara, Nepal</li>
              </ul>
            </div>

            <div>
              <h4 className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-8">Newsletter</h4>
              <div className="flex border-b border-white/20 pb-2">
                <input type="email" placeholder="JOIN THE CIRCLE" className="bg-transparent text-[10px] font-bold outline-none flex-grow" />
                <button className="text-secondary hover:translate-x-1 transition-transform"><i className="fas fa-arrow-right"></i></button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} PeerPicks Global Ecosystem.
            </p>
            <div className="flex gap-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;