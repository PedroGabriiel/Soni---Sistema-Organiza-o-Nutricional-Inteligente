
import { Patient, Food, Meal, DietPlan, SubstitutionRule } from '@/types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com'
  },
  {
    id: '3',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com'
  },
  {
    id: '4',
    name: 'João Oliveira',
    email: 'joao.oliveira@email.com'
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
