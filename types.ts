export interface VisualSummary {
  tipo: string;
  textos: string[];
  sintomas: string[];
  hipoteses: string[];
  termos_chave: string[];
}

export interface CommandBlock {
  prioridade: 'Alta' | 'Média' | 'Baixa';
  descricao: string;
  execucao: string[];
  pre_checks: string[];
  pos_checks: string[];
  rollback: string[];
  notas: string;
}

export interface EngineeringResponse {
  resumo_visual: VisualSummary;
  perguntas: string[];
  comandos: CommandBlock[];
  variaveis_para_confirmar: string[];
  riscos_e_precaucoes: string[];
  fontes: string[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
