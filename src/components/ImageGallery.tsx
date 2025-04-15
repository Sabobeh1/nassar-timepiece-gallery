
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

const ImageGallery = ({ images, altText }: ImageGalleryProps) => {
  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleThumbnailClick = (image: string, index: number) => {
    setMainImage(image);
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
    setMainImage(images[newIndex]);
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
    setMainImage(images[newIndex]);
    setSelectedIndex(newIndex);
  };

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden mb-4 border border-gray-200 rounded-md bg-white">
        <img 
          src={mainImage} 
          alt={altText} 
          className="w-full h-full object-contain"
        />
        
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-luxury-charcoal hover:bg-white transition shadow"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-luxury-charcoal hover:bg-white transition shadow"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(image, index)}
            className={`relative flex-shrink-0 w-16 h-16 border rounded-md overflow-hidden
              ${selectedIndex === index 
                ? "border-gold ring-1 ring-gold" 
                : "border-gray-200 hover:border-gray-300"}`}
          >
            <img 
              src={image} 
              alt={`${altText} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
