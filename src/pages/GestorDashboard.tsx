import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { UserProfile, UserRole, ROLE_LABELS } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Users, ShieldCheck, User, Trash2, Search, Loader2,
  Crown, RefreshCw, ChevronDown, AlertCircle
} from 'lucide-react';

interface GestorDashboardProps {
  onNavigate: (view: string) => void;
}

const ROLE_STYLE: Record<UserRole, { badge: string; dot: string; label: string }> = {
  comum:  { badge: 'bg-slate-800 text-slate-300 border-white/10',        dot: 'bg-slate-400',   label: 'Cidadão'         },
  adm:    { badge: 'bg-brand-green/10 text-brand-green border-brand-green/20', dot: 'bg-brand-green', label: 'Administrador'   },
  gestor: { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',    dot: 'bg-purple-500',  label: 'Gestor'          },
};

export default function GestorDashboard({ onNavigate }: GestorDashboardProps) {
  const { userProfile: me } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('"createdAt"', { ascending: false });
    if (!error && data) {
      setUsers(data.map(d => ({
        uid: d.id as string,
        fullName: d.fullName as string,
        email: d.email as string,
        whatsapp: d.whatsapp as string,
        role: d.role as UserRole,
        createdAt: d.createdAt,
      })));
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingId(uid);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', uid);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      showToast(`Papel atualizado para ${ROLE_LABELS[newRole]}.`, 'success');
    } catch {
      showToast('Erro ao atualizar papel.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setUpdatingId(uid);
    setConfirmDelete(null);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', uid);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.uid !== uid));
      showToast('Usuário removido com sucesso.', 'success');
    } catch {
      showToast('Erro ao remover usuário.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = {
    total:  users.length,
    comum:  users.filter(u => u.role === 'comum').length,
    adm:    users.filter(u => u.role === 'adm').length,
    gestor: users.filter(u => u.role === 'gestor').length,
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'todos' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const initials = (name: string) => name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative z-10 space-y-8">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-none">Gestão de Usuários</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Controle de acesso &nbsp;·&nbsp;
              <span className="text-purple-400 font-semibold">{me?.fullName}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 border border-white/10 px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar lista
        </button>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',           value: counts.total,  color: 'text-slate-200', sub: 'usuários na plataforma' },
          { label: 'Cidadãos',        value: counts.comum,  color: 'text-slate-300', sub: 'acesso básico'          },
          { label: 'Administradores', value: counts.adm,    color: 'text-brand-green', sub: 'gerenciam denúncias'  },
          { label: 'Gestores',        value: counts.gestor, color: 'text-purple-400', sub: 'controle total'        },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-slate-900 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{label}</span>
            <span className={`text-3xl font-black block ${color}`}>{value}</span>
            <span className="text-[10px] text-slate-500">{sub}</span>
          </div>
        ))}
      </div>

      {/* ── ROLE INFO ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(ROLE_STYLE) as [UserRole, typeof ROLE_STYLE[UserRole]][]).map(([role, style]) => (
          <div key={role} className={`rounded-2xl border p-4 ${style.badge}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              <span className="text-xs font-bold uppercase tracking-widest">{style.label}</span>
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed">
              {role === 'comum'  && 'Cadastra e acompanha as próprias denúncias urbanas.'}
              {role === 'adm'    && 'Gerencia todas as denúncias: muda status, exclui registros, acessa o painel administrativo.'}
              {role === 'gestor' && 'Controle total de usuários: promove, rebaixa e remove contas. Não pode promover outros gestores.'}
            </p>
          </div>
        ))}
      </div>

      {/* ── FILTERS ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>
        <select
          value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="todos">Todos os papéis</option>
          <option value="comum">Cidadão</option>
          <option value="adm">Administrador</option>
          <option value="gestor">Gestor</option>
        </select>
      </div>

      <p className="text-[11px] text-slate-500 -mt-4">
        Exibindo <span className="text-slate-300 font-bold">{filtered.length}</span> de {counts.total} usuários
      </p>

      {/* ── USER TABLE ─────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-800 border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">
                <th className="p-4">Usuário</th>
                <th className="p-4 hidden md:table-cell">E-mail</th>
                <th className="p-4 hidden md:table-cell">WhatsApp</th>
                <th className="p-4">Papel</th>
                <th className="p-4 text-center w-16">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(user => {
                const isMe = user.uid === me?.uid;
                const isGestor = user.role === 'gestor';
                const style = ROLE_STYLE[user.role];
                return (
                  <tr key={user.uid} className={`hover:bg-slate-800/50 transition ${isMe ? 'bg-purple-500/10' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border shrink-0 ${style.badge}`}>
                          {initials(user.fullName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-200">{user.fullName}</span>
                            {isMe && <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold">você</span>}
                          </div>
                          <span className="text-[10px] text-slate-500 md:hidden">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 hidden md:table-cell">{user.email}</td>
                    <td className="p-4 text-slate-400 hidden md:table-cell">{user.whatsapp || '—'}</td>
                    <td className="p-4">
                      {isMe || isGestor ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={user.role}
                            disabled={updatingId === user.uid}
                            onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                            className={`appearance-none pr-7 pl-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer focus:outline-none ${style.badge}`}
                          >
                            <option value="comum"  className="bg-slate-900 text-slate-300">Cidadão</option>
                            <option value="adm"    className="bg-slate-900 text-slate-300">Administrador</option>
                          </select>
                          {updatingId === user.uid
                            ? <Loader2 className="absolute right-1.5 top-1.5 w-3 h-3 animate-spin opacity-60" />
                            : <ChevronDown className="absolute right-1.5 top-1.5 w-3 h-3 opacity-60 pointer-events-none" />
                          }
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {!isMe && !isGestor && (
                        confirmDelete === user.uid ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleDeleteUser(user.uid)} className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg font-bold hover:bg-rose-500/30 transition cursor-pointer">
                              Confirmar
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-[10px] bg-slate-800 text-slate-400 border border-white/10 px-2 py-1 rounded-lg font-bold hover:bg-slate-700 transition cursor-pointer">
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={updatingId === user.uid}
                            onClick={() => setConfirmDelete(user.uid)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition border border-white/5 cursor-pointer mx-auto block"
                            title="Remover usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Note */}
      <p className="text-[10px] text-slate-600 text-center">
        Gestores não podem ser promovidos ou removidos por este painel. &nbsp;·&nbsp; Alterações são aplicadas imediatamente.
      </p>
    </div>
  );
}
