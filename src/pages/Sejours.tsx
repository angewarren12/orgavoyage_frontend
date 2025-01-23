import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";

const sejours = [
  {
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
    title: "Week-end à Rome",
    price: "399€",
    duration: "3 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073",
    title: "Séjour Balnéaire",
    price: "799€",
    duration: "7 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070",
    title: "City Break",
    price: "299€",
    duration: "2 jours",
  },
];

const Sejours = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold text-primary mb-8">Nos Séjours</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sejours.map((sejour, index) => (
            <DestinationCard key={index} {...sejour} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Sejours;