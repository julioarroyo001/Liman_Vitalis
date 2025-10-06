import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LayersProvider } from './contexts/LayersContext';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { Dashboard } from './components/Dashboard';
import { LayersPanel } from './components/LayersPanel';
import { IssuesPanel } from './components/IssuesPanel';
import { IssueReportModal } from './components/IssueReportModal';

function App() {
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activePanel, setActivePanel] = useState<string>('map');

  const handleReportIssue = (lat: number, lng: number) => {
    setReportLocation({ lat, lng });
  };

  const handleSidebarClick = (panelId: string) => {
    setActivePanel(panelId);
  };

  return (
    <AuthProvider>
      <LayersProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar onItemClick={handleSidebarClick} activePanel={activePanel} />

          <main className="flex-1 overflow-hidden relative">
            <Map onReportIssue={handleReportIssue} />

            {activePanel === 'layers' && <LayersPanel />}
            {activePanel === 'dashboard' && <Dashboard />}
            {activePanel === 'issues' && <IssuesPanel />}
          </main>

          {reportLocation && (
            <IssueReportModal
              latitude={reportLocation.lat}
              longitude={reportLocation.lng}
              onClose={() => setReportLocation(null)}
            />
          )}
        </div>
      </LayersProvider>
    </AuthProvider>
  );
}

export default App;
