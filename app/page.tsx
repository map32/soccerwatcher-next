'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Activity, TrendingUp, BarChart3, ArrowRight, Shield, Zap } from 'lucide-react';
import Carousel, { CarouselItem } from './carousel'; // Adjust path

// --- MOCK DATA FOR STATIC FEATURES ---
const FEATURE_IMAGES: CarouselItem[] = [
  { src: '/elo.jpg', alt: 'elo chart', desc: 'Team ELO History & Rankings' },
  { src: '/radar.jpg', alt: 'radar chart', desc: 'Comprehensive Player Radar Analysis' },
  { src: '/heatmap.png', alt: 'heatmap chart', desc: 'Positional Heatmaps & Activity' },
  { src: '/plot.png', alt: 'plot chart', desc: 'Scatter Plot Performance Metrics' }
];

// --- API TYPE ---
interface TrendingPlayer {
  id: string;
  player: string;
  url: string;
  position: string;
}

export default function Home() {
  const router = useRouter();
  const [trendingItems, setTrendingItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Trending Players
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Replace with your actual API URL
        const res = await fetch('/api/trending'); 
        if (!res.ok) throw new Error("Failed to fetch");
        const data: TrendingPlayer[] = await res.json();

        // Transform API data to Carousel Item format
        const items = data.map((p) => ({
          src: p.url,
          alt: p.player,
          desc: p.player,
          onClick: () => {
            // NAVIGATE TO PLAYER PAGE
            // We pass the player name as a query param to trigger the search on the other page
            router.push(`/players?player=${encodeURIComponent(p.player)}&id=${encodeURIComponent(p.id)}&position=${encodeURIComponent(p.position)}`);
          }
        }));

        setTrendingItems(items);
      } catch (error) {
        console.error("Error loading trending:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
           <Image 
             src="/banner.jpg" 
             alt="Soccer Analytics Background" 
             fill 
             className="object-cover"
             priority
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-0" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/20 animate-pulse">
              <Activity size={48} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            THE HUB FOR <br/>
            <span className="text-blue-500">SOCCER STATS</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your ultimate source for insights. Access real-time statistics, 
            performance metrics, and ELO rankings across major leagues.
          </p>

          <button 
            onClick={() => {
              const el = document.getElementById('trending');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto"
          >
            Explore Trending
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION / FEATURES */}
      <section className="relative bg-slate-900">
        <div className="relative w-full mx-auto px-4 py-64">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Image 
              src="/analyst.png" 
              alt="Soccer Analytics Background" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto bg-slate-700">
            <div className="flex flex-col items-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl mb-4 text-blue-600 dark:text-blue-400">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Deep Data</h3>
              <p className="text-slate-100">Comprehensive historical data and granular match statistics.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl mb-4 text-green-600 dark:text-green-400">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Team ELO</h3>
              <p className="text-slate-100">Track team strength evolution with our proprietary ELO system.</p>
            </div>
            <div className="flex flex-col items-center p-6">
               <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl mb-4 text-purple-600 dark:text-purple-400">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time</h3>
              <p className="text-slate-100">Up-to-the-minute updates on trending players and match events.</p>
            </div>
          </div>
        </div>
      </section>
      <section>
        {/* Static Feature Carousel */}
          <Carousel 
            items={FEATURE_IMAGES} 
            title="Visual Analytics" 
            subtitle="Explore the different ways we visualize the beautiful game."
          />
      </section>

      {/* 3. TRENDING PLAYERS SECTION */}
      <section id="trending" className="py-24 bg-white dark:bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="text-red-500" size={28} />
            <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest">Hot Right Now</h2>
          </div>
          
          {loading ? (
             <div className="h-96 flex flex-col items-center justify-center opacity-50">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
               <p>Scouting trending players...</p>
             </div>
          ) : (
            <Carousel 
              items={trendingItems} 
              title="Trending Players" 
              subtitle="The most searched and analyzed players this week. Click to view full stats."
            />
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
           <Activity className="text-blue-500" />
           <span className="font-bold text-white text-xl">SoccerWatcher</span>
        </div>
        <p>© 2025 SoccerWatcher Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
}