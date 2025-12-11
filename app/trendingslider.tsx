'use client';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import Image from 'next/image';
import "swiper/css";
import "swiper/css/pagination";

export default function TrendingSlider() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => setTrending(data));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 px-4">Trending Players</h2>
      <Swiper
        modules={[Pagination]}
        slidesPerView={2}
        breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
        }}
        spaceBetween={20}
        className="pb-12"
      >
        {trending.map((player: any) => (
          <SwiperSlide key={player.id}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-zinc-100 dark:border-zinc-700">
                <div className="relative h-48 w-full bg-zinc-100">
                    <Image 
                        src={player.url} 
                        alt={player.player} 
                        fill 
                        className="object-cover object-top" 
                        unoptimized
                    />
                </div>
                <div className="p-3">
                    <p className="font-semibold truncate">{player.player}</p>
                </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}