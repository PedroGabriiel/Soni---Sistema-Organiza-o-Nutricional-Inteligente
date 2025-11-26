
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ArrowLeft, Edit, Trash2, Users, Settings, User, Plus, Save } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Logo from '@/components/Logo';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pacienteId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : 0;
  }, [id]);

  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<{
    paciente_id: number;
    nome: string;
    email?: string;
    status?: string;
    data_nascimento?: string;
    genero?: string;
    objetivo?: string;
    alergias_restricoes?: string;
  } | null>(null);
  const [dietas, setDietas] = useState<Array<{
    dieta_id: number;
    nome: string;
    data_inicio?: string;
    data_fim?: string;
    refeicoes: Array<{
      refeicao_id: number;
      nome: string;
      horario?: string;
      itens: Array<{ item_refeicao_id: number; quantidade: string; unidade_medida?: string; alimento: string }>;
    }>;
  }>>([]);

  // Diet form state (for create/edit)
  type DietForm = {
    nome: string;
    data_inicio?: string;
    data_fim?: string;
    refeicoes: Array<{
      nome: string;
      horario?: string;
      itens: Array<{ alimento: string; quantidade: string; unidade_medida?: string }>;
    }>;
  };
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [isSavingDiet, setIsSavingDiet] = useState(false);
  const [dietForm, setDietForm] = useState<DietForm>({ nome: '', data_inicio: '', data_fim: '', refeicoes: [] });

  useEffect(() => {
    const ensureAuth = () => {
      const session = sessionStorage.getItem('nutritionist_session');
      if (!session) {
        navigate('/nutricionista/confirmacao');
        return false;
      }
      return true;
    };

    if (!pacienteId) {
      toast({ title: 'Paciente inválido', description: 'ID do paciente ausente.', variant: 'destructive' });
      navigate('/nutricionista');
      return;
    }

    if (!ensureAuth()) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar informações do paciente
        const infoRes = await fetch(`${API_ENDPOINTS.getPatientInfo}?paciente_id=${pacienteId}`);
        const infoJson = await infoRes.json();
        if (!infoJson.ok) throw new Error(infoJson.message || 'Erro ao carregar paciente');
        const info = infoJson.data?.paciente;
        setPatient(info ? { ...info, paciente_id: info.paciente_id } : null);

        // Buscar dietas do paciente
        const dietRes = await fetch(`${API_ENDPOINTS.getPatientDiet}?paciente_id=${pacienteId}`);
        const dietJson = await dietRes.json();
        if (!dietJson.ok) throw new Error(dietJson.message || 'Erro ao carregar dietas');
        setDietas(Array.isArray(dietJson.data) ? dietJson.data : []);
      } catch (e: any) {
        console.error(e);
        toast({ title: 'Erro', description: e.message || 'Falha ao carregar dados do paciente.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pacienteId, navigate]);

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
        
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger className="md:hidden" />
            <Button
              variant="ghost"
              onClick={() => navigate(`/nutricionista/paciente/${id}`)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{patient ? `Dieta de ${patient.nome}` : 'Carregando...'}</h1>
              {patient && (
                <p className="text-gray-600 mt-1">{patient.email || 'Aguardando ativação'} {patient.status ? `• ${patient.status}` : ''}</p>
              )}
            </div>
            <div className="ml-auto">
              {patient && (
                <Dialog open={isDietModalOpen} onOpenChange={(o) => {
                  setIsDietModalOpen(o);
                  if (o) {
                    // Seed form with latest diet if exists; else empty template
                    const latest = dietas[0];
                    if (latest) {
                      setDietForm({
                        nome: latest.nome || '',
                        data_inicio: latest.data_inicio || '',
                        data_fim: latest.data_fim || '',
                        refeicoes: latest.refeicoes.map(r => ({
                          nome: r.nome,
                          horario: r.horario || '',
                          itens: r.itens.map(it => ({ alimento: it.alimento, quantidade: it.quantidade || '', unidade_medida: it.unidade_medida || '' }))
                        }))
                      });
                    } else {
                      setDietForm({ nome: '', data_inicio: '', data_fim: '', refeicoes: [ { nome: 'Café da manhã', horario: '', itens: [] } ] });
                    }
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary">
                      <Plus className="h-4 w-4 mr-2" /> {dietas.length ? 'Editar dieta' : 'Nova dieta'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{dietas.length ? 'Editar dieta' : 'Criar dieta'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="diet-nome">Nome</Label>
                          <Input id="diet-nome" value={dietForm.nome} onChange={(e) => setDietForm({ ...dietForm, nome: e.target.value })} placeholder="Ex: Plano Semanal" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="diet-inicio">Início</Label>
                          <Input id="diet-inicio" type="date" value={dietForm.data_inicio || ''} onChange={(e) => setDietForm({ ...dietForm, data_inicio: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="diet-fim">Fim</Label>
                          <Input id="diet-fim" type="date" value={dietForm.data_fim || ''} onChange={(e) => setDietForm({ ...dietForm, data_fim: e.target.value })} className="mt-1" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Refeições</h3>
                        <Button variant="outline" size="sm" onClick={() => setDietForm({ ...dietForm, refeicoes: [...dietForm.refeicoes, { nome: '', horario: '', itens: [] }] })}>
                          <Plus className="h-4 w-4 mr-1" /> Adicionar refeição
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {dietForm.refeicoes.map((meal, mi) => (
                          <Card key={mi} className="border-0 shadow-soft">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Refeição {mi + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid md:grid-cols-3 gap-3">
                                <div>
                                  <Label>Nome</Label>
                                  <Input value={meal.nome} onChange={(e) => {
                                    const ref = [...dietForm.refeicoes];
                                    ref[mi] = { ...ref[mi], nome: e.target.value };
                                    setDietForm({ ...dietForm, refeicoes: ref });
                                  }} placeholder="Ex: Almoço" className="mt-1" />
                                </div>
                                <div>
                                  <Label>Horário</Label>
                                  <Input value={meal.horario || ''} onChange={(e) => {
                                    const ref = [...dietForm.refeicoes];
                                    ref[mi] = { ...ref[mi], horario: e.target.value };
                                    setDietForm({ ...dietForm, refeicoes: ref });
                                  }} placeholder="12:30" className="mt-1" />
                                </div>
                                <div className="flex items-end">
                                  <Button variant="ghost" className="text-red-600" onClick={() => {
                                    const ref = dietForm.refeicoes.filter((_, idx) => idx !== mi);
                                    setDietForm({ ...dietForm, refeicoes: ref });
                                  }}>
                                    Remover refeição
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-1">
                                <h4 className="text-sm font-medium text-gray-700">Itens</h4>
                                <Button variant="outline" size="sm" onClick={() => {
                                  const ref = [...dietForm.refeicoes];
                                  ref[mi] = { ...ref[mi], itens: [...ref[mi].itens, { alimento: '', quantidade: '', unidade_medida: '' }] };
                                  setDietForm({ ...dietForm, refeicoes: ref });
                                }}>
                                  <Plus className="h-4 w-4 mr-1" /> Adicionar item
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {meal.itens.map((it, ii) => (
                                  <div key={ii} className="grid md:grid-cols-12 gap-2 bg-gray-50 p-2 rounded-md">
                                    <div className="md:col-span-6">
                                      <Label>Alimento</Label>
                                      <Input value={it.alimento} onChange={(e) => {
                                        const ref = [...dietForm.refeicoes];
                                        const itens = [...ref[mi].itens];
                                        itens[ii] = { ...itens[ii], alimento: e.target.value };
                                        ref[mi] = { ...ref[mi], itens };
                                        setDietForm({ ...dietForm, refeicoes: ref });
                                      }} placeholder="Ex: Arroz integral" className="mt-1" />
                                    </div>
                                    <div className="md:col-span-3">
                                      <Label>Quantidade</Label>
                                      <Input value={it.quantidade} onChange={(e) => {
                                        const ref = [...dietForm.refeicoes];
                                        const itens = [...ref[mi].itens];
                                        itens[ii] = { ...itens[ii], quantidade: e.target.value };
                                        ref[mi] = { ...ref[mi], itens };
                                        setDietForm({ ...dietForm, refeicoes: ref });
                                      }} placeholder="Ex: 100" className="mt-1" />
                                    </div>
                                    <div className="md:col-span-3">
                                      <Label>Unidade</Label>
                                      <Input value={it.unidade_medida || ''} onChange={(e) => {
                                        const ref = [...dietForm.refeicoes];
                                        const itens = [...ref[mi].itens];
                                        itens[ii] = { ...itens[ii], unidade_medida: e.target.value };
                                        ref[mi] = { ...ref[mi], itens };
                                        setDietForm({ ...dietForm, refeicoes: ref });
                                      }} placeholder="g, ml, xíc, fatia..." className="mt-1" />
                                    </div>
                                    <div className="md:col-span-12 flex justify-end">
                                      <Button variant="ghost" className="text-red-600" onClick={() => {
                                        const ref = [...dietForm.refeicoes];
                                        ref[mi] = { ...ref[mi], itens: ref[mi].itens.filter((_, idx) => idx !== ii) };
                                        setDietForm({ ...dietForm, refeicoes: ref });
                                      }}>
                                        Remover item
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="default" onClick={async () => {
                          if (!patient) return;
                          if (!dietForm.nome.trim()) {
                            toast({ title: 'Nome obrigatório', description: 'Informe o nome da dieta.', variant: 'destructive' });
                            return;
                          }
                          if (dietForm.refeicoes.length === 0) {
                            toast({ title: 'Refeições', description: 'Adicione ao menos uma refeição.', variant: 'destructive' });
                            return;
                          }
                          setIsSavingDiet(true);
                          try {
                            const latest = dietas[0];
                            const payload = {
                              paciente_id: pacienteId,
                              dieta_id: latest?.dieta_id,
                              nome: dietForm.nome.trim(),
                              data_inicio: dietForm.data_inicio || null,
                              data_fim: dietForm.data_fim || null,
                              refeicoes: dietForm.refeicoes.map(r => ({
                                nome: r.nome,
                                horario: r.horario || null,
                                itens: r.itens.filter(x => x.alimento.trim()).map(x => ({ alimento: x.alimento.trim(), quantidade: x.quantidade || '', unidade_medida: x.unidade_medida || null }))
                              }))
                            };
                            const res = await fetch(API_ENDPOINTS.savePatientDiet, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                            const json = await res.json();
                            if (!json.ok) throw new Error(json.message || 'Falha ao salvar a dieta');
                            toast({ title: 'Dieta salva', description: 'Plano nutricional atualizado com sucesso.' });
                            // Recarrega dietas
                            const dietRes = await fetch(`${API_ENDPOINTS.getPatientDiet}?paciente_id=${pacienteId}`);
                            const dietJson = await dietRes.json();
                            if (dietJson.ok) setDietas(Array.isArray(dietJson.data) ? dietJson.data : []);
                            setIsDietModalOpen(false);
                          } catch (e: any) {
                            toast({ title: 'Erro', description: e.message || 'Não foi possível salvar.', variant: 'destructive' });
                          } finally {
                            setIsSavingDiet(false);
                          }
                        }} disabled={isSavingDiet}>
                          <Save className="h-4 w-4 mr-2" /> {isSavingDiet ? 'Salvando...' : 'Salvar dieta'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-gray-600">Carregando dados do paciente...</div>
          ) : !patient ? (
            <div>Paciente não encontrado</div>
          ) : dietas.length === 0 ? (
            <div className="text-gray-600">Nenhuma dieta cadastrada para este paciente.</div>
          ) : (
            <div className="space-y-6">
              {/* Exibe apenas a dieta mais recente */}
              {dietas.slice(0, 1).map((dieta) => (
                <div key={dieta.dieta_id}>
                  <div className="mb-2 text-gray-700 text-sm">Plano: {dieta.nome} {dieta.data_inicio ? `• início: ${dieta.data_inicio}` : ''}</div>
                  {dieta.refeicoes.map((meal) => (
                    <Card key={meal.refeicao_id} className="shadow-soft border-0">
                      <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50">
                        <CardTitle className="text-xl text-gray-800">{meal.nome}{meal.horario ? ` • ${meal.horario}` : ''}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {meal.itens.map((food) => (
                            <div key={food.item_refeicao_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-800">{food.quantidade}{food.unidade_medida ? ` ${food.unidade_medida}` : ''} de {food.alimento}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PatientProfile;
