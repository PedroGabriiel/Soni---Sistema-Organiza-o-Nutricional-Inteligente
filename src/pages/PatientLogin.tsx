import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogIn } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

const PatientLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.loginPatient, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: password
        })
      });

      const result = await response.json();

      if (result.ok) {
        // Armazenar sessão do paciente
        sessionStorage.setItem('patient_session', JSON.stringify(result.data));

        toast({
          title: "Login realizado!",
          description: `Bem-vindo(a), ${result.data.nome}!`,
        });

        setTimeout(() => {
          navigate('/paciente-dashboard');
        }, 1000);
      } else {
        toast({
          title: "Erro ao fazer login",
          description: result.message || "Email ou senha incorretos.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Logo size="lg" />
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Login do Paciente</CardTitle>
            <CardDescription>
              Entre com suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/paciente-portal')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;
