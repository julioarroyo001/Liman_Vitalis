import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LayersProvider } from './contexts/LayersContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { Dashboard } from './components/Dashboard';
import { LayersPanel } from './components/LayersPanel';
import { IssuesPanel } from './components/IssuesPanel';
import { IssueReportModal } from './components/IssueReportModal';

function AppContent() {
  const { user, loading } = useAuth();
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activePanel, setActivePanel] = useState<string>('map');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleReportIssue = (lat: number, lng: number) => {
    setReportLocation({ lat, lng });
  };

  const handleSidebarClick = (panelId: string) => {
    setActivePanel(panelId);
  };

  return (
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
  );
}

function App() {
  return (
    <AuthProvider>
      <LayersProvider>
        <AppContent />
      </LayersProvider>
    </AuthProvider>
  );
}

export default App;
