// Clinical calculation utilities
import { AvaliacaoFisica, MedidasCorporais } from '@/types';

export interface BodyComposition {
  date: string;
  leanMass: number;
  fatMass: number;
  totalWeight: number;
  fatPercentage: number;
}

export interface SymmetryData {
  measurement: string;
  left: number;
  right: number;
  asymmetry: number;
}

export interface NutrientDeviation {
  nutriente: string;
  atual: number;
  minimo: number;
  maximo: number;
  desvio: number;
  status: 'low' | 'good' | 'high';
}

/**
 * Calculate Body Density using Petroski (1995) equation
 */
export function calculateBodyDensity(
  sum4: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 1.10726863 - (0.00081201 * sum4) + (0.00000212 * Math.pow(sum4, 2)) - (0.00041761 * age);
  } else {
    return 1.19547130 - (0.07513507 * Math.log10(sum4)) - (0.00041072 * age);
  }
}

/**
 * Calculate Fat Percentage using Siri equation
 */
export function calculateFatPercentage(density: number): number {
  return ((4.95 / density) - 4.50) * 100;
}

/**
 * Calculate body composition from physical assessment and measurements
 */
export function calculateBodyComposition(
  avaliacao: AvaliacaoFisica,
  medidas: MedidasCorporais,
  age: number,
  gender: 'male' | 'female'
): BodyComposition {
  const sum4 = (medidas.dobra_subescapular || 0) + 
               (medidas.dobra_tricipital || 0) + 
               (medidas.dobra_suprailiaca || 0) + 
               (medidas.dobra_panturrilha || 0);

  // If we don't have skinfold data, use a default estimation
  let fatPercentage = 25; // Default
  
  if (sum4 > 0) {
    const density = calculateBodyDensity(sum4, age, gender);
    fatPercentage = calculateFatPercentage(density);
  }

  const fatMass = (avaliacao.peso_kg * fatPercentage) / 100;
  const leanMass = avaliacao.peso_kg - fatMass;

  return {
    date: avaliacao.data,
    leanMass: parseFloat(leanMass.toFixed(2)),
    fatMass: parseFloat(fatMass.toFixed(2)),
    totalWeight: avaliacao.peso_kg,
    fatPercentage: parseFloat(fatPercentage.toFixed(1))
  };
}

/**
 * Calculate Waist-to-Hip Ratio (WHR)
 */
export function calculateWHR(cintura: number, quadril: number): number {
  return parseFloat((cintura / quadril).toFixed(3));
}

/**
 * Assess cardiovascular risk based on WHR
 */
export function assessCardiovascularRisk(
  whr: number,
  gender: 'male' | 'female'
): 'low' | 'high' {
  if (gender === 'male') {
    return whr > 1.0 ? 'high' : 'low';
  } else {
    return whr > 0.85 ? 'high' : 'low';
  }
}

/**
 * Calculate adherence streak from diary entries
 */
export function calculateAdherenceStreak(entries: Array<{ data_hora: string }>): number {
  if (entries.length === 0) return 0;

  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const currentDate = new Date(sortedEntries[0].data_hora);
  currentDate.setHours(0, 0, 0, 0);

  // Check if the most recent entry is today or yesterday
  const daysDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0; // Streak broken

  const dateSet = new Set(
    sortedEntries.map(e => {
      const d = new Date(e.data_hora);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    })
  );

  const checkDate = new Date(today);
  while (true) {
    checkDate.setHours(0, 0, 0, 0);
    if (dateSet.has(checkDate.toISOString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Prepare symmetry data for butterfly chart
 */
export function prepareSymmetryData(medidas: MedidasCorporais): SymmetryData[] {
  const measurements: SymmetryData[] = [];

  if (medidas.braco_relaxado_d && medidas.braco_relaxado_e) {
    measurements.push({
      measurement: 'Braço',
      left: medidas.braco_relaxado_e,
      right: medidas.braco_relaxado_d,
      asymmetry: Math.abs(medidas.braco_relaxado_d - medidas.braco_relaxado_e)
    });
  }

  if (medidas.antebraco_d && medidas.antebraco_e) {
    measurements.push({
      measurement: 'Antebraço',
      left: medidas.antebraco_e,
      right: medidas.antebraco_d,
      asymmetry: Math.abs(medidas.antebraco_d - medidas.antebraco_e)
    });
  }

  if (medidas.coxa_proximal_d && medidas.coxa_proximal_e) {
    measurements.push({
      measurement: 'Coxa',
      left: medidas.coxa_proximal_e,
      right: medidas.coxa_proximal_d,
      asymmetry: Math.abs(medidas.coxa_proximal_d - medidas.coxa_proximal_e)
    });
  }

  if (medidas.panturrilha_d && medidas.panturrilha_e) {
    measurements.push({
      measurement: 'Panturrilha',
      left: medidas.panturrilha_e,
      right: medidas.panturrilha_d,
      asymmetry: Math.abs(medidas.panturrilha_d - medidas.panturrilha_e)
    });
  }

  return measurements;
}

/**
 * Calculate normalized deviation from nutrient target range
 */
export function calculateNormalizedDeviation(
  atual: number,
  minimo: number,
  maximo: number,
  nutriente: string
): NutrientDeviation {
  const alvoMatematico = (minimo + maximo) / 2;
  const desvio = ((atual - alvoMatematico) / alvoMatematico) * 100;
  
  let status: 'low' | 'good' | 'high' = 'good';
  
  if (atual < minimo) status = 'low';
  else if (atual > maximo) status = 'high';

  return {
    nutriente,
    atual,
    minimo,
    maximo,
    desvio: parseFloat(desvio.toFixed(1)),
    status
  };
}
