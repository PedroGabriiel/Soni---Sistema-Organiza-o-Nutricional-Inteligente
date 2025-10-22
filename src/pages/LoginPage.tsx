
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users } from 'lucide-react';
import Logo from '@/components/Logo';

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-4 text-lg text-gray-600">
            Bem-vindo ao sistema inteligente de nutrição
          </p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Escolha seu perfil para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/nutricionista/confirmacao')}
              className="w-full h-14 text-lg bg-primary hover:bg-primary-600 transition-all duration-300"
              size="lg"
            >
              <Users className="mr-3 h-5 w-5" />
              Entrar como Nutricionista
            </Button>
            
            <Button
              onClick={() => navigate('/nutricionista/cadastro')}
              variant="outline"
              className="w-full h-14 text-lg border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-300"
              size="lg"
            >
              <PlusCircle className="mr-3 h-5 w-5" />
              Cadastrar Nutricionista
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
