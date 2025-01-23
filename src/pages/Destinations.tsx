import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";

const destinations = [
  {
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020",
    title: "Paris, France",
    price: "499€",
    duration: "3 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2066",
    title: "Venise, Italie",
    price: "599€",
    duration: "4 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?q=80&w=2070",
    title: "Barcelone, Espagne",
    price: "449€",
    duration: "3 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=2070",
    title: "Amsterdam, Pays-Bas",
    price: "399€",
    duration: "3 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070",
    title: "Londres, UK",
    price: "549€",
    duration: "4 jours",
  },
  {
    image: "https://images.unsplash.com/photo-1542820229-081e0c12af0b?q=80&w=2070",
    title: "Prague, Rép. Tchèque",
    price: "449€",
    duration: "3 jours",
  },
];

const Destinations = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold text-primary mb-8">Nos Destinations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <DestinationCard key={index} {...destination} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Destinations;