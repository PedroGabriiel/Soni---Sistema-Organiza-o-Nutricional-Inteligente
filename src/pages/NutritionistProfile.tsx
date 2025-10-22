import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { Users, Settings, User } from 'lucide-react';

const NutritionistProfile: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    crn: '',
    especializacao: '',
    senha: '', // opcional
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem('nutritionist_session');
    if (!session) {
      navigate('/nutricionista/confirmacao');
      return;
    }
    try {
      const data = JSON.parse(session);
      setForm((prev) => ({
        ...prev,
        nome: data.nome || '',
        email: data.email || '',
        crn: data.crn || '',
        especializacao: data.especializacao || '',
      }));
    } catch (e) {}
  }, [navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = sessionStorage.getItem('nutritionist_session');
    if (!session) {
      navigate('/nutricionista/confirmacao');
      return;
    }
    const data = JSON.parse(session);
    const nutricionista_id = data.nutricionista_id;
    if (!nutricionista_id) {
      toast({ title: 'Erro', description: 'Sessão inválida. Faça login novamente.', variant: 'destructive' });
      navigate('/nutricionista/confirmacao');
      return;
    }

    if (form.senha && form.senha.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Use no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const body: any = {
        nutricionista_id,
        nome: form.nome.trim(),
        email: form.email.trim(),
        crn: form.crn.trim(),
        especializacao: form.especializacao.trim(),
      };
      if (form.senha) body.senha = form.senha;

      const res = await fetch(API_ENDPOINTS.updateNutritionist, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || 'Falha ao atualizar perfil');

      // Atualiza sessão local com novos dados (exceto senha)
      const updated = { ...data, nome: body.nome, email: body.email, crn: body.crn, especializacao: body.especializacao };
      sessionStorage.setItem('nutritionist_session', JSON.stringify(updated));

      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas.' });
      setForm((prev) => ({ ...prev, senha: '' }));
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Não foi possível salvar.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
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
                <SidebarMenuButton className="text-primary bg-primary-50">
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
          <div className="flex items-center justify-between mb-6">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
              <p className="text-gray-600 mt-1">Atualize suas informações</p>
            </div>
          </div>

          <Card className="max-w-2xl border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Informações do Nutricionista</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={form.nome} onChange={onChange} placeholder="Seu nome" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={onChange} placeholder="seu@email.com" className="mt-1" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crn">CRN</Label>
                    <Input id="crn" value={form.crn} onChange={onChange} placeholder="CRN" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="especializacao">Especialização</Label>
                    <Input id="especializacao" value={form.especializacao} onChange={onChange} placeholder="Ex: Nutrição Esportiva" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="senha">Nova Senha (opcional)</Label>
                  <Input id="senha" type="password" value={form.senha} onChange={onChange} placeholder="Mínimo 6 caracteres" className="mt-1" />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={isSaving} className="min-w-40">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NutritionistProfile;
