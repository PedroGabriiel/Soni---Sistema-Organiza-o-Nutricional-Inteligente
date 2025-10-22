// Configuração da API
// Usando caminho relativo ao domínio para evitar problemas de encoding com caracteres acentuados

// Caminho absoluto do projeto no servidor (ajuste se necessário)
const PROJECT_PATH = '/Prototipo-Soni-Sistema-de-Organização-Nutricional-Inteligente';

const API_BASE_URL = `http://localhost${PROJECT_PATH}/public/api`;

export const API_ENDPOINTS = {
  // Nutricionista
  registerNutritionist: `${API_BASE_URL}/register_nutricionista.php`,
  loginNutritionist: `${API_BASE_URL}/login_nutricionista.php`,
  getPatients: `${API_BASE_URL}/get_patients.php`,
  updateNutritionist: `${API_BASE_URL}/update_nutricionista.php`,
  
  // Paciente
  registerPatient: `${API_BASE_URL}/register_patient.php`,
  activatePatient: `${API_BASE_URL}/activate_patient.php`,
  setPatientPassword: `${API_BASE_URL}/set_patient_password.php`,
  loginPatient: `${API_BASE_URL}/login_patient.php`,
  getPatientInfo: `${API_BASE_URL}/get_patient_info.php`,
  getPatientDiet: `${API_BASE_URL}/get_patient_diet.php`,
  savePatientDiet: `${API_BASE_URL}/save_patient_diet.php`,
  
  // Testes (removidos em produção)
};

// Helper para fazer requisições à API
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // Se não for JSON, retornar texto
  const text = await response.text();
  throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}`);
}

export default API_BASE_URL;

