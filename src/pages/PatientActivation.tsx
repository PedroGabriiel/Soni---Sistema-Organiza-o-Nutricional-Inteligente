
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, KeyRound } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

const PatientActivation = () => {
  const navigate = useNavigate();
  const [activationCode, setActivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivation = async () => {
    if (!activationCode.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o código de ativação.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.activatePatient, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_ativacao: activationCode.trim()
        })
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        toast({
          title: "Erro no servidor",
          description: "O servidor retornou uma resposta inválida. Verifique o console.",
          variant: "destructive"
        });
        return;
      }

      const result = await response.json();

      if (result.ok) {
        // Armazenar dados temporários para a próxima tela
        sessionStorage.setItem('patient_activation', JSON.stringify({
          codigo: activationCode.trim(),
          paciente_id: result.data.paciente_id,
          nome: result.data.nome
        }));

        toast({
          title: "Código validado!",
          description: `Bem-vindo(a), ${result.data.nome}. Agora crie sua senha.`,
        });

        navigate('/paciente-senha');
      } else {
        toast({
          title: "Erro na validação",
          description: result.message || "Código de ativação inválido.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao validar código:', error);
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
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Ative sua Conta</CardTitle>
            <CardDescription>
              Insira o código fornecido pelo seu nutricionista
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Ativação</Label>
              <Input
                id="code"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                placeholder="SONI-XXXX-XXXX"
                className="text-center font-mono text-lg"
              />
            </div>
            
            <Button 
              onClick={handleActivation} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Validando...' : 'Ativar'}
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

export default PatientActivation;
