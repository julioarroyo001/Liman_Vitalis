import { useEffect, useState } from 'react';

interface WeatherLayerProps {
  map: google.maps.Map | null;
  username: string;
  password: string;
}

export function WeatherLayer({ map, username, password }: WeatherLayerProps) {
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Función para obtener temperatura de Meteomatics para la ubicación central del mapa
    const fetchTemperature = async () => {
      const center = map.getCenter();
      if (!center) return;

      const lat = center.lat();
      const lon = center.lng();

      // Formato de fecha para la consulta (actual)
      const now = new Date().toISOString().slice(0, 19) + 'Z';

      // URL de la API Meteomatics para temperatura a 2m
      const url = `https://${username}:${password}@api.meteomatics.com/${now}/t_2m:C/${lat},${lon}/json`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error('Error al obtener datos de Meteomatics:', response.statusText);
          return;
        }
        const data = await response.json();

        if (data && data.data && data.data.length > 0) {
          const tempValue = data.data[0].coordinates[0].dates[0].value;

          // Crear marcador con temperatura
          const marker = new google.maps.Marker({
            position: { lat, lng: lon },
            map: map,
            label: {
              text: `${tempValue.toFixed(1)} °C`,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#ff5722',
              fillOpacity: 0.7,
              strokeWeight: 0,
            },
          });

          // Limpiar marcadores anteriores
          markers.forEach(m => m.setMap(null));
          setMarkers([marker]);
        }
      } catch (error) {
        console.error('Error al obtener datos de Meteomatics:', error);
      }
    };

    fetchTemperature();

    // Actualizar cada 10 minutos
    const interval = setInterval(fetchTemperature, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      markers.forEach(m => m.setMap(null));
      setMarkers([]);
    };
  }, [map, username, password]);

  return null;
}
