import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Menu, X, Users, Info, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import BrandLogo from './BrandLogo';
import { ROLE_LABELS } from '../types';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Navbar({ activeView, onNavigate }: NavbarProps) {
  const { userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      await signOut();
      onNavigate('home');
    }
  };

  const navItems = [
    { id: 'sobre', label: 'Sobre', scrollTo: 'sobre' },
    { id: 'ajuda', label: 'Ajuda', scrollTo: 'ajuda' },
    { id: 'dashboard', label: 'Minhas Denúncias', requireAuth: true },
    { id: 'profile', label: 'Meu Perfil', requireAuth: true },
  ];

  const filteredItems = navItems.filter(item => {
    if (item.requireAuth && !userProfile) return false;
    return true;
  });

  const handleNavClick = (item: typeof navItems[number]) => {
    if (item.scrollTo) {
      if (activeView !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(item.id);
    }
  };

  const roleLabel = userProfile ? ROLE_LABELS[userProfile.role] : '';

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/85 backdrop-blur-md border-b border-brand-green/15 shadow-sm transition px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <BrandLogo className="h-8 md:h-10" />
        </button>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-2">
          {filteredItems.map(item => {
            if (item.id === 'sobre') return (
              <button
                key="sobre"
                onClick={() => handleNavClick(item)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-brand-green/40 text-slate-700 hover:border-brand-green hover:text-brand-green text-sm font-medium transition cursor-pointer"
              >
                <Info className="w-4 h-4" />
                Sobre
              </button>
            );
            if (item.id === 'ajuda') return (
              <button
                key="ajuda"
                onClick={() => handleNavClick(item)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-green hover:bg-emerald-700 text-white text-sm font-medium transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                Ajuda
              </button>
            );
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-200 cursor-pointer ${
                  activeView === item.id
                    ? 'text-brand-green bg-brand-green/10 border border-brand-green/20'
                    : 'text-slate-600 hover:text-brand-green hover:bg-brand-green/5 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Painel Admin (adm) */}
          {userProfile?.role === 'adm' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('admin')}
              className={`ml-2 px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                  : 'bg-brand-green/10 text-brand-green border-brand-green/25 hover:bg-brand-green/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Painel Admin</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
              </span>
            </motion.button>
          )}

          {/* Painel Gestor */}
          {userProfile?.role === 'gestor' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('gestor')}
              className={`ml-2 px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border cursor-pointer ${
                activeView === 'gestor'
                  ? 'bg-purple-500/15 text-purple-600 border-purple-500/30'
                  : 'bg-purple-500/10 text-purple-600 border-purple-500/25 hover:bg-purple-500/20'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gestão de Usuários</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
            </motion.button>
          )}

          {userProfile ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">{userProfile.fullName.split(' ')[0]}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{roleLabel}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg bg-slate-150 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition cursor-pointer border border-slate-200"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="ml-4 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green-hover hover:to-emerald-700 text-white font-semibold text-xs rounded-lg px-4 py-1.5 shadow-lg shadow-brand-green/15 transition cursor-pointer"
            >
              Acessar Portal
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center bg-brand-green/5 border border-brand-green/15 text-slate-700 hover:text-brand-green"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <React.Fragment>
          <div className="fixed inset-0 top-[60px] bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[60px] left-0 right-0 bg-white border-b border-brand-green/15 p-4 flex flex-col gap-3 z-50 md:hidden shadow-xl"
          >
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => { handleNavClick(item); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeView === item.id
                    ? 'text-brand-green bg-brand-green/5 border border-brand-green/20'
                    : 'text-slate-600 hover:text-brand-green hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {userProfile?.role === 'adm' && (
              <button
                onClick={() => { onNavigate('admin'); setIsOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-green/5 border border-brand-green/20 text-brand-green flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Painel Admin
              </button>
            )}

            {userProfile?.role === 'gestor' && (
              <button
                onClick={() => { onNavigate('gestor'); setIsOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold bg-purple-500/5 border border-purple-500/20 text-purple-600 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Gestão de Usuários
              </button>
            )}

            {userProfile ? (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green text-xs font-bold border border-brand-green/20">
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800">{userProfile.fullName}</span>
                    <span className="text-[10px] text-slate-500">{roleLabel}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-xs font-medium flex items-center gap-1 hover:bg-rose-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsOpen(false); onNavigate('login'); }}
                className="w-full text-center bg-gradient-to-r from-brand-green to-emerald-600 text-white font-semibold text-xs rounded-lg py-2.5 shadow-lg shadow-brand-green/15"
              >
                Acessar Portal
              </button>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </header>
  );
}
