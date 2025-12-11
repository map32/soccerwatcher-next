'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

export interface CarouselItem {
  src: string;
  alt: string;
  desc: string;
  // Optional: Pass an ID or unique key if needed for logic
  id?: string;
  onClick?: () => void;
}

interface CarouselProps {
  items: CarouselItem[];
  title?: string;
  subtitle?: string;
}

const Carousel = ({ items, title, subtitle }: CarouselProps) => {
  return (
    <div className="w-full flex flex-col justify-center items-center relative py-10">
      
      {/* Header Section within Carousel */}
      {(title || subtitle) && (
        <div className="text-center mb-8 px-4">
          {title && <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">{title}</h2>}
          {subtitle && <p className="text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}

      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow]}
        slidesPerView={'auto'}
        centeredSlides={true}
        loop={true}
        spaceBetween={30}
        navigation={true}
        pagination={{ clickable: true, dynamicBullets: true }}
        effect={'coverflow'}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          scale: 0.9, // Slight scaling effect for depth
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        className="w-full max-w-5xl !pb-14" // Padding bottom for pagination bullets
      >
        {items.map((item, index) => (
          // Fixed width for slides to ensure coverflow looks right
          <SwiperSlide key={index} className="!w-[300px] md:!w-[400px]">
            <div 
              onClick={item.onClick}
              className={`
                flex flex-col gap-4 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-slate-100 dark:border-zinc-800
                transition-transform duration-300 hover:shadow-2xl
                ${item.onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
              `}
            >
              <div className="relative w-full aspect-square bg-slate-100">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized
                />
              </div>
              <div className="p-4 text-center">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                  {item.desc}
                </p>
                {item.onClick && (
                  <p className="text-xs text-blue-500 font-medium mt-1 uppercase tracking-wider">
                    View Analysis
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;