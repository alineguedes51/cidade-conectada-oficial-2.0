import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import CityBackground from './components/CityBackground';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import GestorDashboard from './pages/GestorDashboard';
import ReportWizard from './components/ReportWizard';
import ReportDetailsModal from './components/ReportDetailsModal';
import { supabase, supabaseConfigured } from './supabase/client';
import { seedInitialReportsIfEmpty } from './utils/helpers';
import { Report } from './types';

function AppContent() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<string>('home');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleNavigate = (view: string) => {
    if ((view === 'dashboard' || view === 'profile') && !currentUser) {
      showToast('Por favor, faça login ou registre-se para acessar esta área.', 'info');
      setActiveView('login');
      return;
    }
    if (view === 'admin' && userProfile?.role !== 'adm') {
      showToast('Acesso negado. Área restrita a administradores.', 'error');
      setActiveView('home');
      return;
    }
    if (view === 'gestor' && userProfile?.role !== 'gestor') {
      showToast('Acesso negado. Área restrita a gestores.', 'error');
      setActiveView('home');
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('id,protocol,"userId","userName","userWhatsapp",description,"photoUrl",category,status,latitude,longitude,address,"createdAt","updatedAt"')
      .order('"createdAt"', { ascending: false })
      .limit(200);
    if (!error && data) setReports(data as Report[]);
    setReportsLoading(false);
  };

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel('reports-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        setReports(prev => [payload.new as Report, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, (payload) => {
        setReports(prev => prev.map(r => r.id === payload.new.id ? payload.new as Report : r));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reports' }, (payload) => {
        setReports(prev => prev.filter(r => r.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050507] p-4 text-center animate-fade-in">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-green/20 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-4">Conectando ao Cidade Conectada...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      <CityBackground />
      <Navbar activeView={activeView} onNavigate={handleNavigate} />

      <main className="flex-1 w-full relative z-10">
        {activeView === 'home' && (
          <Home onNavigate={handleNavigate} reports={reports} />
        )}
        {activeView === 'login' && (
          <Login onNavigate={handleNavigate} initialTab="login" />
        )}
        {activeView === 'signup' && (
          <Login onNavigate={handleNavigate} initialTab="signup" />
        )}
        {activeView === 'dashboard' && (
          <Dashboard
            reports={reports}
            onNavigate={handleNavigate}
            onViewDetails={(id) => setSelectedReportId(id)}
            loading={reportsLoading}
            onRefresh={() => showToast('Dados sincronizados em tempo real com o Supabase!', 'info')}
          />
        )}
        {activeView === 'profile' && (
          <Profile onNavigate={handleNavigate} />
        )}
        {activeView === 'admin' && (
          <AdminDashboard
            reports={reports}
            onViewDetails={(id) => setSelectedReportId(id)}
            onUpdateSuccess={() => {}}
            loading={reportsLoading}
          />
        )}
        {activeView === 'gestor' && (
          <GestorDashboard onNavigate={handleNavigate} />
        )}
        {activeView === 'report-wizard' && (
          <div className="py-12 px-4">
            <ReportWizard
              onCancel={() => handleNavigate('dashboard')}
              onSuccess={(id) => {
                setSelectedReportId(id);
                handleNavigate('dashboard');
              }}
            />
          </div>
        )}
      </main>

      {selectedReportId && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReportId(null)}
          onUpdateSuccess={() => {}}
        />
      )}

      <footer className="w-full py-6 mt-12 bg-slate-950/40 border-t border-white/5 relative z-10 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <span>© 2026 Cidade Conectada - Igarassu. Zeladoria Pública Digital.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition cursor-help">Termos de Uso</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition cursor-help">Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SupabaseSetupScreen() {
  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900/80 border border-brand-green/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mx-auto">
          <span className="text-2xl">🔗</span>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Configurar Supabase</h2>
          <p className="text-slate-400 text-sm mt-2">
            Para rodar o app, crie um arquivo <code className="bg-slate-800 px-1.5 py-0.5 rounded text-brand-green text-xs">.env.local</code> na raiz do projeto com suas credenciais:
          </p>
        </div>
        <div className="bg-slate-950 rounded-xl p-4 text-left font-mono text-xs text-slate-300 border border-white/5 space-y-1">
          <p><span className="text-brand-green">VITE_SUPABASE_URL</span>=https://SEU_PROJETO.supabase.co</p>
          <p><span className="text-brand-green">VITE_SUPABASE_ANON_KEY</span>=eyJ...sua_chave_anon</p>
        </div>
        <p className="text-slate-500 text-xs">
          Encontre os valores em <strong className="text-slate-300">Settings → API</strong> no painel do Supabase. Depois execute o SQL em <code className="bg-slate-800 px-1 rounded text-xs">supabase/migrations/001_initial.sql</code>.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
