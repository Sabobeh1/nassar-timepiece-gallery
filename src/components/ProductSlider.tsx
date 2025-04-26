
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  image_urls: string[];
}

export const ProductSlider = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Auto-play functionality
  useEffect(() => {
    if (emblaApi) {
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 2000);

      return () => clearInterval(autoplay);
    }
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Fetch products from Supabase
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["sliderProducts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_urls")
        .not("image_urls", "eq", "{}");

      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading || products.length === 0) {
    return null;
  }

  const handleProductClick = (productId: string) => {
    navigate(`/watch/${productId}`);
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-12">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="m-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image_urls[0] || "/placeholder-watch.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-watch.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-playfair font-bold text-white">
                      {product.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
        onClick={scrollPrev}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
        onClick={scrollNext}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    </div>
  );
};
