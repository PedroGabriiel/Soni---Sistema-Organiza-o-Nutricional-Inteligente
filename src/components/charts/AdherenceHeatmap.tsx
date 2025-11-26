import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdherenceEntry {
  data: string;
  registrado: boolean;
}

interface AdherenceHeatmapProps {
  entries: AdherenceEntry[];
}

export function AdherenceHeatmap({ entries }: AdherenceHeatmapProps) {
  // Get last 8 weeks of data
  const today = new Date();
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(today.getDate() - 56); // 8 weeks = 56 days

  // Create a map of dates to adherence
  const adherenceMap = new Map<string, boolean>();
  entries.forEach(entry => {
    const date = new Date(entry.data);
    if (date >= eightWeeksAgo && date <= today) {
      adherenceMap.set(entry.data, entry.registrado);
    }
  });

  // Generate 8 weeks of days
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  for (let i = 55; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getColorClass = (date: Date): string => {
    const dateStr = date.toISOString().split('T')[0];
    const hasEntry = adherenceMap.get(dateStr);
    
    if (hasEntry === undefined) {
      return 'bg-gray-100 dark:bg-gray-800';
    }
    
    return hasEntry 
      ? 'bg-emerald-500 dark:bg-emerald-600' 
      : 'bg-red-300 dark:bg-red-700';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs text-muted-foreground justify-end">
        <span>Dom</span>
        <span className="w-6 text-center">Seg</span>
        <span className="w-6 text-center">Ter</span>
        <span className="w-6 text-center">Qua</span>
        <span className="w-6 text-center">Qui</span>
        <span className="w-6 text-center">Sex</span>
        <span className="w-6 text-center">Sáb</span>
      </div>
      
      <TooltipProvider>
        <div className="space-y-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex gap-1">
              {week.map((date, dayIdx) => {
                const dateStr = date.toISOString().split('T')[0];
                const hasEntry = adherenceMap.get(dateStr);
                
                return (
                  <Tooltip key={dayIdx}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-6 h-6 rounded-sm ${getColorClass(date)} transition-colors cursor-pointer hover:ring-2 hover:ring-primary`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-semibold">{formatDate(date)}</p>
                        <p>
                          {hasEntry === undefined && 'Sem registro'}
                          {hasEntry === true && 'Registrado'}
                          {hasEntry === false && 'Não registrado'}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span>Registrado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-300" />
          <span>Não registrado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <span>Sem dados</span>
        </div>
      </div>
    </div>
  );
}
