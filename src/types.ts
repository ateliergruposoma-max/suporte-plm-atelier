export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Concluído';

export interface Ticket {
  id: string;
  problem?: string;
  screen: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  solution?: string;
  adminResponse?: string;
  isUrgent?: boolean;
  resolvedAt?: string;
  inProgressAt?: string;
  referenceCode?: string;
  collection?: string;
  subScreen?: string;
  collaboratorName: string;
  responsibleName?: string;
}

export const SCREEN_OPTIONS = [
  { value: 'modelagem', label: 'Modelagem' },
  { value: 'ficha_tecnica', label: 'Ficha Técnica' },
  { value: 'indicadores', label: 'Indicadores' },
];

export const INDICATOR_OPTIONS = [
  { value: 'power_bi', label: 'Power BI' },
  { value: 'metabase', label: 'Metabase' },
];

export const COLLECTION_OPTIONS = [
  { value: 'VER27', label: 'VER27' },
  { value: 'INV26', label: 'INV26' },
];

export const RESPONSIBLE_OPTIONS = [
  { value: 'joao_salles', label: 'João Salles' },
  { value: 'josue_araujo', label: 'Josué Araujo' },
  { value: 'erick_theodoro', label: 'Erick Theodoro' },
];
