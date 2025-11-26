import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Users, Settings, FileText, History, TrendingUp, Calendar as CalendarIcon, User } from 'lucide-react';
import { DailyReport } from '@/types';
import { API_ENDPOINTS } from '@/config/api';
import Logo from '@/components/Logo';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PatientHub = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [patient, setPatient] = useState<{
    paciente_id: number;
    nome: string;
    email: string;
    status: string;
    data_nascimento?: string;
    genero?: string;
    objetivo?: string;
  } | null>(null);
  const [patientReports, setPatientReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do paciente e relatórios
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
        
        // Buscar relatórios diários
        const reportsRes = await fetch(`${API_ENDPOINTS.getDailyReports}?paciente_id=${id}`);
        const reportsData = await reportsRes.json();
        if (reportsData.ok) {
          setPatientReports(reportsData.data);
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
          <p className="text-gray-600">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-6">Paciente não encontrado</div>;
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getReportForDate = (date: Date): DailyReport | undefined => {
    return patientReports.find(report => {
      // Parseamos a data como local adicionando 'T00:00:00' para evitar timezone UTC
      const reportDate = new Date(report.date + 'T00:00:00');
      return isSameDay(reportDate, date);
    });
  };

  const getAdherenceColor = (adherence: 'complete' | 'partial' | 'none') => {
    switch (adherence) {
      case 'complete':
        return 'hsl(var(--primary))';
      case 'partial':
        return 'hsl(45 93% 47%)';
      case 'none':
        return 'hsl(var(--destructive))';
    }
  };

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    const report = getReportForDate(date);
    if (report) {
      setSelectedReport(report);
      setSelectedDate(date);
    }
  };

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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger className="md:hidden" />
              <Button
                variant="ghost"
                onClick={() => navigate('/nutricionista')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Central do Paciente</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os aspectos do tratamento</p>
              </div>
            </div>

            {/* Patient Summary Header */}
            <Card className="mb-8 shadow-soft border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                    <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                      {getInitials(patient.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">{patient.nome}</h2>
                    <p className="text-gray-600">{patient.email}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      {patient.data_nascimento && (
                        <span>Idade: {new Date().getFullYear() - new Date(patient.data_nascimento).getFullYear()} anos</span>
                      )}
                      {patient.genero && <span>Gênero: {patient.genero}</span>}
                      {patient.objetivo && <span>Objetivo: {patient.objetivo}</span>}
                    </div>
                  </div>
                  {patient.status === 'ativo' && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                      Ativo
                    </div>
                  )}
                  {patient.status === 'pendente' && (
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                      Pendente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Menu Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Active Diet Card */}
              <Card 
                className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => navigate(`/nutricionista/paciente/${id}/dieta`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800">Dieta Ativa</CardTitle>
                      <CardDescription>Ver e editar plano nutricional atual</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Acesse a dieta completa do paciente, edite refeições e alimentos
                  </p>
                  <Button variant="ghost" className="mt-4 text-primary group-hover:bg-primary/10">
                    Abrir Dieta →
                  </Button>
                </CardContent>
              </Card>

              {/* Progress Dashboard Card */}
              <Card 
                className="shadow-soft border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => navigate(`/nutricionista/paciente/${id}/dashboard`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                      <TrendingUp className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800">Dashboard de Progresso</CardTitle>
                      <CardDescription>Análise e evolução detalhada</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Acompanhe evolução de peso, IMC e aderência à dieta
                  </p>
                  <Button variant="ghost" className="mt-4 text-secondary group-hover:bg-secondary/10">
                    Ver Dashboard →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Calendar and Stats - Full Width */}
            <Card className="shadow-soft border-0 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800">Calendário de Aderência e Resumo</CardTitle>
                    <CardDescription>Acompanhe o cumprimento diário da dieta e estatísticas recentes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Calendar Section - Left */}
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                        <span className="text-gray-600">Completo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <span className="text-gray-600">Parcial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }} />
                        <span className="text-gray-600">Não seguiu</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onDayClick={handleDayClick}
                        locale={ptBR}
                        className="rounded-md border bg-white"
                        modifiers={{
                          reported: (date) => !!getReportForDate(date)
                        }}
                        modifiersStyles={{
                          reported: {
                            fontWeight: 'bold'
                          }
                        }}
                        components={{
                          Day: ({ date, ...props }) => {
                            const report = getReportForDate(date);
                            return (
                              <TooltipProvider key={date.toString()}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      {...props}
                                      style={{
                                        backgroundColor: report ? getAdherenceColor(report.adherence) : undefined,
                                        color: report ? 'white' : undefined,
                                        borderRadius: '0.375rem',
                                        cursor: report ? 'pointer' : 'default'
                                      }}
                                      className="p-2"
                                    >
                                      {date.getDate()}
                                    </div>
                                  </TooltipTrigger>
                                  {report && (
                                    <TooltipContent>
                                      <p className="font-semibold">
                                        {report.adherence === 'complete' && 'Seguiu completamente'}
                                        {report.adherence === 'partial' && 'Seguiu parcialmente'}
                                        {report.adherence === 'none' && 'Não seguiu'}
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats Section - Right */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <History className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Resumo Recente</h3>
                        <p className="text-sm text-gray-600">Estatísticas dos últimos 7 dias</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Relatórios Enviados</p>
                        <p className="text-2xl font-bold text-gray-800">{patientReports.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Aderência Média</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {patientReports.length > 0 ? (
                            (() => {
                              const completeCount = patientReports.filter(r => r.adherence === 'complete').length;
                              const partialCount = patientReports.filter(r => r.adherence === 'partial').length;
                              const totalScore = (completeCount * 100) + (partialCount * 50);
                              const avgAdherence = Math.round(totalScore / patientReports.length);
                              return `${avgAdherence}%`;
                            })()
                          ) : '-'}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Substituições Feitas</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {patientReports.reduce((acc, r) => acc + (r.substitutions?.length || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Daily Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Relatório do Dia {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              Status: {selectedReport?.adherence === 'complete' && 'Seguiu completamente'}
              {selectedReport?.adherence === 'partial' && 'Seguiu parcialmente'}
              {selectedReport?.adherence === 'none' && 'Não seguiu'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Feedback do Paciente</h4>
              <p className="text-gray-600">{selectedReport?.notes}</p>
            </div>

            {selectedReport?.substitutions && selectedReport.substitutions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Substituições Realizadas</h4>
                <div className="space-y-2">
                  {selectedReport.substitutions.map((sub, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{sub.meal}:</span> {sub.original} → {sub.substituted}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!selectedReport?.substitutions || selectedReport.substitutions.length === 0) && (
              <div>
                <p className="text-sm text-gray-500 italic">Nenhuma substituição realizada neste dia</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default PatientHub;
