import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FlightSearch } from "@/components/FlightSearch";

const Vols = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold text-primary mb-8">Réservation de Vols</h1>
        <div className="max-w-6xl mx-auto">
          <FlightSearch />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Vols;