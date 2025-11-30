
import React from 'react';
import { PredictionResult } from '../types';
import { IconCheck } from './Icons';

interface ResultCardProps {
  result: PredictionResult;
  isPrimary?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isPrimary = false }) => {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:scale-[1.02]
        ${isPrimary 
          ? 'bg-gradient-to-br from-medical-600 to-medical-800 text-white shadow-xl ring-4 ring-medical-100' 
          : 'bg-white border border-slate-200 text-slate-700 shadow-md hover:shadow-lg'
        }
      `}
    >
      {isPrimary && (
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <IconCheck className="w-16 h-16" />
        </div>
      )}

      <div className="flex flex-col items-center text-center relative z-10">
        <span className={`
          text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-3
          ${isPrimary ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
        `}>
          {result.type}
        </span>
        
        <div className="mb-1">
          <span className={`text-5xl font-bold tracking-tight ${isPrimary ? 'text-white' : 'text-slate-800'}`}>
            {result.length}
          </span>
          <span className={`text-xl ml-1 font-medium ${isPrimary ? 'text-medical-100' : 'text-slate-400'}`}>mm</span>
        </div>
        
        <div className={`text-sm font-medium mb-4 ${isPrimary ? 'text-medical-100' : 'text-slate-400'}`}>
          LONGITUD SUGERIDA
        </div>

        {/* Barra de confianza */}
        <div className="w-full bg-black/10 rounded-full h-1.5 max-w-[120px] overflow-hidden">
           <div 
             className={`h-full rounded-full ${isPrimary ? 'bg-white' : 'bg-medical-500'}`} 
             style={{ width: `${result.confidence}%` }}
           />
        </div>
        <div className={`text-xs mt-1 ${isPrimary ? 'text-medical-100' : 'text-slate-400'}`}>
          {result.confidence}% Confianza
        </div>
      </div>
    </div>
  );
};
