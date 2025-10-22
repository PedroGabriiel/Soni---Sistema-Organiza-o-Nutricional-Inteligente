import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { API_ENDPOINTS } from '@/config/api';

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

const NutritionistLoginConfirm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      // Chama diretamente o Apache, sem proxy do Vite
      const res = await fetch(API_ENDPOINTS.loginNutritionist, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          senha: values.senha,
        }),
      });

      const data = await res.json().catch(() => ({ ok: false, message: 'Erro inesperado' }));

      if (!res.ok || !data?.ok) {
        const msg = data?.message || 'Não foi possível fazer login. Verifique suas credenciais.';
        toast.error('Falha no login', { description: msg });
        return;
      }

      // Armazena dados do usuário no sessionStorage
      if (data.user) {
        sessionStorage.setItem('nutritionist_session', JSON.stringify(data.user));
      }

      toast.success('Login realizado!', { description: `Bem-vindo(a), ${data.user?.nome || ''}!` });
      setTimeout(() => navigate('/nutricionista'), 800);
    } catch (e: any) {
      toast.error('Erro', { description: e?.message || 'Falha ao comunicar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-4 text-lg text-gray-600">Login de Nutricionista</p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
              <LogIn className="h-6 w-6 text-primary" />
              Acesse sua conta
            </CardTitle>
            <CardDescription>
              Informe seu email e senha cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register('email')} 
                  placeholder="seu@email.com" 
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input 
                  id="senha" 
                  type="password" 
                  {...register('senha')} 
                  placeholder="******" 
                />
                {errors.senha && <p className="text-sm text-red-600 mt-1">{errors.senha.message}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-primary hover:bg-primary-600"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          Não possui conta?{' '}
          <button
            className="text-secondary hover:underline font-medium"
            onClick={() => navigate('/nutricionista/cadastro')}
          >
            Cadastre-se aqui
          </button>
        </p>
      </div>
    </div>
  );
};

export default NutritionistLoginConfirm;
