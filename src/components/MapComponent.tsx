import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Info } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MY_GOOGLE_MAPS_PLATFORM_KEY';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, address: string) => void;
  readOnly?: boolean;
}

export const IGARASSU_CENTER = { lat: -7.8341, lng: -34.9061 };

const PRESET_BAIRROS = [
  { name: 'Centro', lat: -7.8341, lng: -34.9061 },
  { name: 'Cruz de Rebouças', lat: -7.8425, lng: -34.9189 },
  { name: 'Santo Antônio', lat: -7.8288, lng: -34.9015 },
  { name: 'Saramandaia', lat: -7.8472, lng: -34.9042 },
  { name: 'Campina de Feira', lat: -7.8177, lng: -34.8985 },
  { name: 'Inhamã', lat: -7.8302, lng: -34.9298 },
  { name: 'Cortegada', lat: -7.8590, lng: -34.9250 }
];

export default function MapComponent({ latitude, longitude, onChangeLocation, readOnly = false }: MapComponentProps) {
  const [bairroSelect, setBairroSelect] = useState('Centro');

  // Address lookup when neighborhood is changed locally
  const handleSelectBairro = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_BAIRROS.find(b => b.name === e.target.value);
    if (selected) {
      setBairroSelect(selected.name);
      onChangeLocation(
        selected.lat,
        selected.lng,
        `Av. Mal. Mascarenhas de Morais, ${selected.name}, Igarassu - PE`
      );
    }
  };

  // If real key is valid and parsed, render Google Maps
  if (hasValidKey) {
    return (
      <div className="w-full h-[320px] rounded-2zl overflow-hidden relative border border-white/10 shadow-lg">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={15}
            mapId="IGA_CONECTA_MAP"
            gestureHandling={readOnly ? 'none' : 'auto'}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            onClick={(e) => {
              if (readOnly || !e.detail.latLng) return;
              const { lat, lng } = e.detail.latLng;
              onChangeLocation(
                lat,
                lng,
                `Local selecionado no mapa (${lat.toFixed(4)}, ${lng.toFixed(4)})`
              );
            }}
          >
            <AdvancedMarker position={{ lat: latitude, lng: longitude }}>
              <Pin background="#008744" glyphColor="#fff" borderColor="#005a2d" />
            </AdvancedMarker>
          </Map>
        </APIProvider>
        {!readOnly && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur border border-white/10 px-3 py-2 rounded-lg text-xs text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Toque no mapa para ajustar a localização precisa.</span>
          </div>
        )}
      </div>
    );
  }

  // Elegant mockup simulation container if no real API key is entered
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        {/* Stylized vector map pattern */}
        <div className="absolute inset-0 opacity-15 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.3),rgba(255,255,255,0))]" />
          <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          {/* Curved visual grid lines to represent stylized roads */}
          <svg className="absolute inset-0 w-full h-full text-emerald-500/20 stroke-current stroke-[2px]" fill="none">
            <path d="M-100,50 Q100,100 200,50 T500,120" />
            <path d="M50,350 Q180,200 350,300 T800,200" />
            <path d="M200,-50 Q220,150 180,400" />
          </svg>
        </div>

        {/* Central visual indicator pins */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 animate-pulse">
            <MapPin className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Mapa de Parceria Local (Igarassu)</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              {readOnly ? 'Localização salva na denúncia' : 'Selecione abaixo para mover a marcação virtual:'}
            </p>
            <div className="mt-2 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded inline-block text-[11px] font-mono text-emerald-400">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 bg-white/5 backdrop-blur px-2 py-0.5 rounded text-[10px] text-slate-400 uppercase font-mono border border-white/5">
          Simulador Ativo
        </div>
      </div>

      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/40 backdrop-blur border border-white/5 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Selecione o Bairro Próximo</label>
            <select
              value={bairroSelect}
              onChange={handleSelectBairro}
              className="w-full bg-slate-900/90 text-sm text-slate-200 border border-white/10 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {PRESET_BAIRROS.map(b => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Passo de Configuração do Google Maps</label>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Para usar o mapa oficial do Google, configure a chave <code className="text-emerald-400">GOOGLE_MAPS_PLATFORM_KEY</code> na aba Configurações (Secrets) do painel lateral.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
