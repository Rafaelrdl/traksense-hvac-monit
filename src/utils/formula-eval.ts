/**
 * Safe formula evaluation utility
 * Allows basic JavaScript expressions with $VALUE$ placeholder
 * Blocks dangerous operations and globals
 */

// Lista de palavras/padrões proibidos para segurança
const DENY_PATTERNS = [
  /window/i,
  /document/i,
  /global/i,
  /process/i,
  /require/i,
  /import/i,
  /\bFunction\b/i,
  /constructor/i,
  /prototype/i,
  /__proto__/i,
  /fetch/i,
  /\beval\b/i,
  /=>/,  // arrow functions
  /\bclass\b/i,
  /\bwhile\b/i,
  /\bfor\s*\(/i,
  /\bdo\s+{/i,
  /\bthis\b/i,
  /\bnew\s+/i,
  /\bdelete\b/i,
  /\bvoid\b/i,
  /\btypeof\s+window/i,
  /\btypeof\s+global/i,
];

/**
 * Helper functions available in formula context
 */
const helpers = {
  /**
   * Clamp value between min and max
   * @example helpers.clamp(150, 0, 100) → 100
   */
  clamp: (value: number, min: number, max: number) => 
    Math.min(Math.max(value, min), max),
  
  /**
   * Round number to specified decimals
   * @example helpers.round(3.14159, 2) → 3.14
   */
  round: (value: number, decimals: number = 0) => 
    Number(Number(value).toFixed(decimals)),
  
  /**
   * Convert to fixed decimal string
   * @example helpers.toFixed(3.14159, 2) → "3.14"
   */
  toFixed: (value: number, decimals: number = 0) => 
    Number(value).toFixed(decimals),
  
  /**
   * Convert celsius to fahrenheit
   * @example helpers.toF(25) → 77
   */
  toF: (celsius: number) => (celsius * 9/5) + 32,
  
  /**
   * Convert fahrenheit to celsius
   * @example helpers.toC(77) → 25
   */
  toC: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
  
  /**
   * Absolute value
   * @example helpers.abs(-5) → 5
   */
  abs: (value: number) => Math.abs(value),
  
  /**
   * Check if value is between min and max (inclusive)
   * @example helpers.between(5, 0, 10) → true
   */
  between: (value: number, min: number, max: number) => 
    value >= min && value <= max,
};

/**
 * Validates formula for security issues
 * @param formula - The formula string to validate
 * @returns true if safe, false if dangerous patterns detected
 */
function validateFormula(formula: string): boolean {
  if (!formula || typeof formula !== 'string') return false;
  
  // Check against deny patterns
  for (const pattern of DENY_PATTERNS) {
    if (pattern.test(formula)) {
      console.warn(`Formula validation failed: pattern ${pattern} detected`);
      return false;
    }
  }
  
  return true;
}

/**
 * Safely evaluates a formula with $VALUE$ placeholder
 * 
 * @param formula - Expression with $VALUE$ placeholder (e.g., "$VALUE$ == true ? 'Ligado' : 'Desligado'")
 * @param value - The value to substitute for $VALUE$
 * @param fallbackValue - Value to return if evaluation fails (default: original value)
 * @returns The evaluated result or fallback
 * 
 * @example
 * safeEvalFormula("$VALUE$ == true ? 'Ligado' : 'Desligado'", true) → "Ligado"
 * safeEvalFormula("($VALUE$ * 9/5) + 32", 25) → 77 (convert C to F)
 * safeEvalFormula("$VALUE$ >= 0.8 ? 'Alto' : 'Baixo'", 0.9) → "Alto"
 */
export function safeEvalFormula(
  formula: string | undefined,
  value: unknown,
  fallbackValue?: unknown
): unknown {
  // If no formula, return original value
  if (!formula || !formula.trim()) {
    return value;
  }
  
  try {
    // Validate formula for security
    if (!validateFormula(formula)) {
      console.error('Formula contains dangerous patterns, returning fallback');
      return fallbackValue !== undefined ? fallbackValue : value;
    }
    
    // Replace $VALUE$ with safe variable name
    const expression = formula.replace(/\$VALUE\$/g, '__v');
    
    // Create safe evaluation function
    // Only expose: __v (value), Math, Number, String, Boolean, helpers
    const fn = new Function(
      '__v',
      'Math',
      'Number',
      'String',
      'Boolean',
      'helpers',
      `"use strict"; return (${expression});`
    );
    
    // Execute with limited scope
    const result = fn(value, Math, Number, String, Boolean, helpers);
    
    return result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    // Return fallback on error
    return fallbackValue !== undefined ? fallbackValue : value;
  }
}

/**
 * Type guard to check if value is a valid formula result
 */
export function isValidFormulaResult(value: unknown): boolean {
  const type = typeof value;
  return (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    value === null ||
    value === undefined
  );
}

/**
 * Format formula result for display
 * Handles numbers, strings, booleans, and null/undefined
 */
export function formatFormulaResult(value: unknown, decimals?: number): string {
  if (value === null || value === undefined) {
    return '—';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  
  if (typeof value === 'number') {
    if (isNaN(value)) return '—';
    if (!isFinite(value)) return '∞';
    
    return decimals !== undefined 
      ? value.toFixed(decimals)
      : value.toString();
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  // Fallback para outros tipos
  return String(value);
}

/**
 * Get example formulas for documentation
 */
export const FORMULA_EXAMPLES = [
  {
    label: 'Boolean para texto',
    formula: '$VALUE$ == true ? "Ligado" : "Desligado"',
    description: 'Converte verdadeiro/falso em texto legível',
  },
  {
    label: 'Celsius para Fahrenheit',
    formula: '($VALUE$ * 9/5) + 32',
    description: 'Converte temperatura °C para °F',
  },
  {
    label: 'Classificação por faixa',
    formula: '$VALUE$ >= 0.8 ? "Alto" : ($VALUE$ >= 0.4 ? "Médio" : "Baixo")',
    description: 'Classifica valor em Alto/Médio/Baixo',
  },
  {
    label: 'Status on/off',
    formula: '$VALUE$ ? "Ativo" : "Inativo"',
    description: 'Mostra status ativo/inativo',
  },
  {
    label: 'Arredondar para 2 casas',
    formula: 'helpers.round($VALUE$, 2)',
    description: 'Arredonda número com 2 decimais',
  },
  {
    label: 'Limitar entre 0-100',
    formula: 'helpers.clamp($VALUE$, 0, 100)',
    description: 'Limita valor entre 0 e 100',
  },
  {
    label: 'Percentual',
    formula: '($VALUE$ * 100).toFixed(1) + "%"',
    description: 'Converte decimal para percentual',
  },
  {
    label: 'Valor absoluto',
    formula: 'helpers.abs($VALUE$)',
    description: 'Remove sinal negativo',
  },
];

/**
 * Get operator documentation
 */
export const FORMULA_OPERATORS = [
  { operator: '+, -, *, /, %', description: 'Operações aritméticas básicas' },
  { operator: '==, ===, !=, !==', description: 'Comparações de igualdade' },
  { operator: '<, >, <=, >=', description: 'Comparações numéricas' },
  { operator: '&&, ||, !', description: 'Operadores lógicos (E, OU, NÃO)' },
  { operator: 'cond ? a : b', description: 'Operador ternário (if-then-else)' },
  { operator: '"texto"', description: 'Strings entre aspas duplas ou simples' },
];
