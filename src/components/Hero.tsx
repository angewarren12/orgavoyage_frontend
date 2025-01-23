import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const destinations = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070",
    title: "Paris",
    description: "Découvrez la ville lumière",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2039",
    title: "Tokyo",
    description: "Immergez-vous dans la culture japonaise",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
    title: "Dubai",
    description: "Le luxe au coeur du désert",
  },
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setDirection("right");
    setCurrentSlide((prev) => (prev + 1) % destinations.length);
  };

  const prevSlide = () => {
    setDirection("left");
    setCurrentSlide((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  return (
    <div className="relative h-[600px] mt-20 overflow-hidden">
      {destinations.map((destination, index) => (
        <div
          key={destination.id}
          className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translateX(${(index - currentSlide) * 100}%)`,
          }}
        >
          <img
            src={destination.image}
            alt={destination.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="container mx-auto h-full flex items-center px-4">
              <div className="text-white">
                <h1 className="text-5xl font-bold mb-4">{destination.title}</h1>
                <p className="text-xl">{destination.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
      >
        <ChevronLeft className="text-primary" size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
      >
        <ChevronRight className="text-primary" size={24} />
      </button>
    </div>
  );
};