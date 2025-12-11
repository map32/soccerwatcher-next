'use client';

import React from 'react';
import { Activity, Users, TrendingUp, Mail, User } from 'lucide-react';

// --- Placeholder Image URLs ---
// I will provide the prompts to generate these below.
const HERO_BG_IMAGE = "/background.png"; // A wide stadium shot with data overlay
const FANS_IMAGE = "/fans.png";      // Fans celebrating in stands
const ANALYSTS_IMAGE = "/analyst.png";  // Close up of tactical screen/data

export default function AboutPage() {
  return (
    // Main Container with Hero Background Image
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- Background Image & Overlay Effects --- */}
      <div className="absolute inset-0 z-0">
        {/* Replace src with your generated HERO_BG_IMAGE */}
        <img 
          src={HERO_BG_IMAGE} 
          alt="Stadium Background" 
          className="w-full h-full object-cover scale-105 blur-sm brightness-[0.6]"
        />
        {/* A deep blue/indigo gradient overlay to ensure text readability and set the mood */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-950/80 to-slate-900/90 mix-blend-multiply"></div>
      </div>

      {/* --- Main Content "Glass" Card --- */}
      <div className="relative z-10 max-w-4xl w-full bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20 text-center">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex justify-center mb-4">
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
            About SoccerWatcher
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
            Your premier destination for data-driven football insights. We aggregate statistical performance metrics from the <span className="font-semibold text-blue-700">top 5 European leagues</span> to provide fans, analysts, and scouts with a transparent view of the beautiful game.
          </p>
        </div>

        {/* --- Feature Grid with Image Cards --- */}
        <div className="grid md:grid-cols-2 gap-6 text-left mt-12 mb-12">
           
           {/* Card 1: For Fans */}
           <FeatureCard 
             title="For Fans"
             description="Settle debates with hard data and visualize how your favorite players compare against the world's best."
             imageSrc={FANS_IMAGE}
             icon={<Users className="w-6 h-6 text-white" />}
             colorFrom="from-blue-600"
             colorTo="to-blue-900"
           />

           {/* Card 2: For Analysts */}
           <FeatureCard 
             title="For Analysts"
             description="Track long-term ELO trends, identify tactical shifts, and uncover hidden gems with our deep scouting tools."
             imageSrc={ANALYSTS_IMAGE}
             icon={<TrendingUp className="w-6 h-6 text-white" />}
             colorFrom="from-indigo-600"
             colorTo="to-indigo-900"
           />
        </div>

        {/* Footer/Contact Section */}
        <div className="border-t border-slate-200 pt-8 flex flex-col items-center text-slate-500 text-sm font-medium">
          <p className="mb-2">Created by</p>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-base text-slate-700 font-semibold">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Minwoo Dong</span>
            </div>
            <div className="hidden md:block text-slate-300">•</div>
            <a href="mailto:dongminwoo7@gmail.com" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>dongminwoo7@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}


// --- Helper Component for the Feature Cards ---
interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc: string;
  icon: React.ReactNode;
  colorFrom: string;
  colorTo: string;
}

function FeatureCard({ title, description, imageSrc, icon, colorFrom, colorTo }: FeatureCardProps) {
  return (
    <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Background Image */}
      <img 
        src={imageSrc} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Gradient Overlay (makes text readable) */}
      <div className={`absolute inset-0 bg-gradient-to-t ${colorFrom} ${colorTo} opacity-80 md:opacity-70 group-hover:opacity-90 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
        <div className="mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg w-fit">
          {icon}
        </div>
        <h3 className="font-bold text-2xl mb-2">{title}</h3>
        <p className="text-sm text-white/90 leading-snug">{description}</p>
      </div>
    </div>
  );
}