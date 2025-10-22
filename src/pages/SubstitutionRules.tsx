
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { mockSubstitutionRules } from '@/data/mockData';
import Logo from '@/components/Logo';

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
                  {mockSubstitutionRules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">{rule.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {rule.foods.map((food, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full border"
                          >
                            {food}
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
                  {mockSubstitutionRules.map((rule) => (
                    <div key={rule.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Checkbox id={rule.id} defaultChecked />
                      <label
                        htmlFor={rule.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Alimentos do grupo <strong>{rule.category}</strong> só podem ser substituídos por outros de <strong>{rule.category}</strong>.
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SubstitutionRules;
