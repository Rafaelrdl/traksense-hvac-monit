export type RuleAction = "EMAIL" | "IN_APP"; // "WEBHOOK" removido

export interface Rule {
  id: string;
  name: string;
  description: string;
  equipmentId: string;       // selecionado em "Equipamentos cadastrados"
  assetTypeId: string;       // DERIVADO do equipmentId (não-editável pelo usuário)
  parameterKey: string;      // do IoTParameter.key
  variableKey?: string;      // variável dentro do parâmetro (quando existir)
  operator: ">" | ">=" | "<" | "<=" | "==" | "!=";
  threshold: number | string;
  unit?: string;             // unidade do parâmetro
  duration: number;          // minutos que a condição deve persistir
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  actions: RuleAction[];     // sem "WEBHOOK"
  enabled: boolean;
  createdAt: number;
  needsReview?: boolean;     // flag para regras que precisam ser revisadas após migração
}

export interface LegacyRule extends Omit<Rule, 'actions'> {
  actions: (RuleAction | 'WEBHOOK')[];  // versão antiga pode ter WEBHOOK
}

// Dados estáticos dos operadores
export const OPERATORS = [
  { value: '>', label: 'Maior que' },
  { value: '<', label: 'Menor que' },
  { value: '==', label: 'Igual a' },
  { value: '>=', label: 'Maior ou igual' },
  { value: '<=', label: 'Menor ou igual' },
  { value: '!=', label: 'Diferente de' },
] as const;

// Dados estáticos das severidades
export const SEVERITIES = [
  { value: 'Critical', label: 'Crítico', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'High', label: 'Alto', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'Medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'Low', label: 'Baixo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
] as const;

// Dados estáticos das ações disponíveis
export const AVAILABLE_ACTIONS = [
  { value: 'EMAIL', label: 'Enviar E-mail' },
  { value: 'IN_APP', label: 'Notificação In-app' },
] as const;