import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { NutrientDeviation } from '@/lib/clinicalUtils';

interface NutrientDeviationChartProps {
  data: NutrientDeviation[];
}

export function NutrientDeviationChart({ data }: NutrientDeviationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 40, right: 40, top: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        
        <XAxis
          type="number"
          hide
          domain={[-50, 50]}
        />
        
        <YAxis
          type="category"
          dataKey="nutriente"
          stroke="hsl(var(--foreground))"
          width={100}
          tick={{ fontSize: 12, fontWeight: 500 }}
        />

        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />

        <Tooltip
          cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload as NutrientDeviation;
              return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-sm">
                  <p className="font-bold mb-1">{d.nutriente}</p>
                  <p>Ingestão: <span className="font-mono">{d.atual.toFixed(0)}g</span></p>
                  <p className="text-muted-foreground text-xs">
                    Meta: {d.minimo}-{d.maximo}g
                  </p>
                  <p className={`mt-2 font-medium ${
                    d.status === 'good'? 'text-emerald-500' : 
                    d.status === 'low'? 'text-blue-500' : 'text-red-500'
                  }`}>
                    {d.status === 'good'? 'Dentro da Meta' : 
                     d.status === 'low'? 'Abaixo do Mínimo' : 'Acima do Máximo'}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />

        <Bar dataKey="desvio" radius={[4, 4, 4, 4]} barSize={20}>
          {data.map((entry, index) => {
            let color;
            if (entry.status === 'good') {
              color = '#10b981';
            } else if (entry.status === 'low') {
              color = '#3b82f6';
            } else {
              color = '#ef4444';
            }
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
