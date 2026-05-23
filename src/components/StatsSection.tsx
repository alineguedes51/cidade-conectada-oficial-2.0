import React from 'react';
import { Report } from '../types';
import { Eye, ShieldAlert, Wrench, CheckCircle2, FileArchive } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsSectionProps {
  reports: Report[];
}

export default function StatsSection({ reports }: StatsSectionProps) {
  const total = reports.length;
  const recebidos = reports.filter(r => r.status === 'recebido').length;
  const analise = reports.filter(r => r.status === 'analise').length;
  const andamento = reports.filter(r => r.status === 'andamento').length;
  const resolvido = reports.filter(r => r.status === 'resolvido').length;

  const cards = [
    {
      title: 'Total Registrado',
      value: total,
      sub: 'Demandas enviadas',
      icon: FileArchive,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/15',
      glow: 'shadow-purple-500/5'
    },
    {
      title: 'Em Análise',
      value: recebidos + analise,
      sub: 'Triagem e vistoria',
      icon: ShieldAlert,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/15',
      glow: 'shadow-amber-500/5'
    },
    {
      title: 'Em Execução',
      value: andamento,
      sub: 'Equipes em atividade',
      icon: Wrench,
      color: 'text-brand-green',
      borderColor: 'border-brand-green/20',
      glow: 'shadow-brand-green/5'
    },
    {
      title: 'Resolvidos',
      value: resolvido,
      sub: 'Soluções concluídas',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      borderColor: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/5',
      success: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full font-sans">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`glass-panel glass-panel-hover border-1 ${card.borderColor} rounded-2xl p-4 flex flex-col justify-between shadow-md ${card.glow} relative overflow-hidden group`}
          >
            {/* Top Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">{card.title}</span>
              <div className={`p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform duration-300 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Content Metric */}
            <div className="mt-4 flex flex-col align-baseline">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-1.5 leading-none">{card.sub}</span>
            </div>

            {/* Glowing background accent */}
            {card.success && (
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/5 blur-xl pointer-events-none rounded-full" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
