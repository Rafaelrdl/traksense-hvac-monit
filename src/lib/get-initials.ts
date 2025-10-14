/**
 * Extrai as iniciais de um nome completo
 * @param firstName - Primeiro nome
 * @param lastName - Sobrenome (opcional)
 * @returns String com as iniciais em maiúsculas (ex: "AS")
 */
export function getInitials(firstName: string, lastName?: string): string {
  if (!firstName) return '?';
  
  const first = firstName.trim()[0] || '';
  
  if (lastName) {
    const last = lastName.trim()[0] || '';
    return (first + last).toUpperCase();
  }
  
  // Se não houver lastName, pega a primeira letra da primeira palavra
  // e a primeira letra da última palavra do nome completo
  const nameParts = firstName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    // Nome único: apenas primeira letra
    return first.toUpperCase();
  }
  
  // Nome composto: primeira letra do primeiro e último nome
  const lastPart = nameParts[nameParts.length - 1];
  return (first + (lastPart[0] || '')).toUpperCase();
}
