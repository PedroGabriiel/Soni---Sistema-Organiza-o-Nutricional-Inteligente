
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { mockSubstitutionRules } from '@/data/mockData';
import Logo from '@/components/Logo';
import { API_ENDPOINTS } from '@/config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SubstitutionRules = () => {
  const navigate = useNavigate();

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
                  <Users className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-primary bg-primary-50">
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

  const [groups, setGroups] = useState<any[]>([]);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.getSubstitutionGroups);
        const json = await res.json();
        if (json.ok) setGroups(json.data || []);
        else setGroups(mockSubstitutionRules as any);
      } catch (e) {
        setGroups(mockSubstitutionRules as any);
      }
    };
    load();
  }, []);

  const openEdit = (g: any) => {
    setEditingGroup({ grupo_id: g.grupo_id || 0, nome: g.nome || '', alimentos: (g.alimentos || []).map((a: any) => a.nome || a) });
    setIsEditModalOpen(true);
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    try {
      const payload = { grupo_id: editingGroup.grupo_id, nome: editingGroup.nome, alimentos: editingGroup.alimentos.map((n: string) => ({ nome: n })) };
      const res = await fetch(API_ENDPOINTS.saveSubstitutionGroup, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.ok) {
        // reload
        const r2 = await fetch(API_ENDPOINTS.getSubstitutionGroups);
        const j2 = await r2.json();
        if (j2.ok) setGroups(j2.data || []);
        setIsEditModalOpen(false);
      } else {
        alert(json.message || 'Erro ao salvar');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 p-6">
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
              <h1 className="text-3xl font-bold text-gray-800">Configurar Regras de Substituição</h1>
              <p className="text-gray-600 mt-1">Defina as regras para substituição inteligente de alimentos</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Food Groups Section */}
            <Card className="shadow-soft border-0">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50">
                <CardTitle className="text-xl text-gray-800">Grupos de Alimentos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((rule) => (
                    <div key={rule.grupo_id || rule.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">{rule.nome || rule.category}</h3>
                        <Button size="sm" onClick={() => openEdit(rule)}>Editar</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(rule.alimentos || []).map((food: any, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full border"
                          >
                            {food.nome || food}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rules Section */}
            <Card className="shadow-soft border-0">
              <CardHeader className="bg-gradient-to-r from-secondary-50 to-primary-50">
                <CardTitle className="text-xl text-gray-800">Regras de Substituição</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {groups.map((rule) => (
                    <div key={rule.grupo_id || rule.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Checkbox id={`g-${rule.grupo_id || rule.id}`} defaultChecked />
                      <label
                        htmlFor={`g-${rule.grupo_id || rule.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Alimentos do grupo <strong>{rule.nome}</strong>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Group Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Grupo de Substituição</DialogTitle>
              </DialogHeader>
              {editingGroup && (
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Grupo</Label>
                    <Input value={editingGroup.nome} onChange={(e) => setEditingGroup({ ...editingGroup, nome: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Alimentos (uma linha por alimento)</Label>
                    <textarea value={(editingGroup.alimentos || []).join('\n')} onChange={(e) => setEditingGroup({ ...editingGroup, alimentos: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) })} className="w-full p-2 border rounded-md" rows={6} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                    <Button onClick={saveGroup} className="bg-primary">Salvar</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SubstitutionRules;
