import React, { useState } from 'react';
import { Report, CATEGORY_LABELS, STATUS_LABELS, ReportCategory, ReportStatus, STATUS_COLORS } from '../types';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Search, Trash2, Edit3, MapPin, CheckCircle2,
  AlertTriangle, Hammer, MessageSquareCode, BarChart3, Clock,
  TrendingUp, Filter, Eye
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import MapComponent from '../components/MapComponent';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  reports: Report[];
  onViewDetails: (reportId: string) => void;
  onUpdateSuccess: () => void;
  loading: boolean;
}

const STATUS_CONFIG = {
  recebido:  { label: 'Recebido',      color: 'text-emerald-400', bar: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  analise:   { label: 'Em Análise',    color: 'text-amber-400',   bar: 'bg-amber-500',   ring: 'ring-amber-500/20' },
  andamento: { label: 'Em Andamento',  color: 'text-blue-400',    bar: 'bg-blue-500',    ring: 'ring-blue-500/20' },
  resolvido: { label: 'Resolvido',     color: 'text-violet-400',  bar: 'bg-violet-500',  ring: 'ring-violet-500/20' },
} as const;

export default function AdminDashboard({ reports, onViewDetails, onUpdateSuccess, loading }: AdminDashboardProps) {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tabela' | 'mapa'>('tabela');

  // Stats
  const total = reports.length;
  const byStatus = {
    recebido:  reports.filter(r => r.status === 'recebido').length,
    analise:   reports.filter(r => r.status === 'analise').length,
    andamento: reports.filter(r => r.status === 'andamento').length,
    resolvido: reports.filter(r => r.status === 'resolvido').length,
  };
  const resolutionRate = total > 0 ? Math.round((byStatus.resolvido / total) * 100) : 0;

  const categoryCounts = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryMax = Math.max(...Object.values(categoryCounts), 1);

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq('id', reportId);
      if (error) throw error;
      showToast(`Status atualizado para: ${STATUS_LABELS[newStatus]}`, 'success');
      onUpdateSuccess();
    } catch {
      showToast('Erro ao atualizar status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Deletar permanentemente esta denúncia?')) return;
    setUpdatingId(reportId);
    try {
      const { error } = await supabase.from('reports').delete().eq('id', reportId);
      if (error) throw error;
      showToast('Denúncia removida.', 'success');
      onUpdateSuccess();
    } catch {
      showToast('Erro ao remover denúncia.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.protocol.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'todas' || r.category === categoryFilter;
    const matchSt  = statusFilter === 'todos'   || r.status === statusFilter;
    return matchSearch && matchCat && matchSt;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 relative z-10 space-y-8">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-none">Painel Administrativo</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Zeladoria Urbana de Igarassu &nbsp;·&nbsp;
                <span className="text-brand-green font-semibold">{userProfile?.fullName}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 border border-white/5 px-4 py-2 rounded-xl">
          <Clock className="w-3.5 h-3.5" />
          <span>Atualizado em tempo real via Supabase</span>
          <span className="flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
          </span>
        </div>
      </div>

      {/* ── METRIC CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 col-span-2 lg:col-span-1 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total de Registros</span>
          <span className="text-4xl font-black text-white mt-1">{total}</span>
          <div className="flex items-center gap-1 text-brand-green text-[11px] font-semibold mt-auto">
            <TrendingUp className="w-3 h-3" />
            <span>Denúncias cadastradas</span>
          </div>
        </div>

        {(Object.entries(byStatus) as [ReportStatus, number][]).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cfg.label}</span>
                <span className={`text-[10px] font-bold ${cfg.color}`}>{pct}%</span>
              </div>
              <span className="text-2xl font-black text-white">{count}</span>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-auto">
                <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ANALYTICS ROW ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category bar chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Volume por Categoria</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{total} total</span>
          </div>
          <div className="space-y-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const count = categoryCounts[key] || 0;
              const pct = total > 0 ? (count / categoryMax) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 w-36 shrink-0 truncate">{label}</span>
                  <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-blue-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution rate + recent */}
        <div className="flex flex-col gap-4">
          {/* Donut-style rate */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Taxa de Resolução</span>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="url(#grad)" strokeWidth="3"
                  strokeDasharray={`${resolutionRate} ${100 - resolutionRate}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white">{resolutionRate}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              <span className="text-violet-400 font-bold">{byStatus.resolvido}</span> de {total} resolvidas
            </p>
          </div>

          {/* Recent activity */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Mais Recentes
            </h3>
            <div className="space-y-2.5">
              {recentReports.map(r => {
                const cfg = STATUS_CONFIG[r.status];
                return (
                  <div key={r.id} className="flex items-start gap-2.5 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 -mx-1.5 transition" onClick={() => onViewDetails(r.id)}>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.bar}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-200 font-semibold truncate">{CATEGORY_LABELS[r.category]}</p>
                      <p className="text-[10px] text-slate-500 truncate">{r.address}</p>
                    </div>
                  </div>
                );
              })}
              {recentReports.length === 0 && <p className="text-[11px] text-slate-500 text-center py-2">Nenhuma denúncia ainda.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── REPORTS TABLE / MAP TABS ────────────────────── */}
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#050507]/20 border border-white/5 rounded-2xl p-4">
          <div className="relative w-full md:max-w-xs">
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#050507]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-green"
              placeholder="Protocolo, bairro, cidadão..."
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-950/80 text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2 focus:outline-none">
              <option value="todas">Todas Categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-950/80 text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2 focus:outline-none">
              <option value="todos">Todos Status</option>
              {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            {/* Tab switcher */}
            <div className="flex bg-slate-950/80 border border-white/10 rounded-xl overflow-hidden">
              {(['tabela', 'mapa'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-xs font-semibold transition capitalize ${activeTab === tab ? 'bg-brand-green/20 text-brand-green' : 'text-slate-400 hover:text-slate-200'}`}>
                  {tab === 'tabela' ? 'Tabela' : 'Mapa'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result count */}
        <p className="text-[11px] text-slate-500 px-1">
          Exibindo <span className="text-slate-300 font-bold">{filtered.length}</span> de {total} denúncias
        </p>

        {activeTab === 'tabela' ? (
          <div className="bg-slate-950/30 rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    <th className="p-4">Protocolo</th>
                    <th className="p-4">Cidadão</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Endereço</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length > 0 ? filtered.map(report => {
                    const lc = STATUS_COLORS[report.status];
                    return (
                      <tr key={report.id} className="hover:bg-white/[0.03] transition">
                        <td className="p-4">
                          <span className="font-mono font-bold text-white text-[11px] block">{report.protocol}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">{formatDate(report.createdAt)}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-200 block">{report.userName}</span>
                          <span className="text-[10px] text-slate-500">{report.userWhatsapp}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-blue-300">{CATEGORY_LABELS[report.category]}</span>
                          <p className="line-clamp-1 text-slate-400 mt-1 text-[11px]">{report.description}</p>
                        </td>
                        <td className="p-4 max-w-[160px]">
                          <span className="line-clamp-2 text-slate-300 leading-relaxed">{report.address}</span>
                        </td>
                        <td className="p-4">
                          <select
                            value={report.status}
                            disabled={updatingId === report.id}
                            onChange={(e) => handleUpdateStatus(report.id, e.target.value as ReportStatus)}
                            className={`bg-slate-950 text-[11px] rounded-lg px-2.5 py-1 border focus:outline-none font-bold cursor-pointer ${lc.text} ${lc.border}`}
                          >
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k} className="text-slate-300 bg-slate-950">{v}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => onViewDetails(report.id)} title="Ver detalhes" className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-white/5 transition cursor-pointer">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteReport(report.id)} title="Deletar" disabled={updatingId === report.id} className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} className="p-10 text-center text-slate-500">Nenhuma denúncia encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-[480px] rounded-2xl overflow-hidden border border-white/10">
            <MapComponent latitude={-7.8341} longitude={-34.9061} onChangeLocation={() => {}} readOnly={true} />
          </div>
        )}
      </div>
    </div>
  );
}
