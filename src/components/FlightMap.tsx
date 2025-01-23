import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { airportLocationService } from '@/services/airportLocationService';

interface FlightMapProps {
  segments: Array<{
    departure: {
      iataCode: string;
      at: string;
    };
    arrival: {
      iataCode: string;
      at: string;
    };
  }>;
  className?: string;
}

const planeIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wbGFuZSI+PHBhdGggZD0iTTE3LjggNDE5LjFjLS4yLTMuMi0xLjItNS43LTIuNC01LjdzLTIuMiAyLjUtMi40IDUuN2wtNS4yLTIuOXY2LjZsNy42IDMuNiA3LjYtMy42di02LjZsLTUuMiAyLjl6Ii8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const FlightMap: React.FC<FlightMapProps> = ({ segments, className = 'h-96' }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [airportLocations, setAirportLocations] = useState<Map<string, { latitude: number; longitude: number }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAirportLocations = async () => {
      const iataCodes = segments.flatMap(segment => [
        segment.departure.iataCode,
        segment.arrival.iataCode
      ]);

      const uniqueIataCodes = Array.from(new Set(iataCodes));
      const locations = await airportLocationService.getMultipleAirportLocations(uniqueIataCodes);
      
      const coordinates = new Map<string, { latitude: number; longitude: number }>();
      locations.forEach((location, code) => {
        coordinates.set(code, {
          latitude: location.latitude,
          longitude: location.longitude
        });
      });

      setAirportLocations(coordinates);
      setIsLoading(false);
    };

    loadAirportLocations();
  }, [segments]);

  useEffect(() => {
    if (!mapContainerRef.current || isLoading) return;

    // Initialiser la carte
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const layerGroup = L.layerGroup().addTo(map);
    const bounds = L.latLngBounds([]);

    segments.forEach(segment => {
      const depLocation = airportLocations.get(segment.departure.iataCode);
      const arrLocation = airportLocations.get(segment.arrival.iataCode);

      if (depLocation && arrLocation) {
        const depCoords: L.LatLngExpression = [depLocation.latitude, depLocation.longitude];
        const arrCoords: L.LatLngExpression = [arrLocation.latitude, arrLocation.longitude];

        // Étendre les limites pour inclure ces points
        bounds.extend(depCoords);
        bounds.extend(arrCoords);

        // Ajouter les marqueurs
        L.marker(depCoords, { icon: planeIcon })
          .bindPopup(`
            <div class="p-2">
              <div class="font-bold">${segment.departure.iataCode}</div>
              <div class="text-sm">Départ: ${new Date(segment.departure.at).toLocaleString('fr-FR')}</div>
            </div>
          `)
          .addTo(layerGroup);

        L.marker(arrCoords, { icon: planeIcon })
          .bindPopup(`
            <div class="p-2">
              <div class="font-bold">${segment.arrival.iataCode}</div>
              <div class="text-sm">Arrivée: ${new Date(segment.arrival.at).toLocaleString('fr-FR')}</div>
            </div>
          `)
          .addTo(layerGroup);

        // Tracer la ligne
        const path = L.polyline([depCoords, arrCoords], {
          color: '#2563eb',
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 10'
        }).addTo(layerGroup);

        // Calculer le point médian et l'angle
        const midLat = (depLocation.latitude + arrLocation.latitude) / 2;
        const midLng = (depLocation.longitude + arrLocation.longitude) / 2;
        const angle = Math.atan2(
          arrLocation.longitude - depLocation.longitude,
          arrLocation.latitude - depLocation.latitude
        ) * (180 / Math.PI);

        // Ajouter le marqueur d'avion au milieu
        L.marker([midLat, midLng], {
          icon: L.divIcon({
            html: `<div style="transform: rotate(${angle}deg)">✈️</div>`,
            className: 'flight-direction-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(layerGroup);
      }
    });

    // Ajuster la vue si nous avons des points
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      layerGroup.clearLayers();
    };
  }, [segments, airportLocations, isLoading]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
    </div>
  );
};
