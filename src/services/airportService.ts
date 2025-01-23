import { airports, Airport } from "@/data/airports";

export function findAirportCode(query: string): string | null {
  // Recherche insensible à la casse
  const normalizedQuery = query.toLowerCase().trim();

  // Chercher par code IATA
  const byCode = airports.find(airport => 
    airport.code.toLowerCase() === normalizedQuery
  );
  if (byCode) return byCode.code;

  // Chercher par nom de ville
  const byCity = airports.find(airport => 
    airport.city.toLowerCase() === normalizedQuery
  );
  if (byCity) return byCity.code;

  // Chercher par nom complet de l'aéroport
  const byName = airports.find(airport => 
    airport.name.toLowerCase() === normalizedQuery
  );
  if (byName) return byName.code;

  // Recherche partielle si aucune correspondance exacte
  const partialMatches = airports.filter(airport => 
    airport.city.toLowerCase().includes(normalizedQuery) ||
    airport.name.toLowerCase().includes(normalizedQuery)
  );

  // Si des correspondances partielles existent, retourner le premier code
  if (partialMatches.length > 0) {
    console.warn(`Correspondance partielle trouvée pour ${query}:`, 
      partialMatches.map(a => `${a.city} (${a.code})`));
    return partialMatches[0].code;
  }

  // Aucun aéroport trouvé
  console.warn(`Aucun code d'aéroport trouvé pour ${query}`);
  return null;
}

export function listAirportSuggestions(query: string): Airport[] {
  const normalizedQuery = query.toLowerCase().trim();

  return airports.filter(airport => 
    airport.code.toLowerCase().includes(normalizedQuery) ||
    airport.city.toLowerCase().includes(normalizedQuery) ||
    airport.name.toLowerCase().includes(normalizedQuery)
  );
}
