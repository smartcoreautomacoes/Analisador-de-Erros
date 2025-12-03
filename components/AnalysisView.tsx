import React from 'react';
import { EngineeringResponse } from '../types';
import CommandCard from './CommandCard';
import { AlertTriangle, Search, FileText, ShieldAlert, Info } from 'lucide-react';

interface AnalysisViewProps {
  data: EngineeringResponse;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Left Column: Context & Analysis */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Visual Summary */}
        <div className="bg-terminal-gray border border-terminal-border rounded-lg p-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Search className="text-terminal-blue" size={20} />
            Análise Visual
          </h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Tipo Identificado</span>
              <span className="text-white font-mono bg-black/30 px-2 py-1 rounded">{data.resumo_visual.tipo}</span>
            </div>

            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Sintomas Detectados</span>
              <ul className="list-disc list-inside text-gray-300">
                {data.resumo_visual.sintomas.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div>
               <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Texto OCR Relevante</span>
               <div className="flex flex-wrap gap-2">
                 {data.resumo_visual.textos.slice(0, 8).map((t, i) => (
                   <span key={i} className="text-xs bg-terminal-border text-gray-300 px-2 py-1 rounded font-mono truncate max-w-full">
                     {t}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Risks & Warnings */}
        <div className="bg-terminal-gray border border-terminal-red/30 rounded-lg p-4">
          <h2 className="text-lg font-bold text-terminal-red mb-4 flex items-center gap-2">
            <ShieldAlert size={20} />
            Riscos & Precauções
          </h2>
          <ul className="space-y-2">
            {data.riscos_e_precaucoes.map((risk, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <AlertTriangle size={14} className="text-terminal-red min-w-[14px] mt-1" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Variables to Confirm */}
        {data.variaveis_para_confirmar.length > 0 && (
          <div className="bg-terminal-gray border border-terminal-yellow/30 rounded-lg p-4">
             <h2 className="text-lg font-bold text-terminal-yellow mb-4 flex items-center gap-2">
              <Info size={20} />
              Confirmar Variáveis
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.variaveis_para_confirmar.map((v, i) => (
                <span key={i} className="text-sm font-mono bg-terminal-yellow/10 text-terminal-yellow border border-terminal-yellow/20 px-2 py-1 rounded">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* RAG Sources */}
        {data.fontes.length > 0 && (
           <div className="text-xs text-gray-500">
             <span className="font-bold">Fontes utilizadas:</span> {data.fontes.join(', ')}
           </div>
        )}
      </div>

      {/* Right Column: Action Plan */}
      <div className="lg:col-span-2">
        <div className="bg-terminal-gray border border-terminal-border rounded-lg p-6 min-h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-terminal-green" size={24} />
              Plano de Engenharia
            </h2>
            <span className="text-xs bg-terminal-green/20 text-terminal-green px-2 py-1 rounded uppercase tracking-wider">
              {data.comandos.length} Passos
            </span>
          </div>

          {/* Pending Questions Alert */}
          {data.perguntas.length > 0 && (
            <div className="mb-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
              <h3 className="text-terminal-blue font-bold text-sm mb-2">Perguntas Pendentes</h3>
              <ul className="list-decimal list-inside text-sm text-blue-200 space-y-1">
                {data.perguntas.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Commands */}
          <div>
            {data.comandos.map((cmd, index) => (
              <CommandCard key={index} command={cmd} index={index} />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default AnalysisView;
