import { BarChart3, Map as MapIcon, Layers, AlertCircle } from 'lucide-react';

interface SidebarProps {
  onItemClick: (id: string) => void;
  activePanel: string;
}

export function Sidebar({ onItemClick, activePanel }: SidebarProps) {

  const menuItems = [
    { id: 'map' as const, label: 'Vista del Mapa', icon: MapIcon },
    { id: 'dashboard' as const, label: 'Análisis', icon: BarChart3 },
    { id: 'layers' as const, label: 'Capas', icon: Layers },
    { id: 'issues' as const, label: 'Problemas', icon: AlertCircle },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">UrbanSense</h1>
            <p className="text-xs text-gray-600">Monitor de Vida Inteligente</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>


    </div>
  );
}
