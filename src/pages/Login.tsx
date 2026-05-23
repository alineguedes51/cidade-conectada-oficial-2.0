import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail, Lock, User as UserIcon, Phone,
  Loader2, KeyRound, ArrowRight, Eye, EyeOff
} from 'lucide-react';

interface LoginProps {
  onNavigate: (view: string) => void;
  initialTab?: 'login' | 'signup';
}

export default function Login({ onNavigate, initialTab = 'login' }: LoginProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(initialTab === 'signup');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { showToast('Digite seu e-mail para receber o link de recuperação.', 'error'); return; }
    setLoading(true);
    try {
      await resetPassword(email);
      showToast('Link de recuperação enviado com sucesso!', 'success');
      setIsForgot(false);
    } catch (err: any) {
      showToast('Erro ao enviar link de recuperação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showToast('Preencha todos os campos obrigatórios.', 'error'); return; }
    setLoading(true);
    try {
      const { role } = await signIn(email, password);
      showToast('Login efetuado com sucesso!', 'success');
      if (role === 'adm') onNavigate('admin');
      else if (role === 'gestor') onNavigate('gestor');
      else onNavigate('dashboard');
    } catch (err: any) {
      showToast(err.message || 'E-mail ou senha incorretos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !whatsapp || !password || !confirmPassword) {
      showToast('Todos os campos são obrigatórios.', 'error'); return;
    }
    if (password !== confirmPassword) { showToast('As senhas não coincidem.', 'error'); return; }
    if (password.length < 6) { showToast('A senha deve ter no mínimo 6 caracteres.', 'error'); return; }
    setLoading(true);
    try {
      await signUp(fullName, email, whatsapp, password);
      showToast('Conta criada com sucesso!', 'success');
      onNavigate('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Falha ao registrar conta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      showToast('Login por Google falhou.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-12 p-1 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-3xl" />

      <div className="glass-panel rounded-3xl shadow-2xl p-6 relative overflow-hidden">

        {!isForgot && (
          <div className="flex border-b border-slate-100 mb-5 select-none justify-center">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider transition ${
                !isSignUp ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider transition ${
                isSignUp ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Criar Conta
            </button>
          </div>
        )}

        {isForgot ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center space-y-1 mb-5">
              <KeyRound className="w-10 h-10 text-blue-500 mx-auto animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recuperação de Senha</h3>
              <p className="text-[11px] text-slate-500 font-medium">Insira seu e-mail para receber uma redefinição</p>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">E-mail Cadastrado</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="exemplo@email.com" required />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Redefinição'}
            </button>
            <button type="button" onClick={() => setIsForgot(false)} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1 transition font-bold">
              Voltar ao Login
            </button>
          </form>

        ) : !isSignUp ? (

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">E-mail</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="seuemail@exemplo.com" required />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] text-slate-600 font-bold uppercase">Senha</label>
                <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] text-blue-600 hover:text-blue-800 font-bold transition hover:underline">
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="********" required />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15 transition cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Entrar no Portal</span><ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">ou entre com</span>
              <div className="flex-grow border-t border-slate-100" />
            </div>
            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full py-2.5 bg-white border border-blue-100 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.148-5.127 4.148-3.41 0-6.177-2.767-6.177-6.177V11.23c0-3.41 2.767-6.177 6.177-6.177 1.564 0 2.99.585 4.09 1.543l3.075-3.075C19.14 1.637 15.932.748 12.24.748 6.012.748.96 5.8 1.14 12.028s4.84 11.28 11.1 11.28c5.44 0 10.155-3.882 10.155-11.023 0-.648-.06-1.3-.18-1.92H12.24z" />
              </svg>
              <span>Entrar com o Google</span>
            </button>
          </form>

        ) : (

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">Nome Completo</label>
              <div className="relative">
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="Seu nome completo" required />
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">E-mail</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="exemplo@email.com" required />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">WhatsApp com DDD</label>
              <div className="relative">
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="(81) 99999-9999" required />
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">Senha</label>
              <div className="relative">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="Mínimo 6 caracteres" required />
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600 font-bold uppercase">Confirmar Senha</label>
              <div className="relative">
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="Confirme sua senha" required />
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15 transition cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Realizar Cadastro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
