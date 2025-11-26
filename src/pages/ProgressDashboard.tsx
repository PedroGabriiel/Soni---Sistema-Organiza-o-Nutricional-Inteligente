import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Activity, TrendingDown, AlertTriangle, CheckCircle2, Users, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import Logo from '@/components/Logo';
import { API_ENDPOINTS } from '@/config/api';
import { AvaliacaoFisica, MedidasCorporais, DiarioAlimentarEntry, MetaNutricional } from '@/types';
import { calculateBodyComposition, calculateWHR, assessCardiovascularRisk, calculateAdherenceStreak, prepareSymmetryData, calculateNormalizedDeviation } from '@/lib/clinicalUtils';
import { NutrientDeviationChart } from '@/components/charts/NutrientDeviationChart';

const ProgressDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para dados do banco
  const [patient, setPatient] = useState<{
    paciente_id: number;
    nome: string;
    email: string;
    data_nascimento?: string;
    genero?: string;
    objetivo?: string;
  } | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFisica[]>([]);
  const [medidas, setMedidas] = useState<MedidasCorporais[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiarioAlimentarEntry[]>([]);
  const [metas, setMetas] = useState<MetaNutricional[]>([]);
  const [dailyIntake, setDailyIntake] = useState<{calorias: number; proteinas: number; gorduras: number; fibras: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Buscar info do paciente
        const patientRes = await fetch(`${API_ENDPOINTS.getPatientInfo}?paciente_id=${id}`);
        const patientData = await patientRes.json();
        if (patientData.ok) {
          setPatient(patientData.data.paciente);
        }
        
        // Buscar avaliações físicas
        const avaliacoesRes = await fetch(`${API_ENDPOINTS.getPhysicalAssessments}?paciente_id=${id}`);
        const avaliacoesData = await avaliacoesRes.json();
        if (avaliacoesData.ok) {
          setAvaliacoes(avaliacoesData.data);
        }
        
        // Buscar medidas corporais
        const medidasRes = await fetch(`${API_ENDPOINTS.getBodyMeasurements}?paciente_id=${id}`);
        const medidasData = await medidasRes.json();
        if (medidasData.ok) {
          setMedidas(medidasData.data);
        }
        
        // Buscar diário alimentar
        const diaryRes = await fetch(`${API_ENDPOINTS.getFoodDiary}?paciente_id=${id}`);
        const diaryData = await diaryRes.json();
        if (diaryData.ok) {
          setDiaryEntries(diaryData.data);
        }
        
        // Buscar metas nutricionais
        const metasRes = await fetch(`${API_ENDPOINTS.getNutrientGoals}?paciente_id=${id}`);
        const metasData = await metasRes.json();
        if (metasData.ok) {
          setMetas(metasData.data);
        }
        
        // Buscar ingestão diária calculada
        const intakeRes = await fetch(`${API_ENDPOINTS.getDailyIntake}?paciente_id=${id}`);
        const intakeData = await intakeRes.json();
        if (intakeData.ok) {
          setDailyIntake(intakeData.data);
        }
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados clínicos...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-6">Paciente não encontrado</div>;
  }

  // Calculate clinical metrics
  const latestAvaliacao = avaliacoes[avaliacoes.length - 1];
  const latestMedidas = medidas.find(m => m.avaliacao_id === latestAvaliacao?.avaliacao_id);

  // Adherence streak
  const adherenceStreak = calculateAdherenceStreak(diaryEntries);

  // WHR and cardiovascular risk
  const whr = latestMedidas && latestMedidas.cintura && latestMedidas.quadril
    ? calculateWHR(latestMedidas.cintura, latestMedidas.quadril)
    : null;
  const cvRisk = whr ? assessCardiovascularRisk(whr, patient.genero === 'Feminino' ? 'female' : 'male') : null;

  // Body composition over time
  const bodyCompositionData = avaliacoes.map(avaliacao => {
    const medida = medidas.find(m => m.avaliacao_id === avaliacao.avaliacao_id);
    if (!medida) return null;
    
    // Calcular idade do paciente
    const age = patient.data_nascimento 
      ? new Date().getFullYear() - new Date(patient.data_nascimento).getFullYear()
      : 30;
    
    return calculateBodyComposition(avaliacao, medida, age, patient.genero === 'Feminino' ? 'female' : 'male');
  }).filter(Boolean);

  // Symmetry data
  const symmetryData = latestMedidas ? prepareSymmetryData(latestMedidas) : [];

  // Transform symmetry data for butterfly chart
  const butterflyData = symmetryData.map(item => ({
    measurement: item.measurement,
    left: -item.left, // Negative for left side
    right: item.right,
    asymmetry: item.asymmetry
  }));

  // Current macros with deviation calculation (dados da dieta prescrita)
  const currentMacros = metas.length > 0 && dailyIntake ? metas.map(meta => {
    // Mapear o nutriente da meta para o campo correto do dailyIntake
    let atual = 0;
    const nutrienteLower = meta.nutriente.toLowerCase();
    
    if (nutrienteLower.includes('calor')) {
      atual = dailyIntake.calorias;
    } else if (nutrienteLower.includes('prote')) {
      atual = dailyIntake.proteinas;
    } else if (nutrienteLower.includes('gord')) {
      atual = dailyIntake.gorduras;
    } else if (nutrienteLower.includes('fibr')) {
      atual = dailyIntake.fibras;
    }
    
    return {
      nutriente: meta.nutriente,
      atual: atual,
      minimo: meta.minimo,
      maximo: meta.maximo
    };
  }) : [];

  // Calculate nutrient deviations for the chart (apenas se houver metas e intake)
  const nutrientDeviations = currentMacros.length > 0 ? currentMacros.map(macro => 
    calculateNormalizedDeviation(macro.atual, macro.minimo, macro.maximo, macro.nutriente)
  ) : [];

  const AppSidebar = () => (
    <Sidebar className="border-r-0 shadow-soft">
      <SidebarContent>
        <div className="p-4">
          <Logo size="sm" />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/nutricionista')}>
                  <Users className="h-4 w-4" />
                  <span>Pacientes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/nutricionista/perfil')}>
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/nutricionista/regras')}>
                  <Settings className="h-4 w-4" />
                  <span>Regras de Substituição</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/nutricionista/paciente/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard Clínico</h1>
              <p className="text-gray-600">{patient.nome}</p>
            </div>
          </div>

          {/* Status Sentinel Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Adherence Streak */}
            <Card className="shadow-soft border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streak de Aderência</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adherenceStreak} Dias</div>
                <p className="text-xs text-gray-600">
                  Registros consecutivos no diário
                </p>
              </CardContent>
            </Card>

            {/* Cardiovascular Risk */}
            <Card className="shadow-soft border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risco Cardiovascular</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {whr ? whr.toFixed(3) : '-'}
                  </div>
                  {cvRisk && (
                    <Badge variant={cvRisk === 'low' ? 'default' : 'destructive'}>
                      {cvRisk === 'low' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Baixo
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alto
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  WHR (Cintura/Quadril)
                </p>
              </CardContent>
            </Card>

            {/* Current Weight */}
            <Card className="shadow-soft border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestAvaliacao?.peso_kg.toFixed(1)} kg
                </div>
                <p className="text-xs text-gray-600">
                  IMC: {latestAvaliacao?.imc?.toFixed(1) || '-'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Body Composition Analysis */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-gray-800">Análise de Composição Corporal</CardTitle>
              <CardDescription>
                Evolução da massa magra vs. massa gorda ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bodyCompositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bodyCompositionData}>
                  <defs>
                    <linearGradient id="colorLean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short' })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="leanMass"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorLean)"
                    name="Massa Magra"
                  />
                  <Area
                    type="monotone"
                    dataKey="fatMass"
                    stackId="1"
                    stroke="hsl(var(--destructive))"
                    fill="url(#colorFat)"
                    name="Massa Gorda"
                  />
                </AreaChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Sem dados disponíveis</p>
                  <p className="text-sm text-gray-500 mt-2">Cadastre avaliações físicas com medidas corporais para visualizar a evolução</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Symmetry Analysis */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-gray-800">Análise de Simetria</CardTitle>
                <CardDescription>
                  Comparação bilateral de medidas corporais (cm)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {butterflyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={butterflyData}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => Math.abs(value).toString()}
                    />
                    <YAxis type="category" dataKey="measurement" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value: number, name: string) => [
                        `${Math.abs(value).toFixed(1)} cm`,
                        name === 'left' ? 'Esquerdo' : 'Direito'
                      ]}
                    />
                    <Legend
                      formatter={(value) => value === 'left' ? 'Esquerdo' : 'Direito'}
                    />
                    <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
                    <Bar dataKey="left" fill="hsl(var(--primary))" name="left" />
                    <Bar dataKey="right" fill="hsl(var(--secondary))" name="right" />
                  </BarChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Sem dados disponíveis</p>
                    <p className="text-sm text-gray-500 mt-2">Cadastre medidas corporais bilaterais para análise de simetria</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutrient Adherence Chart */}
            {nutrientDeviations.length > 0 ? (
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-gray-800">Aderência às Metas Nutricionais</CardTitle>
                  <CardDescription>
                    Desvio percentual em relação ao centro da faixa-alvo de macronutrientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NutrientDeviationChart data={nutrientDeviations} />
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-gray-800">Aderência às Metas Nutricionais</CardTitle>
                  <CardDescription>
                    Nenhuma meta nutricional cadastrada para este paciente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Sem dados disponíveis</p>
                    <p className="text-sm text-gray-500 mt-2">Configure as metas nutricionais na dieta do paciente</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>


        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProgressDashboard;
