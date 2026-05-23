export type UserRole = 'comum' | 'adm' | 'gestor';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  createdAt: any;
}

export type ReportCategory = 'entulho' | 'lampada' | 'buraco' | 'lixo' | 'vazamento' | 'esgoto' | 'outros';

export type ReportStatus = 'recebido' | 'analise' | 'andamento' | 'resolvido';

export interface Report {
  id: string;
  protocol: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  description: string;
  photoUrl: string;
  category: ReportCategory;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: any;
  updatedAt: any;
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  entulho: 'Entulho',
  lampada: 'Iluminação Pública',
  buraco: 'Buraco na Via',
  lixo: 'Lixo / Descarte Irregular',
  vazamento: 'Vazamento de Água',
  esgoto: 'Esgoto / Saneamento',
  outros: 'Outros Problemas'
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  recebido: 'Recebido',
  analise: 'Em Análise',
  andamento: 'Em Andamento',
  resolvido: 'Resolvido'
};

export const STATUS_COLORS: Record<ReportStatus, { bg: string; text: string; border: string }> = {
  recebido: { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/20' },
  analise: { bg: 'bg-amber-600/10', text: 'text-amber-700', border: 'border-amber-500/20' },
  andamento: { bg: 'bg-indigo-600/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
  resolvido: { bg: 'bg-emerald-600/10', text: 'text-emerald-700', border: 'border-emerald-500/20' }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  comum: 'Cidadão',
  adm: 'Prefeitura',
  gestor: 'Gestor'
};
