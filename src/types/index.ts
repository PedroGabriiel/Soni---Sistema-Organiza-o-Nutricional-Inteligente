
export interface Patient {
  id: string;
  name: string;
  email: string;
  activationCode?: string;
  status?: string;
  details?: {
    age?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    gender?: string;
    goal?: string;
  };
}

export interface Food {
  id: string;
  name: string;
  quantity: string;
  category: 'protein' | 'carbs' | 'fruits' | 'vegetables' | 'fats';
}

export interface Meal {
  id: string;
  name: string;
  foods: Food[];
}

export interface DietPlan {
  id: string;
  patientId: string;
  meals: Meal[];
}

export interface DailyReport {
  id: string;
  patientId: string;
  date: string;
  adherence: 'complete' | 'partial' | 'none';
  notes: string;
  substitutions?: Array<{
    original: string;
    substituted: string;
    meal: string;
  }>;
}

export interface SubstitutionRule {
  id: string;
  category: string;
  foods: string[];
  canSubstituteWith: string[];
}

export interface AvaliacaoFisica {
  avaliacao_id: string;
  paciente_id: string;
  data_avaliacao: string;
  data?: string; // Alternative date field
  peso_kg: number;
  altura_cm: number;
  imc?: number;
  percentual_gordura?: number;
  massa_magra_kg?: number;
  massa_gorda_kg?: number;
  observacoes?: string;
}

export interface MedidasCorporais {
  medida_id: string;
  avaliacao_id: string;
  cintura?: number;
  quadril?: number;
  braco_relaxado_d?: number;
  braco_relaxado_e?: number;
  antebraco_d?: number;
  antebraco_e?: number;
  coxa_proximal_d?: number;
  coxa_proximal_e?: number;
  panturrilha_d?: number;
  panturrilha_e?: number;
  dobra_tricipital?: number;
  dobra_subescapular?: number;
  dobra_suprailiaca?: number;
  dobra_panturrilha?: number;
  // Alternative field names
  braco_direito?: number;
  braco_esquerdo?: number;
  coxa_direita?: number;
  coxa_esquerda?: number;
  panturrilha_direita?: number;
  panturrilha_esquerda?: number;
}

export interface DiarioAlimentarEntry {
  diario_id: string;
  paciente_id: string;
  data_hora: string;
  descricao: string;
}

export interface MetaNutricional {
  metas_id: string;
  nutriente: string;
  valor_minimo: number;
  valor_maximo: number;
  minimo?: number; // Alias para valor_minimo
  maximo?: number; // Alias para valor_maximo
  dieta_id: string;
}
