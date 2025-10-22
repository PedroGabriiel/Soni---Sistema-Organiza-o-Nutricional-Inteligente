
export interface Patient {
  id: string;
  name: string;
  email: string;
  activationCode?: string;
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
}

export interface SubstitutionRule {
  id: string;
  category: string;
  foods: string[];
  canSubstituteWith: string[];
}
