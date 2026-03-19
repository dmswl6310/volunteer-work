'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const slides = [
  { id: 1, src: '/images/promo1.png', alt: '함께하는 가치, 봉사활동 모집' },
  { id: 2, src: '/images/promo2.png', alt: '세상을 바꾸는 작은 실천' },
  { id: 3, src: '/images/promo3.png', alt: '따뜻한 마음을 나눕니다' },
];

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    
    if (distance > minSwipeDistance) {
      setCurrent((prev) => (prev + 1) % slides.length);
    } else if (distance < -minSwipeDistance) {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }
    
    touchStartX.current = null;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="relative w-full h-32 sm:h-40 bg-gray-100 rounded-xl overflow-hidden shadow-sm"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* 닷 인디케이터 (하단 중앙) */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={(e) => {
              e.preventDefault();
              setCurrent(index);
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
