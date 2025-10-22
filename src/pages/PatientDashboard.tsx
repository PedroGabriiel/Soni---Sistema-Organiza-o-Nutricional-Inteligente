
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, FileText, ArrowLeft } from 'lucide-react';
import { mockDietPlan, mockFoods } from '@/data/mockData';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState(mockDietPlan);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportAdherence, setReportAdherence] = useState('');
  const [reportNotes, setReportNotes] = useState('');

  const getSubstitutionOptions = (food: any) => {
    return mockFoods.filter(f => f.category === food.category && f.id !== food.id).slice(0, 3);
  };

  const handleSubstitution = (originalFood: any, newFood: any) => {
    const updatedMeals = dietPlan.meals.map(meal => ({
      ...meal,
      foods: meal.foods.map(food => 
        food.id === originalFood.id ? newFood : food
      )
    }));
    
    setDietPlan({ ...dietPlan, meals: updatedMeals });
    setIsSubstitutionModalOpen(false);
    
    toast({
      title: "Substituição realizada!",
      description: `${originalFood.name} foi substituído por ${newFood.name}.`
    });
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

    setIsReportModalOpen(false);
    setReportAdherence('');
    setReportNotes('');
    
    toast({
      title: "Relatório enviado!",
      description: "Obrigado pelo seu feedback!"
    });
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
            Olá, Ana! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Este é seu plano nutricional de hoje
          </p>
        </div>

        {/* Diet Plan */}
        <div className="space-y-6 mb-8">
          {dietPlan.meals.map((meal) => (
            <Card key={meal.id} className="shadow-soft border-0">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50">
                <CardTitle className="text-xl text-gray-800">{meal.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {meal.foods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{food.quantity} de {food.name}</span>
                      </div>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                Opções para substituir {selectedFood?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {selectedFood && getSubstitutionOptions(selectedFood).map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{option.quantity} de {option.name}</span>
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
