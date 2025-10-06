 import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Layers, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { meteomaticsService, TemperatureData } from '../lib/meteomatics';
import { useLayers } from '../contexts/LayersContext';
// @ts-ignore
import shp from 'shpjs';

interface Layer {
  id: string;
  name: string;
  type: string;
  color: string;
  is_active: boolean;
  opacity: number;
}

const fixedLayers: Layer[] = [
  // Removed fixed temperature layer to reset temperature layer
];

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  latitude: number;
  longitude: number;
  status: string;
}

export function Map({ onReportIssue }: { onReportIssue: (lat: number, lng: number) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const { layers } = useLayers();
  const [issues, setIssues] = useState<Issue[]>([]);
  const markersRef = useRef<(google.maps.Marker | google.maps.marker.AdvancedMarkerElement)[]>([]);
  const temperatureMarkersRef = useRef<(google.maps.Marker | google.maps.marker.AdvancedMarkerElement)[]>([]);
  const [shapefileLoaded, setShapefileLoaded] = useState(false);

  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([]);


  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const loader = new Loader({
      apiKey: 'AIzaSyD3FwPb18eONEW_K7Gt6obV3k-QWifMz7k',
      version: 'weekly',
      libraries: ['places', 'marker'],
    });

    loader.load().then(() => {
      map.current = new google.maps.Map(mapContainer.current!, {
        center: { lat: -9.19, lng: -75.015 },
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapId: 'DEMO_MAP_ID',
      });

      geocoder.current = new google.maps.Geocoder();

      map.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          onReportIssue(event.latLng.lat(), event.latLng.lng());
        }
      });

      // Add listener for map bounds changes to update temperature data
      map.current.addListener('idle', () => {
        const temperatureLayer = layers.find(layer => layer.type === 'temperature' && layer.is_active);
        if (temperatureLayer) {
          loadTemperatureData();
        }
      });


    });

    return () => {
      if (map.current) {
        map.current = null;
      }
      clearTemperatureMarkers();
    };
  }, [onReportIssue]);

  const handleSearch = () => {
    if (!geocoder.current || !searchInputRef.current || !map.current) return;
    const address = searchInputRef.current.value;
    if (!address) return;

    geocoder.current.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.current!.setCenter(location);
        map.current!.setZoom(15);
      } else {
        alert('No se encontró la dirección o coordenadas.');
      }
    });
  };

  useEffect(() => {
    loadIssues();

    // Debug log layers state after loading
    console.log('Layers loaded:', layers);

    const subscription = supabase
      .channel('issues_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
        loadIssues();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [layers]);

  // Effect to load temperature data when temperature layer is active
  useEffect(() => {
    const temperatureLayer = layers.find(layer => layer.type === 'temperature' && layer.is_active);
    if (temperatureLayer && map.current) {
      meteomaticsService.getTemperatureGridForBounds = async (bounds: google.maps.LatLngBounds) => {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        return await meteomaticsService.getTemperatureGrid(sw.lat(), ne.lat(), sw.lng(), ne.lng());
      };

      const loadTemperatureData = async () => {
        if (!map.current) return;
        const bounds = map.current.getBounds();
        if (!bounds) return;

        try {
          const data = await meteomaticsService.getTemperatureGridForBounds(bounds);
          updateTemperatureMarkers(data);
        } catch (error) {
          console.error('Error loading temperature data:', error);
        }
      };

      loadTemperatureData();

      // Add listener to reload temperature data on map idle
      const idleListener = map.current.addListener('idle', loadTemperatureData);

      return () => {
        if (idleListener) {
          idleListener.remove();
        }
        clearTemperatureMarkers();
      };
    } else {
      clearTemperatureMarkers();
    }
  }, [layers]);

  // Removed useEffect for fixedLayers - now handled by LayersContext



  // Update temperature layer based on temperature layer state
  useEffect(() => {
    console.log('🌡️ Temperature effect triggered. Layers:', layers.map(l => ({ name: l.name, type: l.type, active: l.is_active })));
    const temperatureLayer = layers.find(layer => layer.type === 'temperature');

    console.log('🔍 Temperature layer found:', temperatureLayer);

    if (temperatureLayer && temperatureLayer.is_active && map.current) {
      console.log('✅ Temperature layer is active - loading data');
      loadTemperatureData();
    } else {
      console.log('❌ Temperature layer not active or no map - clearing markers');
      clearTemperatureMarkers();
      setTemperatureData([]);
    }
  }, [layers]);

  const loadTemperatureData = async () => {
    console.log('🌡️ loadTemperatureData called');
    if (!map.current) {
      console.log('❌ No map instance available');
      return;
    }

    try {
      const bounds = map.current.getBounds();
      if (!bounds) {
        console.log('❌ No map bounds available');
        return;
      }

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      console.log('📍 Loading temperature data for bounds:', {
        sw: { lat: sw.lat(), lng: sw.lng() },
        ne: { lat: ne.lat(), lng: ne.lng() }
      });

      // Get temperature data for a grid within the current map bounds
      console.log('🔄 Calling meteomaticsService.getTemperatureGrid...');
      const data = await meteomaticsService.getTemperatureGrid(
        sw.lat(),
        ne.lat(),
        sw.lng(),
        ne.lng()
      );

      console.log('📊 Temperature data loaded:', data.length, 'points');
      console.log('📋 Sample data points:', data.slice(0, 3));
      setTemperatureData(data);
      updateTemperatureMarkers(data);
    } catch (error) {
      console.error('❌ Error loading temperature data:', error);
    }
  };

  const updateTemperatureMarkers = async (data: TemperatureData[]) => {
    if (!map.current) return;

    // Clear existing temperature markers
    clearTemperatureMarkers();

    // Import AdvancedMarkerElement
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    data.forEach(tempData => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.8);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${Math.round(tempData.temperature)}°C
        </div>
      `;

      const marker = new AdvancedMarkerElement({
        position: { lat: tempData.lat, lng: tempData.lng },
        map: map.current,
        content: markerElement,
      });

      temperatureMarkersRef.current.push(marker);
    });
  };

  const clearTemperatureMarkers = () => {
    temperatureMarkersRef.current.forEach(marker => {
      if ('setMap' in marker) {
        // Legacy Marker
        marker.setMap(null);
      } else if ('map' in marker) {
        // AdvancedMarkerElement
        marker.map = null;
      }
    });
    temperatureMarkersRef.current = [];
  };

  // Removed loadLayers function - now handled by LayersContext

  const loadIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setIssues(data);
      updateMarkers(data);
    }
  };

  const updateMarkers = async (issuesData: Issue[]) => {
    if (!map.current) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Import AdvancedMarkerElement
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    issuesData.forEach(issue => {
      if (!map.current) return;

      const priorityColors = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#f97316',
        critical: '#ef4444'
      };

      const color = priorityColors[issue.priority as keyof typeof priorityColors] || '#6b7280';

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `;

      const marker = new AdvancedMarkerElement({
        position: { lat: issue.latitude, lng: issue.longitude },
        map: map.current,
        content: markerElement,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${issue.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${issue.description}</p>
            <div style="display: flex; gap: 8px; font-size: 12px;">
              <span style="padding: 4px 8px; background: #f3f4f6; border-radius: 4px;">${issue.category}</span>
              <span style="padding: 4px 8px; background: ${issue.priority === 'critical' ? '#fee2e2' : issue.priority === 'high' ? '#fed7aa' : '#dbeafe'}; border-radius: 4px;">${issue.priority}</span>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  // Removed toggleLayer function - now handled by LayersContext

  const onShapefileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const geojson = await shp(arrayBuffer);

      if (!map.current) return;

      // Clear previous shapefile data
      map.current.data.forEach((feature) => {
        map.current!.data.remove(feature);
      });

      // Add new GeoJSON data
      map.current.data.addGeoJson(geojson);

      // Style the data
      map.current.data.setStyle({
        fillColor: '#888888',
        fillOpacity: 0.5,
        strokeColor: '#666666',
        strokeWeight: 1,
      });

      setShapefileLoaded(true);

      // Fit map to shapefile bounds
      const bounds = new google.maps.LatLngBounds();
      geojson.features.forEach((feature: any) => {
        const geom = feature.geometry;
        if (geom.type === 'Point') {
          bounds.extend(new google.maps.LatLng(geom.coordinates[1], geom.coordinates[0]));
        } else if (geom.type === 'LineString' || geom.type === 'Polygon') {
          const coords = geom.coordinates.flat(2);
          for (let i = 0; i < coords.length; i += 2) {
            bounds.extend(new google.maps.LatLng(coords[i + 1], coords[i]));
          }
        } else if (geom.type === 'MultiPoint') {
          geom.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
          });
        } else if (geom.type === 'MultiLineString' || geom.type === 'MultiPolygon') {
          const coords = geom.coordinates.flat(3);
          for (let i = 0; i < coords.length; i += 2) {
            bounds.extend(new google.maps.LatLng(coords[i + 1], coords[i]));
          }
        }
      });
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, 20);
      }

    } catch (error) {
      console.error('Error loading shapefile:', error);
      alert('Error al cargar el archivo shapefile. Asegúrate de que el archivo sea válido.');
    }
  };

  return (
    <>
      <div className="relative w-full h-full">
        <div className="absolute top-4 left-96 z-20 flex gap-2 bg-white rounded-lg shadow-lg p-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar dirección o coordenadas"
            className="border border-gray-300 rounded px-2 py-1 text-sm w-64"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>

        <div ref={mapContainer} className="absolute inset-0" />

        {/* Removed small layers panel button and panel */}

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="text-xs font-medium text-gray-500 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-700">Low Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-700">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-700">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-700">Critical</span>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
