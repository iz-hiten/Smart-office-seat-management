import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './Login';
import { Onboarding } from './Onboarding';
import { BookingDashboard } from './components/BookingDashboard';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from 'sonner';
import { Button } from './components/ui/button';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  if (!isAuthReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen pb-20">
      {view === 'dashboard' ? <BookingDashboard /> : <AdminPanel />}
      
      {profile.role === 'admin' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-full p-1.5 flex gap-1 z-50">
          <Button 
            variant={view === 'dashboard' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('dashboard')}
            className="rounded-full"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button 
            variant={view === 'admin' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('admin')}
            className="rounded-full"
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Admin
          </Button>
        </div>
      )}
      <Toaster position="top-center" theme="dark" />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
