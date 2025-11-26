
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, FileText, ArrowLeft, Plus, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_ENDPOINTS } from '@/config/api';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState<any | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [substitutionGroups, setSubstitutionGroups] = useState<any[]>([]);
  const [substitutionOptions, setSubstitutionOptions] = useState<any[]>([]);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportAdherence, setReportAdherence] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [addingMealIndex, setAddingMealIndex] = useState<number | null>(null);
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ alimento: '', quantidade: '', unidade_medida: '', proteinas: '', carboidratos: '', categoria: '' });

  const getFoodName = (food: any) => {
    return food?.alimento || food?.nome || food?.name || food?.alimento_name || '';
  };

  const getSubstitutionOptions = (food: any) => {
    if (!food) return [];
    const matchId = food.alimento_id || food.item_alimento_id || food.alimentoId || null;
    const name = getFoodName(food).toString().toLowerCase();

    // find groups that include this alimento
    const matchingGroups = substitutionGroups.filter((g) => {
      return Array.isArray(g.alimentos) && g.alimentos.some((a: any) => {
        const aId = a.alimento_id || a.id || a.alimentoId || null;
        const aName = (a.alimento || a.nome || a.name || '').toString().toLowerCase();
        if (matchId && aId) return String(aId) === String(matchId);
        return aName === name || (a.categoria && String(a.categoria).toLowerCase() === (food.categoria || '').toString().toLowerCase());
      });
    });

    // collect other alimentos from these groups (exclude original)
    const candidatesMap: Record<string, any> = {};
    matchingGroups.forEach(g => {
      (g.alimentos || []).forEach((a: any) => {
        const key = String(a.alimento_id || a.id || a.nome || a.alimento || a.name || JSON.stringify(a));
        if (!matchId || String(a.alimento_id || a.id || a.nome || a.alimento || a.name) !== String(matchId) ) {
          candidatesMap[key] = a;
        } else {
          const aName = (a.alimento || a.nome || a.name || '').toString().toLowerCase();
          if (aName !== name) candidatesMap[key] = a;
        }
      });
    });

    const candidates = Object.values(candidatesMap);
    if (candidates.length === 0 && food.categoria) {
      substitutionGroups.forEach(g => {
        (g.alimentos || []).forEach((a: any) => {
          if ((a.categoria || '').toString().toLowerCase() === (food.categoria || '').toString().toLowerCase()) {
            const key = String(a.alimento_id || a.id || a.nome || a.alimento || a.name || JSON.stringify(a));
            candidatesMap[key] = a;
          }
        });
      });
    }

    return Object.values(candidatesMap).slice(0, 6);
  };

  const handleSubstitution = async (originalFood: any, newFood: any) => {
    if (!dietPlan) return;

    const matchItem = (it: any) => {
      const origId = originalFood.item_refeicao_id || originalFood.item_id || originalFood.itemId || null;
      const itId = it.item_refeicao_id || it.item_id || it.itemId || null;
      if (origId && itId) return String(origId) === String(itId);
      const origAlId = originalFood.alimento_id || originalFood.alimentoId || null;
      const itAlId = it.alimento_id || it.alimentoId || null;
      if (origAlId && itAlId) return String(origAlId) === String(itAlId);
      const origName = (originalFood.alimento || originalFood.nome || originalFood.name || '').toString().toLowerCase();
      const itName = (it.alimento || it.nome || it.alimento_name || it.name || '').toString().toLowerCase();
      return origName && itName && origName === itName;
    };

    const updated = {
      ...dietPlan,
      refeicoes: (dietPlan.refeicoes || []).map((r: any) => ({
        ...r,
        itens: (r.itens || []).map((it: any) => {
          if (matchItem(it)) {
            return {
              ...it,
              alimento: getFoodName(newFood) || it.alimento,
              alimento_id: newFood.alimento_id || newFood.id || it.alimento_id,
              proteinas: newFood.proteinas_100g ?? newFood.proteinas ?? it.proteinas,
              carboidratos: newFood.carboidratos_100g ?? newFood.carboidratos ?? it.carboidratos,
              categoria: newFood.categoria ?? newFood.category ?? it.categoria,
            };
          }
          return it;
        })
      }))
    };

    setDietPlan(updated);
    setIsSubstitutionModalOpen(false);

    // persist
    const saved = await saveDietToServer(updated);
    if (saved) {
      toast({ title: 'Substituição salva', description: `${getFoodName(originalFood)} foi substituído por ${getFoodName(newFood)}.` });
      // reload diet from server
      try {
        const session = JSON.parse(sessionStorage.getItem('patient_session')!);
        const res = await fetch(`${API_ENDPOINTS.getPatientDiet}?paciente_id=${session.paciente_id}`);
        const j = await res.json();
        if (j.ok && Array.isArray(j.data) && j.data.length > 0) setDietPlan(j.data[0]);
      } catch (e) {
        console.error('Erro ao recarregar dieta', e);
      }
    } else {
      toast({ title: 'Erro', description: 'Não foi possível salvar a substituição.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    // load substitution groups on mount
    const loadGroups = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.getSubstitutionGroups);
        const j = await res.json();
        if (j.ok && Array.isArray(j.data)) setSubstitutionGroups(j.data);
      } catch (e) {
        console.error('Erro ao carregar grupos de substituição', e);
      }
    };

    const loadDiet = async () => {
      const session = sessionStorage.getItem('patient_session');
      if (!session) return; // not logged
      try {
        const p = JSON.parse(session);
        if (p.nome) setPatientName(p.nome);
        const pacienteId = p.paciente_id;
        const res = await fetch(`${API_ENDPOINTS.getPatientDiet}?paciente_id=${pacienteId}`);
        const json = await res.json();
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          // use most recent diet
          setDietPlan(json.data[0]);
        } else {
          // empty placeholder
          setDietPlan({ dieta_id: null, nome: 'Plano Atual', refeicoes: [] });
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadGroups();
    loadDiet();
  }, []);

  // when selectedFood or groups change, compute options
  useEffect(() => {
    if (!selectedFood) {
      setSubstitutionOptions([]);
      return;
    }
    const opts = getSubstitutionOptions(selectedFood);
    setSubstitutionOptions(opts);
  }, [selectedFood, substitutionGroups]);

  const saveDietToServer = async (plan: any) => {
    const session = sessionStorage.getItem('patient_session');
    if (!session) return false;
    const p = JSON.parse(session);
    const payload = {
      paciente_id: p.paciente_id,
      dieta_id: plan.dieta_id || 0,
      nome: plan.nome || 'Plano via app',
      data_inicio: plan.data_inicio || null,
      data_fim: plan.data_fim || null,
      refeicoes: plan.refeicoes.map((r: any) => ({
        nome: r.nome,
        horario: r.horario || null,
        itens: r.itens.map((it: any) => ({ alimento: it.alimento || it.nome || it.alimento_name, quantidade: it.quantidade || it.qtd || '', unidade_medida: it.unidade_medida || it.um || '', proteinas: it.proteinas ?? null, carboidratos: it.carboidratos ?? null, categoria: it.categoria ?? null }))
      }))
    };
    try {
      const res = await fetch(API_ENDPOINTS.savePatientDiet, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      return j.ok ? j.data : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleAddFood = async () => {
    if (addingMealIndex === null || !dietPlan) return;
    const meal = dietPlan.refeicoes ? dietPlan.refeicoes[addingMealIndex] : null;
    const item = {
      alimento: newItem.alimento,
      quantidade: newItem.quantidade,
      unidade_medida: newItem.unidade_medida,
      proteinas: newItem.proteinas ? parseFloat(newItem.proteinas) : null,
      carboidratos: newItem.carboidratos ? parseFloat(newItem.carboidratos) : null,
      categoria: newItem.categoria || null,
    };
    // update local state (append or replace if editing)
    const updated = { ...dietPlan };
    if (!updated.refeicoes) updated.refeicoes = [];
    if (!updated.refeicoes[addingMealIndex]) updated.refeicoes[addingMealIndex] = { nome: `Refeição ${addingMealIndex+1}`, horario: null, itens: [] };
    updated.refeicoes[addingMealIndex].itens = updated.refeicoes[addingMealIndex].itens || [];
    if (editingMealIndex !== null && editingItemIndex !== null && editingMealIndex === addingMealIndex) {
      // replace existing item
      updated.refeicoes[addingMealIndex].itens[editingItemIndex] = { ...updated.refeicoes[addingMealIndex].itens[editingItemIndex], ...item };
    } else {
      updated.refeicoes[addingMealIndex].itens.push(item);
    }
    setDietPlan(updated);

    // save to server
    const saved = await saveDietToServer(updated);
    if (saved) {
      toast({ title: 'Sucesso', description: 'Alimento adicionado à dieta.' });
      // reload diet to reflect generated IDs
      const session = JSON.parse(sessionStorage.getItem('patient_session')!);
      const res = await fetch(`${API_ENDPOINTS.getPatientDiet}?paciente_id=${session.paciente_id}`);
      const j = await res.json();
      if (j.ok && Array.isArray(j.data) && j.data.length > 0) setDietPlan(j.data[0]);
    } else {
      toast({ title: 'Erro', description: 'Não foi possível salvar a dieta.', variant: 'destructive' });
    }

    // reset add modal
    setIsAddFoodModalOpen(false);
    setAddingMealIndex(null);
    setEditingMealIndex(null);
    setEditingItemIndex(null);
    setNewItem({ alimento: '', quantidade: '', unidade_medida: '', proteinas: '', carboidratos: '', categoria: '' });
  };

  const handleDeleteItem = async (mealIndex: number, itemIndex: number) => {
    if (!dietPlan) return;
    const isPersisted = Boolean(dietPlan.dieta_id);
    if (!isPersisted) {
      // just remove locally
      const updated = { ...dietPlan };
      updated.refeicoes = (updated.refeicoes || []).map((r: any, idx: number) => ({ ...r, itens: [...(r.itens || [])] }));
      updated.refeicoes[mealIndex].itens.splice(itemIndex, 1);
      setDietPlan(updated);
      toast({ title: 'Removido', description: 'Alimento removido (local).' });
      return;
    }

    if (!confirm('Tem certeza que deseja remover este alimento da dieta?')) return;

    const updated = { ...dietPlan };
    updated.refeicoes = (updated.refeicoes || []).map((r: any) => ({ ...r, itens: [...(r.itens || [])] }));
    updated.refeicoes[mealIndex].itens.splice(itemIndex, 1);
    setDietPlan(updated);

    const saved = await saveDietToServer(updated);
    if (saved) {
      toast({ title: 'Removido', description: 'Alimento removido da dieta.' });
      // reload
      try {
        const session = JSON.parse(sessionStorage.getItem('patient_session')!);
        const res = await fetch(`${API_ENDPOINTS.getPatientDiet}?paciente_id=${session.paciente_id}`);
        const j = await res.json();
        if (j.ok && Array.isArray(j.data) && j.data.length > 0) setDietPlan(j.data[0]);
      } catch (e) { console.error(e); }
    } else {
      toast({ title: 'Erro', description: 'Não foi possível remover o alimento.', variant: 'destructive' });
    }
  };

  const handleEditItem = (mealIndex: number, itemIndex: number) => {
    if (!dietPlan) return;
    const item = dietPlan.refeicoes?.[mealIndex]?.itens?.[itemIndex];
    if (!item) return;
    setNewItem({ alimento: item.alimento || item.nome || '', quantidade: item.quantidade || '', unidade_medida: item.unidade_medida || '', proteinas: item.proteinas ? String(item.proteinas) : (item.proteinas_100g ? String(item.proteinas_100g) : ''), carboidratos: item.carboidratos ? String(item.carboidratos) : (item.carboidratos_100g ? String(item.carboidratos_100g) : ''), categoria: item.categoria || '' });
    setAddingMealIndex(mealIndex);
    setEditingMealIndex(mealIndex);
    setEditingItemIndex(itemIndex);
    setIsAddFoodModalOpen(true);
  };

  const handleReportSubmit = () => {
    if (!reportAdherence) {
      toast({
        title: "Erro",
        description: "Por favor, selecione como foi sua alimentação hoje.",
        variant: "destructive"
      });
      return;
    }

    // build payload and send to server
    (async () => {
      const session = sessionStorage.getItem('patient_session');
      if (!session) {
        toast({ title: 'Erro', description: 'Sessão inválida', variant: 'destructive' });
        return;
      }
      const p = JSON.parse(session);
      const payload = {
        paciente_id: p.paciente_id,
        data_hora: new Date().toISOString().slice(0, 19).replace('T', ' '),
        descricao: reportNotes || null,
        feedback: reportAdherence || null,
        foto: null
      };
      try {
        const res = await fetch(API_ENDPOINTS.savePatientReport, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await res.json();
        if (j.ok) {
          setIsReportModalOpen(false);
          setReportAdherence('');
          setReportNotes('');
          toast({ title: 'Relatório enviado!', description: 'Obrigado pelo seu feedback!' });
        } else {
          throw new Error(j.message || 'Erro ao enviar relatório');
        }
      } catch (e: any) {
        console.error('Erro ao enviar relatório', e);
        toast({ title: 'Erro', description: e.message || 'Falha ao enviar relatório', variant: 'destructive' });
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Logo size="sm" />
          <div />
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {patientName ? `Olá, ${patientName}! ` : 'Olá! '}
          </h1>
          <p className="text-gray-600 text-lg">
            Este é seu plano nutricional
          </p>
        </div>

        {/* Diet Plan */}
        <div className="space-y-6 mb-8">
          {!dietPlan ? (
            <div className="text-center text-gray-600">Carregando plano...</div>
          ) : dietPlan.refeicoes && dietPlan.refeicoes.length > 0 ? (
            dietPlan.refeicoes.map((meal: any, mi: number) => (
              <Card key={meal.refeicao_id || mi} className="shadow-soft border-0">
                <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800">{meal.nome}</CardTitle>
                  <div className="pr-4">
                    <Button size="sm" onClick={() => { setAddingMealIndex(mi); setIsAddFoodModalOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar alimento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {meal.itens && meal.itens.length > 0 ? meal.itens.map((food: any, fi: number) => (
                      <div key={food.item_refeicao_id || food.alimento_id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{(food.alimento || food.nome || food.alimento_name) + (food.quantidade ? ` — ${food.quantidade}` : '')}</div>
                          <div className="text-xs text-gray-500">Categoria: {food.categoria || '—'} • Proteínas: {food.proteinas_100g ?? food.proteinas ?? '-'} g • Carboidratos: {food.carboidratos_100g ?? food.carboidratos ?? '-' } g</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedFood(food);
                              setIsSubstitutionModalOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Substituir
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-gray-600">Nenhum alimento cadastrado nesta refeição.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-600">Nenhuma dieta disponível.</div>
          )}
        </div>

        {/* Add Food Modal */}
        <Dialog open={isAddFoodModalOpen} onOpenChange={setIsAddFoodModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Adicionar alimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Alimento</Label>
                <Input value={newItem.alimento} onChange={(e) => setNewItem({ ...newItem, alimento: e.target.value })} placeholder="Ex: Frango grelhado" className="mt-1" />
              </div>
                <div className="grid md:grid-cols-3 gap-2">
                <div>
                  <Label>Quantidade</Label>
                  <Input value={newItem.quantidade} onChange={(e) => setNewItem({ ...newItem, quantidade: e.target.value })} className="mt-1" />
                </div>
                {/** Mostrar campo Unidade apenas quando editando uma dieta já salva */}
                {dietPlan && dietPlan.dieta_id ? (
                  <div>
                    <Label>Unidade</Label>
                    <Input value={newItem.unidade_medida} onChange={(e) => setNewItem({ ...newItem, unidade_medida: e.target.value })} className="mt-1" />
                  </div>
                ) : null}
                <div>
                  <Label>Categoria</Label>
                  <Input value={newItem.categoria} onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })} className="mt-1" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <Label>Proteínas (g por porção)</Label>
                  <Input value={newItem.proteinas} onChange={(e) => setNewItem({ ...newItem, proteinas: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Carboidratos (g por porção)</Label>
                  <Input value={newItem.carboidratos} onChange={(e) => setNewItem({ ...newItem, carboidratos: e.target.value })} className="mt-1" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setIsAddFoodModalOpen(false); setAddingMealIndex(null); }}>Cancelar</Button>
                <Button onClick={handleAddFood} className="bg-primary">
                  <Save className="mr-2 h-4 w-4" /> Salvar alimento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Button */}
        <div className="text-center">
          <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary-600 shadow-soft" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Relatar meu dia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-gray-800">Como foi sua alimentação hoje?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { value: 'complete', label: 'Consegui seguir 100%' },
                    { value: 'partial', label: 'Segui parcialmente' },
                    { value: 'none', label: 'Não consegui seguir' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <input
                        type="radio"
                        name="adherence"
                        value={option.value}
                        checked={reportAdherence === option.value}
                        onChange={(e) => setReportAdherence(e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descreva suas dificuldades ou observações
                  </label>
                  <textarea
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    placeholder="Opcional: conte como foi seu dia..."
                  />
                </div>
                <Button onClick={handleReportSubmit} className="w-full">
                  Enviar Relatório
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Substitution Modal */}
        <Dialog open={isSubstitutionModalOpen} onOpenChange={setIsSubstitutionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-800">
                Opções para substituir {getFoodName(selectedFood)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {selectedFood && substitutionOptions.length === 0 && (
                <div className="text-gray-600">Nenhuma sugestão encontrada para este alimento.</div>
              )}
              {selectedFood && substitutionOptions.map((option) => (
                <div key={option.alimento_id || option.id || option.nome || JSON.stringify(option)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{getFoodName(option)}</div>
                    <div className="text-xs text-gray-500">Categoria: {option.categoria || option.category || '—'} • Proteínas: {option.proteinas_100g ?? option.proteinas ?? '-'} g • Carboidratos: {option.carboidratos_100g ?? option.carboidratos ?? '-' } g</div>
                  </div>
                  <Button
                    onClick={() => handleSubstitution(selectedFood, option)}
                    size="sm"
                    className="bg-primary hover:bg-primary-600"
                  >
                    Escolher
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientDashboard;
