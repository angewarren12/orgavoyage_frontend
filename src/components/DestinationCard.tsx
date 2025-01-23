import { Heart } from "lucide-react";

interface DestinationCardProps {
  image: string;
  title: string;
  price: string;
  duration: string;
}

export const DestinationCard = ({ image, title, price, duration }: DestinationCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
          <Heart className="text-primary" size={20} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-text-primary">{duration}</span>
          <span className="text-accent font-bold">{price}</span>
        </div>
      </div>
    </div>
  );
};