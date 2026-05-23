import React, { useState } from 'react';
import { Report, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, ReportStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import {
  X, Calendar, Phone, User, Tag, MapPin,
  CheckCircle2, Clock, Trash2, ShieldAlert
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import MapComponent from './MapComponent';
import { useToast } from '../context/ToastContext';

interface ReportDetailsModalProps {
  report: Report;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export default function ReportDetailsModal({ report, onClose, onUpdateSuccess }: ReportDetailsModalProps) {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const [updating, setUpdating] = useState(false);

  const isAdmin = userProfile?.role === 'adm' || userProfile?.role === 'gestor';
  const statusColor = STATUS_COLORS[report.status];

  const ALL_STATUSES: { key: ReportStatus; label: string; desc: string }[] = [
    { key: 'recebido', label: 'Recebido', desc: 'Protocolo registrado com sucesso' },
    { key: 'analise', label: 'Em Análise', desc: 'Equipe técnica vistoriando o local' },
    { key: 'andamento', label: 'Em Andamento', desc: 'Reparo ou limpeza em andamento na via' },
    { key: 'resolvido', label: 'Resolvido', desc: 'Problema solucionado pela zeladoria' },
  ];

  const currentStatusIdx = ALL_STATUSES.findIndex(s => s.key === report.status);

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq('id', report.id);
      if (error) throw error;
      showToast(`Status alterado para: ${STATUS_LABELS[newStatus]}`, 'success');
      onUpdateSuccess();
    } catch (err: any) {
      showToast('Ocorreu um erro ao atualizar o status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReport = async () => {
    if (confirm('Tem certeza absoluta que deseja excluir permanentemente esta denúncia? Esta ação não pode ser desfeita.')) {
      setUpdating(true);
      try {
        const { error } = await supabase.from('reports').delete().eq('id', report.id);
        if (error) throw error;
        showToast('Denúncia excluída com sucesso!', 'success');
        onUpdateSuccess();
        onClose();
      } catch (err: any) {
        showToast('Erro ao remover denúncia. Operação restrita.', 'error');
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl p-6 lg:p-8 overflow-hidden z-10 my-8">

        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Detalhamento do Registro</span>
            <h2 className="text-xl lg:text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <span className="text-brand-green font-mono text-lg">{report.protocol}</span>
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative h-64 lg:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/5 group">
              <img src={report.photoUrl} alt="Foto da ocorrência" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-semibold text-slate-200">{CATEGORY_LABELS[report.category]}</span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase mb-2 ml-1">Geolocalização da Ocorrência</span>
              <MapComponent latitude={report.latitude} longitude={report.longitude} onChangeLocation={() => {}} readOnly={true} />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5 h-full justify-between">
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">Descritivo do Cidadão</h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{report.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-2 border-t border-white/5">
                <MapPin className="w-4 h-4 text-brand-green shrink-0" />
                <span>{report.address}</span>
              </div>
            </div>

            <div className="bg-slate-950/30 p-4 rounded-2xl border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Linha do Tempo de Resolução</h4>
              <div className="relative pl-6 space-y-4">
                <div className="absolute top-1 bottom-1 left-2.5 w-[2px] bg-white/5" />
                {ALL_STATUSES.map((status, idx) => {
                  const isDone = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  return (
                    <div key={status.key} className="relative flex flex-col">
                      <span className={`absolute -left-[20.5px] top-1.5 w-[11px] h-[11px] rounded-full border-2 ${
                        isCurrent ? 'bg-emerald-400 border-slate-900 ring-4 ring-emerald-500/20 scale-110'
                          : isDone ? 'bg-emerald-600 border-slate-900'
                          : 'bg-slate-800 border-slate-700'
                      }`} />
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold leading-none ${isCurrent ? 'text-emerald-400' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>{status.label}</span>
                        {isCurrent && <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 leading-none">{isDone ? status.desc : 'Aguardando etapas anteriores'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Informações do Autor</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300"><User className="w-3.5 h-3.5 text-slate-400" /><span className="truncate">{report.userName}</span></div>
                <div className="flex items-center gap-1.5 text-slate-300"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{report.userWhatsapp || 'Não cadastrado'}</span></div>
                <div className="col-span-2 flex items-center gap-1.5 text-slate-400 mt-1"><Calendar className="w-3.5 h-3.5" /><span>Registrada: {formatDate(report.createdAt)}</span></div>
              </div>
            </div>

            {isAdmin && (
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-rose-500/10 shadow-lg shadow-rose-950/5 mt-auto flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold tracking-wider uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Painel Administrativo da Prefeitura</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Alterar Fase de Resolução</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_STATUSES.map(st => (
                      <button
                        key={st.key}
                        disabled={updating || report.status === st.key}
                        onClick={() => handleUpdateStatus(st.key)}
                        className={`px-2 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                          report.status === st.key
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'
                        }`}
                      >
                        Mover para {st.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <span className="text-[10px] text-slate-400">Excluir denúncia da base de dados?</span>
                  <button
                    disabled={updating}
                    onClick={handleDeleteReport}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Deletar Registro</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
