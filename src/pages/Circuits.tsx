import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";

const circuits = [
  {
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070",
    title: "Tour d'Europe",
    price: "1499€",
    duration: "10 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=2070",
    title: "Découverte des Balkans",
    price: "1299€",
    duration: "8 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1504512485720-7d83a16ee930?q=80&w=2004",
    title: "Route des Vins",
    price: "899€",
    duration: "5 jours",
  },
];

const Circuits = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold text-primary mb-8">Nos Circuits</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circuits.map((circuit, index) => (
            <DestinationCard key={index} {...circuit} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Circuits;