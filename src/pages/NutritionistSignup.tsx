import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { API_ENDPOINTS } from '@/config/api';

const schema = z.object({
  nome: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Mínimo 6 caracteres'),
  crn: z.string().min(3, 'CRN obrigatório'),
  especializacao: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type FormValues = z.infer<typeof schema>;

const NutritionistSignup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      // Chama diretamente o Apache, sem proxy do Vite
      const res = await fetch(API_ENDPOINTS.registerNutritionist, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: values.nome,
          email: values.email,
          senha: values.senha,
          crn: values.crn,
          especializacao: values.especializacao || '',
        }),
      });

      const data = await res.json().catch(() => ({ ok: false, message: 'Erro inesperado' }));
      
      if (!res.ok || !data?.ok) {
        const msg = data?.message || 'Não foi possível cadastrar. Tente novamente.';
        toast.error('Falha no cadastro', { description: msg });
        return;
      }

      toast.success('Cadastro realizado!', { description: 'Você já pode fazer login.' });
      setTimeout(() => navigate('/nutricionista/confirmacao'), 1500);
    } catch (e: any) {
      toast.error('Erro', { description: e?.message || 'Falha ao comunicar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-4 text-lg text-gray-600">Cadastro de Nutricionista</p>
        </div>
        <Card className="shadow-medium border-0">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl text-gray-800">Crie sua conta</CardTitle>
            <CardDescription>Preencha os dados abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...register('nome')} placeholder="Seu nome" />
                {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} placeholder="voce@exemplo.com" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input id="senha" type="password" {...register('senha')} />
                  {errors.senha && <p className="text-sm text-red-600 mt-1">{errors.senha.message}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                  <Input id="confirmarSenha" type="password" {...register('confirmarSenha')} />
                  {errors.confirmarSenha && <p className="text-sm text-red-600 mt-1">{errors.confirmarSenha.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crn">CRN</Label>
                  <Input id="crn" {...register('crn')} placeholder="CRN12345" />
                  {errors.crn && <p className="text-sm text-red-600 mt-1">{errors.crn.message}</p>}
                </div>
                <div>
                  <Label htmlFor="especializacao">Especialização (opcional)</Label>
                  <Input id="especializacao" {...register('especializacao')} placeholder="Ex.: Esportiva" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? 'Enviando...' : 'Cadastrar'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => navigate('/')}
              >
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionistSignup;