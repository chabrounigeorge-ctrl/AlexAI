
import React, { useState, useEffect, useCallback } from 'react';
import { Recommendation } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ProductCarouselProps {
  recommendations: Recommendation[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ recommendations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  }, [recommendations.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + recommendations.length) % recommendations.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);
  
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto relative h-[450px]">
      <div className="relative h-full overflow-hidden">
        {recommendations.map((rec, index) => {
          const isFirstRec = index === 0;
          return (
            <div
              key={rec.name}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8">
                <div className="w-full md:w-1/2 flex justify-center">
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-auto h-80 md:h-96 object-contain rounded-lg shadow-2xl shadow-yellow-900/20"
                  />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-yellow-400 mb-4">{rec.name}</h2>
                  <p className="text-lg md:text-xl text-gray-300">
                    {index === 0 ? rec.description : rec.brief}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={prevSlide} className="absolute top-1/2 left-0 md:-left-12 transform -translate-y-1/2 text-gray-500 hover:text-white transition p-2">
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-0 md:-right-12 transform -translate-y-1/2 text-gray-500 hover:text-white transition p-2">
        <ChevronRightIcon className="w-8 h-8" />
      </button>

       <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {recommendations.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentIndex === index ? 'bg-yellow-500' : 'bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
