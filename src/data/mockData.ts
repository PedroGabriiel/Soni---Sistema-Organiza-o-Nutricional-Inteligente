
import { Patient, Food, Meal, DietPlan, SubstitutionRule } from '@/types';

export const mockPatients: Patient[] = [
  {
    id: '2',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    status: 'ativo',
    details: {
      age: 32,
      weight: 68,
      height: 165,
      bmi: 24.9,
      gender: 'Feminino',
      goal: 'Perda de peso'
    }
  },
  {
    id: '1',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    status: 'ativo',
    details: {
      age: 45,
      weight: 85,
      height: 178,
      bmi: 26.8,
      gender: 'Masculino',
      goal: 'Manutenção'
    }
  },
  {
    id: '3',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    status: 'ativo',
    details: {
      age: 28,
      weight: 62,
      height: 170,
      bmi: 21.5,
      gender: 'Feminino',
      goal: 'Ganho de massa'
    }
  },
  {
    id: '4',
    name: 'João Oliveira',
    email: 'joao.oliveira@email.com',
    status: 'pendente',
    details: {
      age: 38,
      weight: 92,
      height: 182,
      bmi: 27.8,
      gender: 'Masculino',
      goal: 'Perda de peso'
    }
  }
];

export const mockFoods: Food[] = [
  { id: '1', name: 'Frango grelhado', quantity: '100g', category: 'protein' },
  { id: '2', name: 'Tilápia', quantity: '120g', category: 'protein' },
  { id: '3', name: 'Patinho moído', quantity: '100g', category: 'protein' },
  { id: '4', name: 'Whey Protein', quantity: '1 scoop', category: 'protein' },
  { id: '5', name: 'Mamão', quantity: '1 fatia', category: 'fruits' },
  { id: '6', name: 'Maçã', quantity: '1 unidade', category: 'fruits' },
  { id: '7', name: 'Banana', quantity: '1 unidade', category: 'fruits' },
  { id: '8', name: 'Melancia', quantity: '1 fatia', category: 'fruits' },
  { id: '9', name: 'Arroz integral', quantity: '3 colheres', category: 'carbs' },
  { id: '10', name: 'Batata doce', quantity: '100g', category: 'carbs' },
  { id: '11', name: 'Pão integral', quantity: '2 fatias', category: 'carbs' },
  { id: '12', name: 'Ovos mexidos', quantity: '2 unidades', category: 'protein' },
  { id: '13', name: 'Café', quantity: '1 xícara', category: 'beverages' }
];

export const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Café da Manhã',
    foods: [
      { id: '5', name: 'Mamão', quantity: '1 fatia', category: 'fruits' },
      { id: '12', name: 'Ovos mexidos', quantity: '2 unidades', category: 'protein' },
      { id: '13', name: 'Café', quantity: '1 xícara', category: 'beverages' }
    ]
  },
  {
    id: '2',
    name: 'Almoço',
    foods: [
      { id: '1', name: 'Frango grelhado', quantity: '100g', category: 'protein' },
      { id: '9', name: 'Arroz integral', quantity: '3 colheres', category: 'carbs' }
    ]
  },
  {
    id: '3',
    name: 'Jantar',
    foods: [
      { id: '2', name: 'Tilápia', quantity: '120g', category: 'protein' },
      { id: '10', name: 'Batata doce', quantity: '100g', category: 'carbs' }
    ]
  }
];

export const mockDietPlan: DietPlan = {
  id: '1',
  patientId: '1',
  meals: mockMeals
};

export const mockSubstitutionRules: SubstitutionRule[] = [
  {
    id: '1',
    category: 'Proteínas',
    foods: ['Frango', 'Peixe', 'Ovos', 'Tofu'],
    canSubstituteWith: ['Frango grelhado', 'Tilápia', 'Patinho moído', 'Whey Protein']
  },
  {
    id: '2',
    category: 'Frutas',
    foods: ['Maçã', 'Banana', 'Mamão', 'Melancia'],
    canSubstituteWith: ['Maçã', 'Banana', 'Mamão', 'Melancia']
  },
  {
    id: '3',
    category: 'Carboidratos',
    foods: ['Arroz integral', 'Batata doce', 'Pão integral'],
    canSubstituteWith: ['Arroz integral', 'Batata doce', 'Pão integral']
  }
];

export const generateActivationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return `SONI-${segments.join('-')}`;
};

// Mock data for daily reports
export const mockDailyReports = [
  {
    id: '1',
    patientId: '1',
    date: '2025-11-15',
    adherence: 'complete' as const,
    notes: 'Segui a dieta perfeitamente hoje. Me senti muito bem!',
    substitutions: []
  },
  {
    id: '2',
    patientId: '1',
    date: '2025-11-16',
    adherence: 'partial' as const,
    notes: 'Tive que substituir o frango por peixe no almoço.',
    substitutions: [
      { original: 'Frango grelhado', substituted: 'Tilápia', meal: 'Almoço' }
    ]
  },
  {
    id: '3',
    patientId: '1',
    date: '2025-11-17',
    adherence: 'complete' as const,
    notes: 'Dia excelente! Consegui seguir todas as refeições.',
    substitutions: []
  },
  {
    id: '4',
    patientId: '1',
    date: '2025-11-18',
    adherence: 'partial' as const,
    notes: 'Substituí a batata doce por arroz integral.',
    substitutions: [
      { original: 'Batata doce', substituted: 'Arroz integral', meal: 'Jantar' }
    ]
  }
];

// Mock data for weight tracking
export const mockWeightData = [
  { date: 'Set', weight: 72 },
  { date: 'Out', weight: 70 },
  { date: 'Nov', weight: 68 }
];

// Mock data for adherence tracking
export const mockAdherenceData = [
  { week: 'Sem 1', adherence: 85 },
  { week: 'Sem 2', adherence: 92 },
  { week: 'Sem 3', adherence: 88 },
  { week: 'Sem 4', adherence: 89 }
];

// Mock data for physical assessments - Ana Silva
export const mockAvaliacoesFisicas = [
  {
    avaliacao_id: '1',
    paciente_id: '2',
    data_avaliacao: '2025-09-15',
    data: '2025-09-15',
    peso_kg: 72.5,
    altura_cm: 165,
    imc: 26.6,
    percentual_gordura: 28.5,
    massa_magra_kg: 51.8,
    massa_gorda_kg: 20.7,
    observacoes: 'Primeira avaliação - Ana Silva'
  },
  {
    avaliacao_id: '2',
    paciente_id: '2',
    data_avaliacao: '2025-10-15',
    data: '2025-10-15',
    peso_kg: 70.2,
    altura_cm: 165,
    imc: 25.8,
    percentual_gordura: 26.2,
    massa_magra_kg: 51.8,
    massa_gorda_kg: 18.4,
    observacoes: 'Boa evolução - Redução de gordura corporal'
  },
  {
    avaliacao_id: '3',
    paciente_id: '2',
    data_avaliacao: '2025-11-15',
    data: '2025-11-15',
    peso_kg: 68.8,
    altura_cm: 165,
    imc: 25.3,
    percentual_gordura: 24.8,
    massa_magra_kg: 51.7,
    massa_gorda_kg: 17.1,
    observacoes: 'Excelente progresso - Mantendo massa magra'
  }
];

// Mock data for body measurements - Ana Silva
export const mockMedidasCorporais = [
  {
    medida_id: '1',
    avaliacao_id: '1',
    cintura: 82,
    quadril: 98,
    braco_relaxado_d: 28.5,
    braco_relaxado_e: 28.0,
    antebraco_d: 24.0,
    antebraco_e: 23.8,
    coxa_proximal_d: 56.0,
    coxa_proximal_e: 55.5,
    panturrilha_d: 36.0,
    panturrilha_e: 36.2,
    dobra_tricipital: 18,
    dobra_subescapular: 22,
    dobra_suprailiaca: 25,
    dobra_panturrilha: 20
  },
  {
    medida_id: '2',
    avaliacao_id: '2',
    cintura: 79,
    quadril: 97,
    braco_relaxado_d: 27.8,
    braco_relaxado_e: 27.5,
    antebraco_d: 23.8,
    antebraco_e: 23.6,
    coxa_proximal_d: 54.5,
    coxa_proximal_e: 54.0,
    panturrilha_d: 35.5,
    panturrilha_e: 35.8,
    dobra_tricipital: 16,
    dobra_subescapular: 20,
    dobra_suprailiaca: 22,
    dobra_panturrilha: 18
  },
  {
    medida_id: '3',
    avaliacao_id: '3',
    cintura: 76,
    quadril: 96,
    braco_relaxado_d: 27.2,
    braco_relaxado_e: 27.0,
    antebraco_d: 23.5,
    antebraco_e: 23.4,
    coxa_proximal_d: 53.0,
    coxa_proximal_e: 52.8,
    panturrilha_d: 35.0,
    panturrilha_e: 35.2,
    dobra_tricipital: 14,
    dobra_subescapular: 18,
    dobra_suprailiaca: 20,
    dobra_panturrilha: 16
  }
];

// Mock data for food diary
export const mockDiarioAlimentar = [
  { id: '1', paciente_id: '1', data: '2025-09-15', registrado: true },
  { id: '2', paciente_id: '1', data: '2025-09-16', registrado: true },
  { id: '3', paciente_id: '1', data: '2025-09-17', registrado: true },
  { id: '4', paciente_id: '1', data: '2025-09-18', registrado: false },
  { id: '5', paciente_id: '1', data: '2025-09-19', registrado: true },
  { id: '6', paciente_id: '1', data: '2025-09-20', registrado: true },
  { id: '7', paciente_id: '1', data: '2025-09-21', registrado: true },
  { id: '8', paciente_id: '1', data: '2025-09-22', registrado: true },
  { id: '9', paciente_id: '1', data: '2025-09-23', registrado: true },
  { id: '10', paciente_id: '1', data: '2025-09-24', registrado: true },
  { id: '11', paciente_id: '1', data: '2025-09-25', registrado: true },
  { id: '12', paciente_id: '1', data: '2025-09-26', registrado: false },
  { id: '13', paciente_id: '1', data: '2025-09-27', registrado: true },
  { id: '14', paciente_id: '1', data: '2025-09-28', registrado: true },
  { id: '15', paciente_id: '1', data: '2025-09-29', registrado: true },
  { id: '16', paciente_id: '1', data: '2025-09-30', registrado: true },
  { id: '17', paciente_id: '1', data: '2025-10-01', registrado: true },
  { id: '18', paciente_id: '1', data: '2025-10-02', registrado: true },
  { id: '19', paciente_id: '1', data: '2025-10-03', registrado: true },
  { id: '20', paciente_id: '1', data: '2025-10-04', registrado: true },
  { id: '21', paciente_id: '1', data: '2025-10-05', registrado: true },
  { id: '22', paciente_id: '1', data: '2025-10-06', registrado: true },
  { id: '23', paciente_id: '1', data: '2025-10-07', registrado: true },
  { id: '24', paciente_id: '1', data: '2025-10-08', registrado: true },
  { id: '25', paciente_id: '1', data: '2025-10-09', registrado: true },
  { id: '26', paciente_id: '1', data: '2025-10-10', registrado: true },
  { id: '27', paciente_id: '1', data: '2025-10-11', registrado: true },
  { id: '28', paciente_id: '1', data: '2025-10-12', registrado: false },
  { id: '29', paciente_id: '1', data: '2025-10-13', registrado: true },
  { id: '30', paciente_id: '1', data: '2025-10-14', registrado: true },
  { id: '31', paciente_id: '1', data: '2025-10-15', registrado: true },
  { id: '32', paciente_id: '1', data: '2025-10-16', registrado: true },
  { id: '33', paciente_id: '1', data: '2025-10-17', registrado: true },
  { id: '34', paciente_id: '1', data: '2025-10-18', registrado: true },
  { id: '35', paciente_id: '1', data: '2025-10-19', registrado: true },
  { id: '36', paciente_id: '1', data: '2025-10-20', registrado: true },
  { id: '37', paciente_id: '1', data: '2025-10-21', registrado: true },
  { id: '38', paciente_id: '1', data: '2025-10-22', registrado: true },
  { id: '39', paciente_id: '1', data: '2025-10-23', registrado: true },
  { id: '40', paciente_id: '1', data: '2025-10-24', registrado: true },
  { id: '41', paciente_id: '1', data: '2025-10-25', registrado: true },
  { id: '42', paciente_id: '1', data: '2025-10-26', registrado: true },
  { id: '43', paciente_id: '1', data: '2025-10-27', registrado: true },
  { id: '44', paciente_id: '1', data: '2025-10-28', registrado: true },
  { id: '45', paciente_id: '1', data: '2025-10-29', registrado: true },
  { id: '46', paciente_id: '1', data: '2025-10-30', registrado: true },
  { id: '47', paciente_id: '1', data: '2025-10-31', registrado: true },
  { id: '48', paciente_id: '1', data: '2025-11-01', registrado: true },
  { id: '49', paciente_id: '1', data: '2025-11-02', registrado: true },
  { id: '50', paciente_id: '1', data: '2025-11-03', registrado: true },
  { id: '51', paciente_id: '1', data: '2025-11-04', registrado: true },
  { id: '52', paciente_id: '1', data: '2025-11-05', registrado: true },
  { id: '53', paciente_id: '1', data: '2025-11-06', registrado: true },
  { id: '54', paciente_id: '1', data: '2025-11-07', registrado: true },
  { id: '55', paciente_id: '1', data: '2025-11-08', registrado: true },
  { id: '56', paciente_id: '1', data: '2025-11-09', registrado: true },
  { id: '57', paciente_id: '1', data: '2025-11-10', registrado: true },
  { id: '58', paciente_id: '1', data: '2025-11-11', registrado: true },
  { id: '59', paciente_id: '1', data: '2025-11-12', registrado: true },
  { id: '60', paciente_id: '1', data: '2025-11-13', registrado: true },
  { id: '61', paciente_id: '1', data: '2025-11-14', registrado: true },
  { id: '62', paciente_id: '1', data: '2025-11-15', registrado: true },
  { id: '63', paciente_id: '1', data: '2025-11-16', registrado: true },
  { id: '64', paciente_id: '1', data: '2025-11-17', registrado: true },
  { id: '65', paciente_id: '1', data: '2025-11-18', registrado: true },
  { id: '66', paciente_id: '1', data: '2025-11-19', registrado: true },
  { id: '67', paciente_id: '1', data: '2025-11-20', registrado: true }
];
