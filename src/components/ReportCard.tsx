import React from 'react';
import { Report, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { MapPin, Tag, Calendar, Eye, MessageSquareCode } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { motion } from 'motion/react';

interface ReportCardProps {
  report: Report;
  onViewDetails: (reportId: string) => void;
}

export default function ReportCard({ report, onViewDetails }: ReportCardProps) {
  const statusColor = STATUS_COLORS[report.status] || { bg: 'bg-white/5', text: 'text-white', border: 'border-white/5' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      className="glass-panel glass-panel-hover border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-brand-green/35 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Photo header with category badge overlays */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-white/5">
        <img
          src={report.photoUrl}
          alt={CATEGORY_LABELS[report.category]}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

        {/* Status indicator badge (floating top-left) */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-full ${statusColor.bg} ${statusColor.text} border ${statusColor.border} backdrop-blur-md`}>
            {STATUS_LABELS[report.status]}
          </span>
        </div>

        {/* Category badge float top-right */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-slate-300">
          <Tag className="w-3 h-3 text-brand-green" />
          <span className="text-[11px] font-medium leading-none">{CATEGORY_LABELS[report.category]}</span>
        </div>

        {/* Protocol floating bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur border border-white/10 px-2 py-0.5 rounded-lg">
          <MessageSquareCode className="w-3.5 h-3.5 text-brand-yellow" />
          <span className="font-mono text-[11px] font-semibold text-slate-200 tracking-wider">
            {report.protocol}
          </span>
        </div>
      </div>

      {/* Structured Text details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Address information */}
          <div className="flex items-start gap-1.5 text-xs text-slate-450 text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
            <span className="line-clamp-1">{report.address}</span>
          </div>

          {/* Issue desc */}
          <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed min-h-[40px] pt-1">
            {report.description}
          </p>
        </div>

        {/* Card Footer actions */}
        <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(report.createdAt)}</span>
          </div>

          <button
            onClick={() => onViewDetails(report.id)}
            className="text-xs font-bold text-brand-green hover:text-brand-green/80 flex items-center gap-1 transition cursor-pointer group/btn"
          >
            <span>Ver Detalhes</span>
            <Eye className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
