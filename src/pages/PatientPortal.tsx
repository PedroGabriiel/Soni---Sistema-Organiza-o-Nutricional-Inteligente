
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, LogIn } from 'lucide-react';
import Logo from '@/components/Logo';

const PatientPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-4 text-lg text-gray-600">
            Portal do Paciente
          </p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800">Bem-vindo!</CardTitle>
            <CardDescription>
              Como você gostaria de continuar?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/paciente-ativacao')}
              className="w-full h-14 text-lg bg-primary hover:bg-primary-600 transition-all duration-300"
              size="lg"
            >
              <KeyRound className="mr-3 h-5 w-5" />
              Ativar minha conta
            </Button>
            
            <Button
              onClick={() => navigate('/paciente-login')}
              variant="outline"
              className="w-full h-14 text-lg border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-300"
              size="lg"
            >
              <LogIn className="mr-3 h-5 w-5" />
              Já tenho conta, fazer login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientPortal;
