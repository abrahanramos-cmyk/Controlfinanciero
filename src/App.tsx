import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Movements } from './pages/Movements';
import { Settings } from './pages/Settings';
import { useState } from 'react';
import { LayoutDashboard, ListOrdered, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movements' | 'settings'>('dashboard');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Cargando...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <DataProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans pb-16 sm:pb-0 sm:pl-20">
        {/* Desktop Sidebar */}
        <div className="hidden sm:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-gray-200 z-10 items-center py-6 gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={cn("p-3 rounded-xl transition-colors", activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600')}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('movements')} 
            className={cn("p-3 rounded-xl transition-colors", activeTab === 'movements' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600')}
          >
            <ListOrdered size={24} />
          </button>
          <div className="flex-1"></div>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={cn("p-3 rounded-xl transition-colors", activeTab === 'settings' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600')}
          >
            <SettingsIcon size={24} />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'movements' && <Movements />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* Mobile Bottom Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-10 pb-env-safe">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={cn("flex flex-col items-center p-2", activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400')}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] mt-1 font-medium">Resumen</span>
          </button>
          <button 
            onClick={() => setActiveTab('movements')} 
            className={cn("flex flex-col items-center p-2", activeTab === 'movements' ? 'text-indigo-600' : 'text-gray-400')}
          >
            <ListOrdered size={24} />
            <span className="text-[10px] mt-1 font-medium">Datos</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={cn("flex flex-col items-center p-2", activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-400')}
          >
            <SettingsIcon size={24} />
            <span className="text-[10px] mt-1 font-medium">Ajustes</span>
          </button>
        </div>
      </div>
    </DataProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
