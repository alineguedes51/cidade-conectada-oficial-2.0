import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Report } from '../types';

// @ts-ignore
import bgImage from "../assets/images/logo-cidade-conectada.png.png";

import {
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Mail,
  Plus,
  Search,
  HelpCircle,
  Info,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string) => void;
  reports: Report[];
}

export default function Home({ onNavigate }: HomeProps) {
  const { userProfile } = useAuth();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="fixed inset-0 bg-cover bg-center blur-[2px] scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* OVERLAY */}
      <div className="fixed inset-0 bg-white/75 backdrop-blur-sm" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* HERO */}
        <section className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[34px] p-8 lg:p-14 shadow-2xl">

          <div className="max-w-4xl space-y-8">

            {/* BADGE */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/15 text-brand-green text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              Cidade Conectada
            </div>

            {/* TITLE */}
            <div className="space-y-5">

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-800">
                Trabalhando por uma
                <br />

                <span className="bg-gradient-to-r from-brand-green to-emerald-500 bg-clip-text text-transparent">
                  Cidade Conectada
                </span>
              </h1>

              <p className="text-slate-600 text-base lg:text-lg leading-relaxed max-w-3xl">
                Plataforma desenvolvida para facilitar registros urbanos
                como buracos, iluminação pública, vazamentos, entulho
                e problemas de infraestrutura urbana em Igarassu.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">

              {/* REGISTRO */}
              <button
                onClick={() => onNavigate('report-wizard')}
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-brand-green/20 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />

                <span>Começar Registro</span>

                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* ACOMPANHAR */}
              <button
                onClick={() =>
                  onNavigate(userProfile ? 'dashboard' : 'login')
                }
                className="px-8 py-4 rounded-2xl bg-white border border-brand-green/20 text-brand-green hover:bg-brand-green/5 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-sm"
              >
                <Search className="w-4 h-4 text-white bg-brand-green rounded-full p-[2px]" />

                <span>Acompanhar Registro</span>
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-800">
                Registro Rápido
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                Registre problemas urbanos com foto,
                descrição e localização em poucos minutos.
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <MapPin className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-800">
                Localização Inteligente
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                Marque exatamente onde o problema ocorreu
                usando mapa interativo e geolocalização.
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-800">
                Acompanhamento
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                Consulte seus registros e acompanhe
                atualizações das ocorrências urbanas.
              </p>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section
          id="sobre"
          className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[30px] p-6 md:p-8 shadow-xl space-y-5"
        >

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <Info className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-800">
                Sobre o Projeto
              </h2>

              <p className="text-sm text-slate-500">
                Plataforma educacional e experimental
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              O Cidade Conectada é um projeto criado por alunos do
              CEI Cecília Maria Vaz Curado Ribeiro com objetivo
              de incentivar cidadania digital, tecnologia e inovação urbana.
            </p>

            <p>
              A proposta da plataforma é permitir que cidadãos registrem
              problemas urbanos como buracos, iluminação pública,
              vazamentos e outras ocorrências de infraestrutura.
            </p>
          </div>
        </section>

        {/* AJUDA */}
        <section
          id="ajuda"
          className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[30px] p-6 md:p-8 shadow-xl space-y-8"
        >

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <HelpCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-800">
                Central de Ajuda
              </h2>

              <p className="text-sm text-slate-500">
                Dúvidas frequentes e canais de atendimento
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4">

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">
                Como faço um registro?
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Clique em “Começar Registro”, informe o problema,
                adicione localização, foto e descrição da ocorrência.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">
                Preciso criar uma conta?
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Sim. O login permite acompanhar seus registros,
                visualizar atualizações e manter suas informações seguras.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">
                O site é oficial da Prefeitura?
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Não. Esta plataforma é um projeto educacional desenvolvido
                por alunos do CEI Cecília Maria Vaz Curado Ribeiro.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">
                Como acompanho minha solicitação?
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Após realizar login, você poderá visualizar o andamento
                do registro diretamente pelo painel da plataforma.
              </p>
            </div>
          </div>

          {/* CONTATOS */}
          <div className="pt-4">

            <h3 className="text-lg font-extrabold text-slate-800 mb-5">
              Secretaria da Cidade
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-brand-green">
                  <Phone className="w-5 h-5" />

                  <span className="font-bold">
                    WhatsApp
                  </span>
                </div>

                <p className="text-slate-700">
                  (81) 9 9148-6149
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-brand-green">
                  <MapPin className="w-5 h-5" />

                  <span className="font-bold">
                    Endereço
                  </span>
                </div>

                <p className="text-slate-700">
                  Av. Joaquim Nabuco, nº 151,
                  Centro - Igarassu/PE
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-brand-green">
                  <Clock className="w-5 h-5" />

                  <span className="font-bold">
                    Horário
                  </span>
                </div>

                <p className="text-slate-700">
                  Segunda a sexta-feira:
                  07:00 às 13:00
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-brand-green">
                  <Mail className="w-5 h-5" />

                  <span className="font-bold">
                    E-mail
                  </span>
                </div>

                <p className="text-slate-700 break-all">
                  secretariadacidade@igarassu.pe.gov.br
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}