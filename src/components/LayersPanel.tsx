import { useState, useEffect } from 'react';
// Added import for Layers icon from lucide-react
import { Plus, Trash2, CreditCard as Edit2, Save, X, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLayers } from '../contexts/LayersContext';

interface Layer {
  id: string;
  name: string;
  description: string | null;
  type: string;
  color: string;
  is_active: boolean;
  opacity: number;
}

const layerTypes = [
  { value: 'pollution', label: 'Contaminación del Aire' },
  { value: 'traffic', label: 'Tráfico' },
  { value: 'noise', label: 'Niveles de Ruido' },
  { value: 'temperature', label: 'Temperatura en Tiempo Real' },
  { value: 'air_quality', label: 'Calidad del Aire' },
  { value: 'water_quality', label: 'Calidad del Agua' },
  { value: 'green_spaces', label: 'Espacios Verdes' },

  { value: 'custom', label: 'Personalizado' },
];

const fixedLayers: Layer[] = [
  {
    id: 'fixed-temperature',
    name: 'Temperatura',
    description: null,
    type: 'temperature',
    color: '#f97316', // orange
    is_active: true,
    opacity: 0.7,
  },
  {
    id: 'fixed-traffic',
    name: 'Tráfico',
    description: null,
    type: 'traffic',
    color: '#3b82f6', // blue
    is_active: true,
    opacity: 0.7,
  },
  {
    id: 'fixed-rain',
    name: 'Lluvias',
    description: null,
    type: 'precipitation',
    color: '#0ea5e9', // light blue
    is_active: true,
    opacity: 0.7,
  },
  {
    id: 'fixed-air-quality',
    name: 'Calidad del Aire',
    description: null,
    type: 'air_quality',
    color: '#22c55e', // green
    is_active: true,
    opacity: 0.7,
  },
  {
    id: 'fixed-water-quality',
    name: 'Calidad del Agua',
    description: null,
    type: 'water_quality',
    color: '#2563eb', // blue
    is_active: true,
    opacity: 0.7,
  },
  {
    id: 'fixed-green-spaces',
    name: 'Espacios Verdes',
    description: null,
    type: 'green_spaces',
    color: '#4ade80', // light green
    is_active: true,
    opacity: 0.7,
  },

];

export function LayersPanel() {
  const { user } = useAuth();
  const { layers, loadLayers, toggleLayer } = useLayers();
  const [expanded, setExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());

  // Sincronizar selectedLayers con capas activas al cargar o actualizar layers
  useEffect(() => {
    const activeLayerIds = new Set(layers.filter(layer => layer.is_active).map(layer => layer.id));
    setSelectedLayers(activeLayerIds);
  }, [layers]);

  const handleActivateSelectedLayers = async () => {
    console.log('Activating selected layers:', Array.from(selectedLayers));
    for (const layerId of selectedLayers) {
      await toggleLayer(layerId);
    }
    // Actualizar selectedLayers para reflejar el estado real después de activar
    const updatedActiveLayerIds = new Set(layers.filter(layer => layer.is_active).map(layer => layer.id));
    setSelectedLayers(updatedActiveLayerIds);
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'pollution',
    color: '#3B82F6',
    opacity: 0.7,
  });

  // Removed duplicate loadLayers function and fixedLayersActive state usage
  // Use loadLayers and toggleLayer from useLayers context instead

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase
        .from('layers')
        .update({
          name: formData.name,
          description: formData.description || null,
          opacity: formData.opacity,
        })
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        loadLayers();
      }
    } else {
      const { error } = await supabase.from('layers').insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        color: formData.color,
        opacity: formData.opacity,
        is_active: true,
      });

      if (!error) {
        setShowCreateForm(false);
        resetForm();
        loadLayers();
      }
    }
  };

  const handleDelete = async (id: string) => {
    // Prevent deletion of fixed layers
    if (fixedLayers.some((layer) => layer.id === id)) {
      alert('No se puede eliminar una capa fija.');
      return;
    }

    const { error } = await supabase
      .from('layers')
      .delete()
      .eq('id', id);

    if (!error) {
      loadLayers();
    }
  };

  const handleEdit = (layer: Layer) => {
    setEditingId(layer.id);
    setFormData({
      name: layer.name,
      description: layer.description || '',
      type: layer.type,
      color: layer.color,
      opacity: layer.opacity,
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'pollution',
      color: '#3B82F6',
      opacity: 0.7,
    });
    setEditingId(null);
  };

  const handleToggleSelection = (layerId: string) => {
    setSelectedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  return (
    <div className="absolute left-0 top-0 w-96 h-full bg-white shadow-lg z-10 overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Capas del Mapa</h1>
            <p className="text-gray-600">Crear y administrar capas de datos para visualización</p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              if (showCreateForm) resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showCreateForm ? 'Cancelar' : 'Nueva Capa'}
          </button>
        </div>

        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center"
          >
            <Layers className="w-5 h-5" />
            Capas
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Capa' : 'Crear Nueva Capa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Capa
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ej. Índice de Calidad del Aire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Capa
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    disabled={!!editingId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {layerTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      disabled={!!editingId}
                      className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      disabled={!!editingId}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacidad: {formData.opacity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.opacity}
                    onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Descripción opcional..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Actualizar Capa' : 'Crear Capa'}
                </button>
              </div>
            </form>
          </div>
        )}

        {expanded && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Selecciona las capas a mostrar</h2>
            {layers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Layers className="w-12 h-12 mx-auto mb-4" />
                <p>Aún no hay capas disponibles</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {layers.map((layer) => (
                  <li key={layer.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`layer-toggle-${layer.id}`}
                      checked={selectedLayers.has(layer.id)}
                      onChange={() => handleToggleSelection(layer.id)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`layer-toggle-${layer.id}`} className="flex-1 cursor-pointer select-none">
                      <span
                        className="inline-block w-5 h-5 rounded mr-2"
                        style={{ backgroundColor: layer.color, opacity: layer.opacity }}
                      ></span>
                      {layer.name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleActivateSelectedLayers}
            disabled={selectedLayers.size === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-semibold"
          >
            Activar Capas Seleccionadas ({selectedLayers.size})
          </button>
        </div>
      </div>
    </div>
  );
}
