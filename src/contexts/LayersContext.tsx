import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Layer {
  id: string;
  name: string;
  description: string | null;
  type: string;
  color: string;
  is_active: boolean;
  opacity: number;
}

const fixedLayers: Layer[] = [
  {
    id: 'fixed-temperature',
    name: 'Temperatura',
    description: null,
    type: 'temperature',
    color: '#f97316',
    is_active: false,
    opacity: 0.7,
  },
  {
    id: 'fixed-traffic',
    name: 'Tráfico',
    description: null,
    type: 'traffic',
    color: '#3b82f6',
    is_active: false,
    opacity: 0.7,
  },
  {
    id: 'fixed-rain',
    name: 'Lluvias',
    description: null,
    type: 'precipitation',
    color: '#0ea5e9',
    is_active: false,
    opacity: 0.7,
  },
  {
    id: 'fixed-air-quality',
    name: 'Calidad del Aire',
    description: null,
    type: 'air_quality',
    color: '#22c55e',
    is_active: false,
    opacity: 0.7,
  },
  {
    id: 'fixed-water-quality',
    name: 'Calidad del Agua',
    description: null,
    type: 'water_quality',
    color: '#2563eb',
    is_active: false,
    opacity: 0.7,
  },
  {
    id: 'fixed-green-spaces',
    name: 'Espacios Verdes',
    description: null,
    type: 'green_spaces',
    color: '#4ade80',
    is_active: false,
    opacity: 0.7,
  },
];

interface LayersContextType {
  layers: Layer[];
  loadLayers: () => Promise<void>;
  toggleLayer: (layerId: string) => Promise<void>;
}

const LayersContext = createContext<LayersContextType | undefined>(undefined);

export function LayersProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [fixedLayersActive, setFixedLayersActive] = useState<Record<string, boolean>>({
    'fixed-temperature': false,
    'fixed-traffic': false,
    'fixed-rain': false,
    'fixed-air-quality': false,
    'fixed-water-quality': false,
    'fixed-green-spaces': false,
  });

  const loadLayers = async () => {
    const { data } = await supabase
      .from('layers')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Combine fixed layers with user layers, avoiding duplicates by type
      const combinedLayers = [
        ...fixedLayers.map(layer => ({
          ...layer,
          is_active: fixedLayersActive[layer.id] ?? layer.is_active,
        })),
        ...data.filter(
          (layer) => !fixedLayers.some((fixed) => fixed.type === layer.type)
        ),
      ];
      setLayers(combinedLayers);
    } else {
      setLayers(fixedLayers.map(layer => ({
        ...layer,
        is_active: fixedLayersActive[layer.id] ?? layer.is_active,
      })));
    }
  };

  const toggleLayer = async (layerId: string) => {
    console.log('🔄 toggleLayer called with layerId:', layerId);
    const layer = layers.find(l => l.id === layerId);
    if (!layer) {
      console.log('❌ Layer not found:', layerId);
      return;
    }

    console.log('📋 Found layer:', layer.name, 'Type:', layer.type, 'Currently active:', layer.is_active);

    // Handle fixed layers separately
    if (fixedLayers.some(fixed => fixed.id === layerId)) {
      console.log('🔧 Handling fixed layer:', layerId);
      setFixedLayersActive(prev => {
        const newState = { ...prev, [layerId]: !prev[layerId] };
        console.log('📊 New fixedLayersActive state:', newState);
        // Update layers state directly for fixed layers synchronously
        setLayers(prevLayers => {
          const updated = prevLayers.map(l =>
            l.id === layerId ? { ...l, is_active: !l.is_active } : l
          );
          console.log('🔄 Updated layers state:', updated.map(l => ({ id: l.id, name: l.name, active: l.is_active })));
          return updated;
        });
        return newState;
      });
      return;
    }

    console.log('👤 Handling user layer:', layerId);
    const { error } = await supabase
      .from('layers')
      .update({ is_active: !layer.is_active })
      .eq('id', layerId);

    if (error) {
      console.error('❌ Error updating user layer:', error);
    } else {
      console.log('✅ User layer updated, reloading layers...');
      loadLayers();
    }
  };

  useEffect(() => {
    loadLayers();
  }, []);

  return (
    <LayersContext.Provider value={{ layers, loadLayers, toggleLayer }}>
      {children}
    </LayersContext.Provider>
  );
}

export function useLayers() {
  const context = useContext(LayersContext);
  if (context === undefined) {
    throw new Error('useLayers must be used within a LayersProvider');
  }
  return context;
}
