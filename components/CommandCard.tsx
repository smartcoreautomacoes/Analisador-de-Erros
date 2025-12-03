import React, { useState } from 'react';
import { CommandBlock } from '../types';
import { AlertTriangle, CheckCircle2, Terminal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface CommandCardProps {
  command: CommandBlock;
  index: number;
}

const CommandCard: React.FC<CommandCardProps> = ({ command, index }) => {
  const [expanded, setExpanded] = useState(true);

  const priorityColor = {
    'Alta': 'border-terminal-red text-terminal-red bg-terminal-red/10',
    'Média': 'border-terminal-yellow text-terminal-yellow bg-terminal-yellow/10',
    'Baixa': 'border-terminal-blue text-terminal-blue bg-terminal-blue/10',
  };

  const priorityBadge = {
    'Alta': 'bg-terminal-red text-white',
    'Média': 'bg-terminal-yellow text-black',
    'Baixa': 'bg-terminal-blue text-white',
  };

  return (
    <div className={`border border-l-4 rounded-lg mb-4 overflow-hidden bg-terminal-gray ${priorityColor[command.prioridade].split(' ')[0]}`}>
      {/* Header */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${priorityBadge[command.prioridade]}`}>
            {command.prioridade}
          </span>
          <h3 className="text-sm font-semibold text-white">
            #{index + 1} {command.descricao}
          </h3>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 border-t border-terminal-border space-y-4">
          
          {/* Pre-checks */}
          {command.pre_checks.length > 0 && (
            <div className="text-sm">
              <div className="flex items-center gap-2 text-terminal-blue mb-2">
                <CheckCircle2 size={16} />
                <span className="font-mono uppercase text-xs font-bold tracking-wider">Pre-Checks / Validações Iniciais</span>
              </div>
              <div className="bg-black/50 p-2 rounded border border-terminal-border/50">
                {command.pre_checks.map((check, i) => (
                  <div key={i} className="font-mono text-gray-400 mb-1 last:mb-0">$ {check}</div>
                ))}
              </div>
            </div>
          )}

          {/* Execution */}
          <div>
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Terminal size={16} />
              <span className="font-mono uppercase text-xs font-bold tracking-wider">Execução</span>
            </div>
            <div className="bg-black p-3 rounded border border-terminal-border font-mono text-sm relative group">
              {command.execucao.map((cmd, i) => (
                <div key={i} className="text-green-400 mb-1 last:mb-0 whitespace-pre-wrap pl-4 relative">
                   <span className="absolute left-0 opacity-50 select-none text-gray-600">{'>'}</span>
                   {cmd}
                </div>
              ))}
            </div>
            {command.notas && (
               <p className="mt-2 text-xs text-gray-500 italic">Nota: {command.notas}</p>
            )}
          </div>

          {/* Post-checks & Rollback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {command.pos_checks.length > 0 && (
              <div className="text-sm">
                <div className="flex items-center gap-2 text-terminal-blue mb-2">
                  <CheckCircle2 size={16} />
                  <span className="font-mono uppercase text-xs font-bold tracking-wider">Post-Checks</span>
                </div>
                <div className="bg-black/50 p-2 rounded border border-terminal-border/50 font-mono text-gray-400 text-xs">
                  {command.pos_checks.map((check, i) => (
                    <div key={i} className="mb-1">$ {check}</div>
                  ))}
                </div>
              </div>
            )}

            {command.rollback.length > 0 && (
              <div className="text-sm">
                 <div className="flex items-center gap-2 text-terminal-yellow mb-2">
                  <RotateCcw size={16} />
                  <span className="font-mono uppercase text-xs font-bold tracking-wider">Rollback Plan</span>
                </div>
                <div className="bg-black/50 p-2 rounded border border-terminal-border/50 font-mono text-terminal-yellow text-xs">
                  {command.rollback.map((cmd, i) => (
                    <div key={i} className="mb-1">$ {cmd}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CommandCard;
