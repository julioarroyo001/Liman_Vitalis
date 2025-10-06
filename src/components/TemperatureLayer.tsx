import React, { useEffect, useRef, useState } from "react";

interface TemperatureLayerMapProps {
  googleMapsApiKey: string;
  weatherApiKey: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  map: google.maps.Map | null;
}

const layerOptions = [
  { id: "temp_new", name: "Temperatura" },
  { id: "clouds_new", name: "Nubes" },
  { id: "precipitation_new", name: "Precipitación" },
  { id: "pressure_new", name: "Presión" },
  { id: "wind_new", name: "Viento" },
];

const TemperatureLayerMap: React.FC<TemperatureLayerMapProps> = ({
  googleMapsApiKey,
  weatherApiKey,
  center = { lat: -12.0464, lng: -77.0428 }, // Lima
  zoom = 6,
  map,
}) => {
  const selectedLayer = "temp_new";
  const weatherLayerRef = useRef<google.maps.ImageMapType | null>(null);

  // Load Google Maps script if needed (only if map is null)
  useEffect(() => {
    if (!map) return;

    // Add initial weather layer
    addWeatherLayer(selectedLayer);

    // Cleanup on unmount
    return () => {
      if (map && weatherLayerRef.current) {
        map.overlayMapTypes.clear();
        weatherLayerRef.current = null;
      }
    };
  }, [map]);

  // No need for effect on selectedLayer since it's fixed

  const addWeatherLayer = (layerType: string) => {
    if (!map) return;

    // Clear previous layer
    map.overlayMapTypes.clear();

    const weatherLayer = new google.maps.ImageMapType({
      getTileUrl: function (coord, zoom) {
        return `https://tile.openweathermap.org/map/${layerType}/${zoom}/${coord.x}/${coord.y}.png?appid=${weatherApiKey}`;
      },
      tileSize: new google.maps.Size(256, 256),
      opacity: 0.6,
      name: layerType,
    });

    map.overlayMapTypes.push(weatherLayer);
    weatherLayerRef.current = weatherLayer;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: "10px 15px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: 10,
        fontWeight: "bold",
        fontSize: "14px",
      }}
    >
      Temperatura
    </div>
  );
};

export default TemperatureLayerMap;
