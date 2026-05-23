import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Report, STATUS_LABELS } from '../types';
import ReportCard from '../components/ReportCard';
import { 
  Search, Plus, MapPin, Eye, FileText, 
  HelpCircle, Sparkles, Inbox, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  reports: Report[];
  onNavigate: (view: string) => void;
  onViewDetails: (reportId: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export default function Dashboard({ reports, onNavigate, onViewDetails, loading, onRefresh }: DashboardProps) {
  const { userProfile } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Filter only citizen's reports
  const citizenReports = reports.filter(r => r.userId === userProfile?.uid);

  // Search and status filter logic
  const filtered = citizenReports.filter(r => {
    const matchesSearch = 
      r.protocol.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'todos') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10 px-4 relative z-10">
      
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Seu Painel de Monitoramento</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Olá, <span className="text-slate-200 font-semibold">{userProfile?.fullName}</span>. Acompanhe abaixo o andamento de suas solicitações registradas.
          </p>
        </div>

        {/* Buttons tray */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl transition cursor-pointer"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('report-wizard')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Denúncia</span>
          </button>
        </div>
      </div>

      {/* FILTER SEARCH MODULE GLASS CONTAINER */}
      <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/10">
        
        {/* Search bar input */}
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 glass-input"
            placeholder="Pesquisar por protocolo, bairro ou texto..."
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Categories Tab selector */}
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['todos', 'recebido', 'analise', 'andamento', 'resolvido'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize border ${
                statusFilter === st
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              {st === 'todos' ? 'Todos os Status' : STATUS_LABELS[st as any]}
            </button>
          ))}
        </div>
      </div>

      {/* REPORTS LIST GRID */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <LoaderSpinner />
          <p className="text-xs text-slate-400">Carregando seus registros biométricos de zeladoria...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ReportCard
                  report={item}
                  onViewDetails={onViewDetails}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state view */
        <div className="glass-panel border-white/5 rounded-3xl py-16 px-4 text-center max-w-lg mx-auto bg-slate-950/20 space-y-4">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto animate-bounce" />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nenhuma denúncia encontrada</h3>
            <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
              {citizenReports.length === 0 
                ? 'Você ainda não registrou nenhum problema urbano. Faça sua primeira denúncia e ajude a transformar Igarassu!'
                : 'Não encontramos nenhuma denúncia correspondente aos seus filtros ou pesquisa atuais.'}
            </p>
          </div>
          
          {citizenReports.length === 0 && (
            <button
              onClick={() => onNavigate('report-wizard')}
              className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold text-xs border border-blue-500/25 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar meu primeiro problema</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-10 h-10">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
