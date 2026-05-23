import { supabase } from '../supabase/client';

export function formatDate(timestamp: any): string {
  if (!timestamp) return 'Disponível em breve';
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateProtocolCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return `IGA-2026-${code}`;
}

export const CATEGORY_MOCK_IMAGES: Record<string, string> = {
  entulho: 'https://images.unsplash.com/photo-1595275372297-f0d54fcc7480?q=80&w=600&auto=format&fit=crop',
  lampada: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?q=80&w=600&auto=format&fit=crop',
  buraco: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
  lixo: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop',
  vazamento: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=600&auto=format&fit=crop',
  esgoto: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop',
  outros: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
};

const SEED_REPORTS = [
  {
    protocol: 'IGA-2026-482103',
    userName: 'Carlos Silva',
    userWhatsapp: '(81) 98877-3322',
    description: 'Enorme cratera no meio da avenida atrapalhando tráfego de ônibus na entrada da via.',
    category: 'buraco',
    status: 'andamento',
    latitude: -7.8351,
    longitude: -34.9080,
    address: 'Av. Marechal Mascarenhas de Morais, Centro, Igarassu - PE',
  },
  {
    protocol: 'IGA-2026-119280',
    userName: 'Maria Medeiros',
    userWhatsapp: '(81) 99122-4411',
    description: 'Poste com lâmpada apagada há mais de uma semana, deixando a rua totalmente às escuras.',
    category: 'lampada',
    status: 'recebido',
    latitude: -7.8425,
    longitude: -34.9189,
    address: 'Rua da Aurora, Cruz de Rebouças, Igarassu - PE',
  },
  {
    protocol: 'IGA-2026-903123',
    userName: 'Roberto Souza',
    userWhatsapp: '(81) 98711-5500',
    description: 'Descarte irregular de móveis velhos e entulhos de construção na calçada pública.',
    category: 'entulho',
    status: 'analise',
    latitude: -7.8288,
    longitude: -34.9015,
    address: 'Avenida Joaquim Nabuco, Santo Antônio, Igarassu - PE',
  },
  {
    protocol: 'IGA-2026-661294',
    userName: 'Ana Bezerra',
    userWhatsapp: '(81) 99911-3344',
    description: 'Vazamento de água limpa jorrando do cano rompido na calçada. Desperdício enorme.',
    category: 'vazamento',
    status: 'resolvido',
    latitude: -7.8472,
    longitude: -34.9042,
    address: 'Rua Saramandaia, Saramandaia, Igarassu - PE',
  },
];

export async function seedInitialReportsIfEmpty(currentUserId: string) {
  try {
    const { count } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true });

    if ((count ?? 0) > 0) return;

    for (const report of SEED_REPORTS) {
      const reportId = Math.random().toString(36).substring(2, 9);
      await supabase.from('reports').insert({
        id: reportId,
        protocol: report.protocol,
        userId: currentUserId,
        userName: report.userName,
        userWhatsapp: report.userWhatsapp,
        description: report.description,
        photoUrl: CATEGORY_MOCK_IMAGES[report.category],
        category: report.category,
        status: report.status,
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Falha durante o seeding do Supabase:', err);
  }
}
