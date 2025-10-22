
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, Users, Settings, Copy, Check, Loader2, User } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface Patient {
  paciente_id: number;
  nome: string;
  email: string;
  status: string;
  data_nascimento?: string;
  genero?: string;
  objetivo?: string;
}

const NutritionistDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // Buscar pacientes do nutricionista
  const fetchPatients = async () => {
    try {
      const session = sessionStorage.getItem('nutritionist_session');
      if (!session) {
        navigate('/nutricionista/confirmacao');
        return;
      }

      const nutricionistData = JSON.parse(session);
      const nutricionistaId = nutricionistData.nutricionista_id;

      const response = await fetch(`${API_ENDPOINTS.getPatients}?nutricionista_id=${nutricionistaId}`);
      const result = await response.json();

      if (result.ok) {
        setPatients(result.data || []);
      } else {
        console.error('Erro ao buscar pacientes:', result.message);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreatePatient = async () => {
    if (!newPatientName || !newPatientEmail) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Pegar ID do nutricionista logado (sessionStorage)
      const session = sessionStorage.getItem('nutritionist_session');
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado como nutricionista.",
          variant: "destructive"
        });
        navigate('/nutricionista/confirmacao');
        return;
      }

      const nutricionistData = JSON.parse(session);
      const nutricionistaId = nutricionistData.nutricionista_id;

  // ID obtido da sessão do nutricionista

      if (!nutricionistaId) {
        toast({
          title: "Erro",
          description: "ID do nutricionista não encontrado. Faça login novamente.",
          variant: "destructive"
        });
        navigate('/nutricionista/confirmacao');
        return;
      }

      // Chamar API para cadastrar paciente
      const requestBody = {
        nome: newPatientName.trim(),
        nutricionista_id: nutricionistaId,
        // Email é apenas para referência do nutricionista, não será usado no login
        genero: null,
        objetivo: null
      };

  // Envia dados do novo paciente

      const response = await fetch(API_ENDPOINTS.registerPatient, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      
      const result = await response.json();
      

      if (result.ok) {
        const code = result.data.codigo_ativacao;
        setActivationCode(code);
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
        setNewPatientName('');
        setNewPatientEmail('');
        
        // Recarregar lista de pacientes
        await fetchPatients();
        
        toast({
          title: "Paciente cadastrado!",
          description: "Código de ativação gerado com sucesso."
        });
      } else {
        toast({
          title: "Erro ao cadastrar paciente",
          description: result.message || "Não foi possível cadastrar o paciente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para a área de transferência."
      });
    } catch (err) {
  // Fallback copy falhou
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
                <SidebarMenuButton className="text-primary bg-primary-50">
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
          <div className="flex items-center justify-between mb-8">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Meus Pacientes</h1>
              <p className="text-gray-600 mt-1">Gerencie seus pacientes e suas dietas</p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-600 shadow-soft">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Novo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl text-gray-800">Cadastrar Novo Paciente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="Digite o nome completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                      placeholder="Digite o email"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleCreatePatient} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Cadastrando...' : 'Criar Perfil e Gerar Código'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingPatients ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">Carregando pacientes...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum paciente cadastrado</h3>
              <p className="text-gray-500">Comece adicionando seu primeiro paciente</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <Card
                  key={patient.paciente_id}
                  className="cursor-pointer hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-0 shadow-soft"
                  onClick={() => navigate(`/nutricionista/paciente/${patient.paciente_id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-800">{patient.nome}</CardTitle>
                    {patient.status === 'pendente' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Ativação Pendente
                      </span>
                    )}
                    {patient.status === 'ativo' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Ativo
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{patient.email || 'Aguardando ativação'}</p>
                    {patient.objetivo && (
                      <p className="text-gray-500 text-xs mt-2">Objetivo: {patient.objetivo}</p>
                    )}
                    <div className="mt-3 text-xs text-gray-500">
                      Clique para editar dieta
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Success Modal */}
          <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">Paciente Cadastrado com Sucesso!</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Compartilhe o código de ativação abaixo com <strong>{newPatientName}</strong> para que ele possa acessar o aplicativo.
                </p>
                <div className="relative">
                  <Input
                    value={activationCode}
                    readOnly
                    className="text-center font-mono text-lg font-bold border-2 border-primary-200 bg-primary-50"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={() => setIsSuccessModalOpen(false)} className="w-full">
                  Fechar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NutritionistDashboard;
