'use client';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectCoverflow } from 'swiper/modules';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const images = [
  { src: '/elo.jpg', alt: 'elo chart', desc: 'History chart of soccer teams by their ELO' },
  { src: '/radar.jpg', alt: 'radar chart', desc: `Radar chart of a player's statistics` },
  { src: '/heatmap.png', alt: 'heatmap chart', desc: 'Heatmap of a player in the field' },
  { src: '/plot.png', alt: 'plot chart', desc: 'Scatter plot of player statistics' }
]

const Carousel = () => 
    <div className="w-full flex flex-col justify-center items-center relative">
        <p className="top-4 text-[1.2vw]">From player performance metrics to match outcomes and team strategies, SoccerWatcher has it all.</p>
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow]}
        
        // FIX 1: Change this from 3 to 'auto'
        slidesPerView={'auto'}
        
        centeredSlides={true}
        loop={true}
        spaceBetween={30}
        navigation={true}
        
        effect={'coverflow'}
        coverflowEffect={{
            rotate: 0, // Set to 0 to see if rotation is causing issues, then increase
            stretch: 0,
            scale: 1,
            depth: 300,
            modifier: 2.5,
            slideShadows: false,
        }}
        className="w-full max-w-4xl" // FIX 2: Constrain the Swiper container width
      >
        {images.map(({src, alt, desc}, index) => (
          // FIX 3: Give the SwiperSlide an explicit CSS width
          <SwiperSlide key={index} className='!w-[55%]'> 
                <div className='flex flex-col gap-4'>
                    <Image 
                        src={src} 
                        alt={alt}
                        width={900}
                        height={900}
                        className="w-full object-cover !aspect-square"
                        style={{aspectRatio: 1, height: 'auto'}}
                    />
                    <p className='text-center'>{desc}</p>
                </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>

export default Carousel;