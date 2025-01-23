import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">OrgaVoyages</h3>
            <p className="text-sm opacity-80">
              Votre partenaire de confiance pour des voyages inoubliables depuis 2024.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Destinations</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Europe</li>
              <li>Asie</li>
              <li>Amérique</li>
              <li>Afrique</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Vols</li>
              <li>Hôtels</li>
              <li>Circuits</li>
              <li>Activités</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>contact@orgavoyages.com</li>
              <li>+33 1 23 45 67 89</li>
              <li>Paris, France</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <Facebook size={20} className="opacity-80 hover:opacity-100 cursor-pointer" />
              <Twitter size={20} className="opacity-80 hover:opacity-100 cursor-pointer" />
              <Instagram size={20} className="opacity-80 hover:opacity-100 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2024 OrgaVoyages. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};