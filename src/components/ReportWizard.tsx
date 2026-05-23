import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import { ReportCategory, CATEGORY_LABELS } from '../types';
import { generateProtocolCode, CATEGORY_MOCK_IMAGES } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import MapComponent, { IGARASSU_CENTER } from './MapComponent';
import {
  MapPin, Trash, Check, Camera, Image as ImageIcon, Sparkles,
  ChevronLeft, ChevronRight, HelpCircle, Loader2, FileText, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportWizardProps {
  onSuccess: (reportId: string) => void;
  onCancel: () => void;
}

export default function ReportWizard({ onSuccess, onCancel }: ReportWizardProps) {
  const { userProfile, currentUser, signUp, signIn, signInWithGoogle, loginAsDemoAdmin } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [latitude, setLatitude] = useState(IGARASSU_CENTER.lat);
  const [longitude, setLongitude] = useState(IGARASSU_CENTER.lng);
  const [address, setAddress] = useState('Centro, Igarassu - PE');

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [description, setDescription] = useState('');

  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authError, setAuthError] = useState('');

  const [regName, setRegName] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleAutoGeolocate = () => {
    if ('geolocation' in navigator) {
      showToast('Obtendo sua localização via GPS...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress(`Rua localizada por GPS (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}), Igarassu - PE`);
          showToast('Localização obtida!', 'success');
        },
        () => showToast('Erro ao obter GPS automaticamente. Favor selecionar no mapa.', 'error')
      );
    } else {
      showToast('O GPS não está disponível no seu navegador.', 'error');
    }
  };

  const handleLocationChange = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      showToast('Imagem carregada com sucesso!', 'success');
    }
  };

  const handleCameraCapture = () => {
    showToast('Simulando captura instantânea da câmera...', 'info');
    setTimeout(() => {
      setPreviewUrl(CATEGORY_MOCK_IMAGES[category ?? 'outros']);
      showToast('Foto capturada pela câmera com sucesso!', 'success');
    }, 1200);
  };

  const handleSubmit = async (overrideAuth?: { uid: string; fullName: string; whatsapp: string }) => {
    const activeUser = overrideAuth || (currentUser && userProfile
      ? { uid: currentUser.id, fullName: userProfile.fullName, whatsapp: userProfile.whatsapp }
      : null);

    if (!activeUser) {
      showToast('Por favor, faça cadastro ou login para enviar.', 'error');
      return;
    }
    if (!category) {
      showToast('Por favor, selecione uma categoria.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const reportId = Math.random().toString(36).substring(2, 9);
      const protocol = generateProtocolCode();
      let photoUrl = CATEGORY_MOCK_IMAGES[category];

      if (selectedFile) {
        try {
          const path = `${reportId}/${selectedFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(path, selectedFile);
          if (!uploadError) {
            const { data } = supabase.storage.from('report-photos').getPublicUrl(path);
            photoUrl = data.publicUrl;
          }
        } catch {
          // fallback to mock image — storage may not be configured yet
        }
      } else if (previewUrl && !previewUrl.startsWith('blob:')) {
        photoUrl = previewUrl;
      }

      const { error } = await supabase.from('reports').insert({
        id: reportId,
        protocol,
        userId: activeUser.uid,
        userName: activeUser.fullName,
        userWhatsapp: activeUser.whatsapp,
        description: description.trim() || 'Sem descrição adicional.',
        photoUrl,
        category,
        status: 'recebido',
        latitude,
        longitude,
        address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (error) throw error;
      showToast(`Denúncia registrada com sucesso! Protocolo: ${protocol}`, 'success');
      onSuccess(reportId);
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao registrar sua denúncia. Tente novamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthAndSubmit = async () => {
    setAuthError('');
    if (authMode === 'signup') {
      if (!regName.trim()) { setAuthError('Por favor, digite seu nome completo.'); return; }
      if (!regWhatsapp.trim()) { setAuthError('Por favor, digite seu celular / WhatsApp.'); return; }
      if (!regEmail.trim()) { setAuthError('Por favor, digite seu e-mail.'); return; }
      if (regPassword.length < 6) { setAuthError('A senha precisa ter no mínimo 6 caracteres.'); return; }
      if (regPassword !== regConfirmPassword) { setAuthError('As senhas não coincidem.'); return; }

      setSubmitting(true);
      try {
        const user = await signUp(regName.trim(), regEmail.trim(), regWhatsapp.trim(), regPassword);
        await handleSubmit({ uid: user.id, fullName: user.fullName, whatsapp: user.whatsapp });
      } catch (err: any) {
        setAuthError(err.message || 'Ocorreu um erro ao criar a conta.');
        setSubmitting(false);
      }
    } else {
      if (!loginEmail.trim()) { setAuthError('Por favor, digite seu e-mail.'); return; }
      if (!loginPassword) { setAuthError('Por favor, digite sua senha.'); return; }

      setSubmitting(true);
      try {
        const user = await signIn(loginEmail.trim(), loginPassword);
        await handleSubmit({ uid: user.id, fullName: user.fullName, whatsapp: user.whatsapp });
      } catch (err: any) {
        setAuthError(err.message || 'E-mail ou senha inválidos.');
        setSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
      // Google OAuth faz redirect — o wizard será reaberto na volta
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao autenticar com conta Google.');
    }
  };

  const handleDemoAdminSignIn = async () => {
    setAuthError('');
    try {
      await loginAsDemoAdmin();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await handleSubmit({ uid: user.id, fullName: 'Administrador Igarassu', whatsapp: '(81) 99999-9999' });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao carregar credencial administrativa.');
    }
  };

  const isGuest = !currentUser;
  const maxSteps = isGuest ? 5 : 4;

  const stepsList = isGuest
    ? [
        { num: 1, title: 'Localização' },
        { num: 2, title: 'Categoria' },
        { num: 3, title: 'Foto' },
        { num: 4, title: 'Descrição' },
        { num: 5, title: 'Identificação' },
      ]
    : [
        { num: 1, title: 'Localização' },
        { num: 2, title: 'Categoria' },
        { num: 3, title: 'Foto' },
        { num: 4, title: 'Descrição' },
      ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-brand-green/10 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 blur-3xl pointer-events-none rounded-full" />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 text-slate-500">
          <span className="text-xs uppercase font-mono tracking-wider font-semibold">Passo {step} de {maxSteps}</span>
          <button
            disabled={submitting}
            onClick={onCancel}
            className="text-xs text-rose-500 hover:text-rose-600 transition cursor-pointer font-semibold"
          >
            Cancelar Registro
          </button>
        </div>
        <div className="flex gap-2.5">
          {stepsList.map(s => (
            <div key={s.num} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 bg-brand-green transition-all duration-300"
                style={{ width: s.num <= step ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[290px]"
        >
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Etapa 1 — Localização</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define onde está localizado o problema para as equipes</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGeolocate}
                  className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 border border-brand-green/20 transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pontuar GPS Atual</span>
                </button>
              </div>
              <MapComponent latitude={latitude} longitude={longitude} onChangeLocation={handleLocationChange} />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Endereço de Acompanhamento</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green"
                  placeholder="Endereço aproximado ou detalhes"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Etapa 2 — Categoria do Problema</h3>
                <p className="text-xs text-slate-500 mt-0.5">Escolha o setor público competente para essa zeladoria</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const isSelected = category === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key as ReportCategory)}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand-green/10 text-brand-green border-brand-green/30 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-brand-green/15'
                      }`}
                    >
                      <Sparkles className={`w-5 h-5 ${isSelected ? 'text-brand-green animate-pulse' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Etapa 3 — Registro Fotográfico</h3>
                <p className="text-xs text-slate-500 mt-0.5">Uma imagem nítida acelera a triagem das secretarias públicas</p>
              </div>
              <div className="border border-dashed border-brand-green/20 hover:border-brand-green/35 rounded-2xl p-6 bg-slate-50 transition flex flex-col items-center justify-center min-h-[180px] text-center relative overflow-hidden group">
                {previewUrl ? (
                  <div className="space-y-3">
                    <img src={previewUrl} alt="Preview" className="max-h-[140px] rounded-lg object-contain border border-brand-green/10 shadow-lg mx-auto" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex items-center gap-1 transition mx-auto"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      <span>Remover Imagem</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/15 mx-auto text-brand-green">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Abra ou anexe fotos do problema</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Formatos suportados: PNG, JPG, JPEG</p>
                    </div>
                    <div className="flex gap-2 justify-center pt-2">
                      <label className="px-3.5 py-1.5 bg-white border border-brand-green/20 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                        <ImageIcon className="w-4 h-4 text-brand-green" />
                        <span>Procurar Arquivo</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={handleCameraCapture}
                        className="px-3.5 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-bold text-xs border border-brand-green/20 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Simular Câmera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {!previewUrl && (
                <div className="bg-brand-green/5 border border-brand-green/10 rounded-xl p-3 text-brand-green text-xs flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Dica: Caso não possua foto, atribuímos automaticamente uma imagem de referência ao salvar.</span>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Etapa 4 — Relatório do Problema</h3>
                <p className="text-xs text-slate-500 mt-0.5">Adicione observações ou pontos de referência adicionais importantes</p>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Informação Detalhada</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={1500}
                  className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-1 focus:ring-brand-green"
                  placeholder="Ex: Próximo à padaria municipal, vazamento de grande porte ocorrendo na calçada..."
                />
                <span className="block text-right text-[10px] text-slate-400 font-mono">{description.length}/1500 caracteres</span>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 font-sans">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Etapa Final — Identificação do Cidadão</h3>
                <p className="text-xs text-slate-500 mt-0.5">Crie sua conta rápida ou acesse para submeter e acompanhar no painel.</p>
              </div>
              <div className="flex border border-brand-green/15 bg-slate-50 p-1 rounded-xl">
                {(['signup', 'login'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setAuthMode(mode); setAuthError(''); }}
                    className={`flex-grow py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      authMode === mode ? 'bg-brand-green text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {mode === 'signup' ? 'Registrar Nova Conta' : 'Já tenho Cadastro'}
                  </button>
                ))}
              </div>
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">{authError}</div>
              )}
              {authMode === 'signup' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Nome Completo</label>
                      <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="Ex: João da Silva" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">WhatsApp</label>
                      <input type="text" value={regWhatsapp} onChange={(e) => setRegWhatsapp(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="(81) 99148-6149" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">E-mail</label>
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="seuemail@exemplo.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Senha</label>
                      <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="Mínimo 6 caracteres" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Confirmar Senha</label>
                      <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="Repita sua senha" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">E-mail</label>
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="seuemail@exemplo.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Senha</label>
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-brand-green/15 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-green" placeholder="Sua senha secreta de acesso" />
                  </div>
                </div>
              )}
              <div>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-100" />
                  <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Ou faça login rápido</span>
                  <div className="flex-grow border-t border-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button type="button" onClick={handleGoogleSignIn} className="py-2.5 px-3 bg-white border border-brand-green/20 text-xs font-bold text-slate-700 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer">
                    <span>Google</span>
                  </button>
                  <button type="button" onClick={handleDemoAdminSignIn} className="py-2.5 px-3 bg-rose-50/50 border border-rose-100 text-xs font-bold text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-100/50 transition cursor-pointer">
                    Demonstração Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="border-t border-slate-100 pt-5 mt-6 flex justify-between items-center bg-white relative z-20 font-sans">
        {step > 1 ? (
          <button type="button" disabled={submitting} onClick={() => setStep(prev => prev - 1)} className="px-4 py-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-transparent">
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        ) : <div />}

        {step < maxSteps ? (
          <button
            type="button"
            onClick={() => {
              if (step === 2 && !category) { showToast('Selecione uma categoria para prosseguir.', 'error'); return; }
              setStep(prev => prev + 1);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green-hover hover:to-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg shadow-brand-green/15 transition-all cursor-pointer ml-auto"
          >
            <span>Avançar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={isGuest ? handleAuthAndSubmit : () => handleSubmit()}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green-hover hover:to-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-brand-green/20 transition-all cursor-pointer ml-auto"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Enviando dados...</span></>
            ) : (
              <><Check className="w-4 h-4" /><span>{isGuest ? 'Finalizar e Enviar' : 'Salvar Registro'}</span></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
