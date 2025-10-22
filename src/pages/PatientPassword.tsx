
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

const PatientPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState<{
    codigo: string;
    paciente_id: number;
    nome: string;
  } | null>(null);

  useEffect(() => {
    // Recuperar dados da ativação
    const storedData = sessionStorage.getItem('patient_activation');
    if (!storedData) {
      toast({
        title: "Erro",
        description: "Sessão expirada. Por favor, valide seu código novamente.",
        variant: "destructive"
      });
      navigate('/paciente-ativacao');
      return;
    }
    
    try {
      setPatientData(JSON.parse(storedData));
    } catch (error) {
      navigate('/paciente-ativacao');
    }
  }, [navigate]);

  const handleFinalize = async () => {
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (!patientData) {
      toast({
        title: "Erro",
        description: "Dados de ativação não encontrados.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.setPatientPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_ativacao: patientData.codigo,
          email: email.trim(),
          senha: password
        })
      });

      const result = await response.json();

      if (result.ok) {
        // Limpar dados temporários
        sessionStorage.removeItem('patient_activation');
        
        // Armazenar sessão do paciente
        sessionStorage.setItem('patient_session', JSON.stringify({
          paciente_id: result.data.paciente_id,
          nome: result.data.nome,
          email: result.data.email
        }));

        toast({
          title: "Sucesso!",
          description: "Sua conta foi criada com sucesso."
        });
        
        setTimeout(() => {
          navigate('/paciente-dashboard');
        }, 1500);
      } else {
        toast({
          title: "Erro ao finalizar cadastro",
          description: result.message || "Não foi possível criar a senha.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao finalizar cadastro:', error);
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
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Crie sua Senha</CardTitle>
            <CardDescription>
              {patientData ? `Olá, ${patientData.nome}! Defina sua senha de acesso.` : 'Defina uma senha segura para sua conta'}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirme sua Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
              />
            </div>
            
            <Button 
              onClick={handleFinalize} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Finalizando...' : 'Finalizar Cadastro'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientPassword;
