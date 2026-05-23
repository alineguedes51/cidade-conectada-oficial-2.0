import React, { useState } from 'react';
import { Report, CATEGORY_LABELS, STATUS_LABELS, ReportCategory, ReportStatus, STATUS_COLORS } from '../types';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Search, Trash2, Eye, BarChart3, Clock,
  TrendingUp, Filter, MapPin, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, FileText, ChevronDown
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
  recebido:  { label: 'Recebido',     bg: 'bg-slate-900',  text: 'text-sky-400',     border: 'border-sky-500/25',     dot: 'bg-sky-400',     bar: 'bg-sky-500'     },
  analise:   { label: 'Em Análise',   bg: 'bg-slate-900',  text: 'text-amber-400',   border: 'border-amber-500/25',   dot: 'bg-amber-400',   bar: 'bg-amber-500'   },
  andamento: { label: 'Em Andamento', bg: 'bg-slate-900',  text: 'text-violet-400',  border: 'border-violet-500/25',  dot: 'bg-violet-400',  bar: 'bg-violet-500'  },
  resolvido: { label: 'Resolvido',    bg: 'bg-slate-900',  text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-400', bar: 'bg-emerald-500' },
} as const;

const BAIRROS = [
  'Agamenon Magalhães', 'Alto do Céu', 'Ana de Albuquerque', 'Bela Vista', 'Bonfim',
  'Campina de Feira', 'Centro', 'Cruz de Rebouças', 'Cuieiras', 'Distrito de Três Ladeiras',
  'Distrito Nova Cruz', 'Encanto Igarassu', 'Inhamã', 'Jardim Boa Sorte', 'Monjope',
  'Nova Cruz', 'Panco', 'Posto de Monta', 'Rubina', 'Santa Luzia', 'Santa Rita',
  'Santo Antônio', 'Saramandaia', 'Sitio dos Marcos', 'Tabatinga', 'Triunfo',
  'Umbura', 'Vila Rural',
];

const CATEGORY_ICONS: Record<string, string> = {
  buraco: '🕳️', lampada: '💡', entulho: '🪨', lixo: '🗑️',
  vazamento: '💧', esgoto: '🚰', outros: '📋',
};

export default function AdminDashboard({ reports, onViewDetails, onUpdateSuccess, loading }: AdminDashboardProps) {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [bairroFilter, setBairroFilter] = useState<string>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tabela' | 'mapa'>('tabela');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const categoryMax = Math.max(...Object.values(categoryCounts), 1);

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
    setUpdatingId(reportId);
    setConfirmDelete(null);
    try {
      const { error } = await supabase.from('reports').delete().eq('id', reportId);
      if (error) throw error;
      showToast('Denúncia removida com sucesso.', 'success');
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
    const matchCat    = categoryFilter === 'todas' || r.category === categoryFilter;
    const matchSt     = statusFilter === 'todos'   || r.status === statusFilter;
    const matchBairro = bairroFilter === 'todos'   || r.address.toLowerCase().includes(bairroFilter.toLowerCase());
    return matchSearch && matchCat && matchSt && matchBairro;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 relative z-10 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">Painel Administrativo</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Zeladoria Urbana · Igarassu &nbsp;·&nbsp;
              <span className="text-brand-green font-semibold">{userProfile?.fullName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green/5 border border-brand-green/20 text-xs text-brand-green font-semibold">
          <span className="flex h-2 w-2 relative mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
          </span>
          Sincronizado em tempo real
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-brand-green/10 to-emerald-900/10 border border-brand-green/20 rounded-2xl p-5 flex flex-col gap-2"
        >
          <span className="text-[10px] text-brand-green font-bold uppercase tracking-widest">Total</span>
          <span className="text-4xl font-black text-white">{total}</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <FileText className="w-3 h-3" /> denúncias registradas
          </span>
        </motion.div>

        {(Object.entries(byStatus) as [keyof typeof STATUS_CONFIG, number][]).map(([status, count], i) => {
          const cfg = STATUS_CONFIG[status];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.07 }}
              className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
                <span className={`text-[10px] font-mono font-bold ${cfg.text} opacity-70`}>{pct}%</span>
              </div>
              <span className="text-3xl font-black text-white">{count}</span>
              <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full ${cfg.bar} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top categories */}
        <div className="lg:col-span-2 bg-slate-900 border border-white/8 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Categorias mais reportadas</h3>
            </div>
            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{total} total</span>
          </div>
          <div className="space-y-3.5">
            {topCategories.length > 0 ? topCategories.map(([key, count]) => {
              const pct = Math.round((count / categoryMax) * 100);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-base w-6 shrink-0">{CATEGORY_ICONS[key] || '📋'}</span>
                  <span className="text-[11px] text-slate-300 w-28 shrink-0 truncate font-medium">{CATEGORY_LABELS[key as ReportCategory]}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-brand-green to-emerald-400 rounded-full"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-brand-green w-5 text-right">{count}</span>
                </div>
              );
            }) : (
              <p className="text-[11px] text-slate-500 text-center py-4">Nenhum dado ainda.</p>
            )}
          </div>
        </div>

        {/* Resolution donut */}
        <div className="bg-slate-900 border border-white/8 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Taxa de Resolução</span>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3.5" />
              <motion.circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="url(#adminGrad)" strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${resolutionRate} ${100 - resolutionRate}` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <defs>
                <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{resolutionRate}%</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wide">resolvido</span>
            </div>
          </div>
          <div className="w-full space-y-2 mt-1">
            {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([s, cfg]) => (
              <div key={s} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-slate-400">{cfg.label}</span>
                </div>
                <span className="font-bold text-slate-300">{byStatus[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER + TABLE */}
      <div className="space-y-4">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-green/50 placeholder:text-slate-500"
              placeholder="Buscar por protocolo, bairro, cidadão..."
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={bairroFilter} onChange={(e) => setBairroFilter(e.target.value)}
              className="bg-slate-900 text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer">
              <option value="todos">Todos os Bairros</option>
              {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer">
              <option value="todas">Todas as Categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer">
              <option value="todos">Todos os Status</option>
              {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <div className="flex bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
              {(['tabela', 'mapa'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-semibold transition ${activeTab === tab ? 'bg-brand-green/15 text-brand-green' : 'text-slate-400 hover:text-slate-200'}`}>
                  {tab === 'tabela' ? 'Tabela' : 'Mapa'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Exibindo <span className="text-slate-300 font-bold">{filtered.length}</span> de {total} denúncias
        </p>

        {activeTab === 'tabela' ? (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">
                      <th className="px-5 py-3.5">Protocolo</th>
                      <th className="px-5 py-3.5">Cidadão</th>
                      <th className="px-5 py-3.5">Categoria</th>
                      <th className="px-5 py-3.5">Endereço</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.length > 0 ? filtered.map((report, idx) => {
                      const cfg = STATUS_CONFIG[report.status];
                      return (
                        <motion.tr
                          key={report.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                          className="hover:bg-white/[0.025] transition group"
                        >
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-white text-[11px]">{report.protocol}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{formatDate(report.createdAt)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-200">{report.userName}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{report.userWhatsapp || '—'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{CATEGORY_ICONS[report.category] || '📋'}</span>
                              <span className="text-[11px] text-slate-300 font-medium">{CATEGORY_LABELS[report.category]}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 max-w-[140px]">{report.description}</p>
                          </td>
                          <td className="px-5 py-4 max-w-[150px]">
                            <span className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{report.address || '—'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="relative inline-block">
                              <select
                                value={report.status}
                                disabled={updatingId === report.id}
                                onChange={(e) => handleUpdateStatus(report.id, e.target.value as ReportStatus)}
                                className={`appearance-none pr-6 pl-2.5 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer focus:outline-none ${cfg.bg} ${cfg.text} ${cfg.border}`}
                              >
                                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                  <option key={k} value={k} className="bg-slate-900 text-slate-200">{v}</option>
                                ))}
                              </select>
                              {updatingId === report.id
                                ? <Loader2 className="absolute right-1.5 top-2 w-3 h-3 animate-spin opacity-60" />
                                : <ChevronDown className="absolute right-1.5 top-2 w-3 h-3 opacity-50 pointer-events-none" />
                              }
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onViewDetails(report.id)}
                                title="Ver detalhes"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-white/5 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {confirmDelete === report.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteReport(report.id)} className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg font-bold hover:bg-rose-500/30 transition cursor-pointer">
                                    Confirmar
                                  </button>
                                  <button onClick={() => setConfirmDelete(null)} className="text-[10px] bg-white/5 text-slate-400 border border-white/10 px-2 py-1 rounded-lg font-bold hover:bg-white/10 transition cursor-pointer">
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(report.id)}
                                  disabled={updatingId === report.id}
                                  title="Deletar"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500 text-xs">Nenhuma denúncia encontrada com esses filtros.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="h-[480px] rounded-2xl overflow-hidden border border-white/10">
            <MapComponent latitude={-7.8341} longitude={-34.9061} onChangeLocation={() => {}} readOnly={true} />
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-600 text-center">
        Alterações de status são aplicadas imediatamente. &nbsp;·&nbsp; Exclusões são permanentes.
      </p>
    </div>
  );
}
