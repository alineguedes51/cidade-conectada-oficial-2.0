import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Phone, Mail, Loader2, Save, LogOut } from 'lucide-react';
import { ROLE_LABELS } from '../types';

interface ProfileProps {
  onNavigate: (view: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { userProfile, updateProfileData, signOut } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [whatsapp, setWhatsapp] = useState(userProfile?.whatsapp || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp) {
      showToast('Por favor, preencha o Nome e o WhatsApp.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfileData(fullName, whatsapp);
      showToast('Seu perfil foi atualizado com sucesso!', 'success');
    } catch (err: any) {
      showToast('Falha ao atualizar dados cadastrais.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      await signOut();
      onNavigate('home');
    }
  };

  const roleLabel = userProfile ? ROLE_LABELS[userProfile.role] : '';

  const roleBadgeClass = {
    comum: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    adm: 'text-brand-green bg-brand-green/10 border-brand-green/20',
    gestor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }[userProfile?.role ?? 'comum'];

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4 relative z-10 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent blur-3xl pointer-events-none rounded-3xl" />

      <div className="glass-panel border-white/10 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 text-2xl font-bold font-mono">
            {userProfile?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{userProfile?.fullName}</h3>
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-300 font-semibold uppercase">Email Primário</label>
            <div className="relative">
              <input type="email" value={userProfile?.email || ''} className="w-full bg-[#050507]/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-400 cursor-not-allowed" disabled />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-300 font-semibold uppercase">Nome Completo</label>
            <div className="relative">
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#050507]/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 glass-input" placeholder="Insira seu nome" required />
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-300 font-semibold uppercase">WhatsApp com DDD</label>
            <div className="relative">
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-[#050507]/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 glass-input" placeholder="(81) 99999-9999" required />
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 transition cursor-pointer">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Salvar Alterações</span></>}
            </button>
          </div>
        </form>

        <div className="border-t border-white/5 pt-4 mt-5 flex items-center justify-between">
          <span className="text-[10.5px] text-slate-400 leading-none">Deseja sair do aplicativo?</span>
          <button onClick={handleLogout} className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
