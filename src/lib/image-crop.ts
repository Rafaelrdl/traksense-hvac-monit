/**
 * Realiza crop quadrado centralizado de uma imagem
 * @param file - Arquivo de imagem a ser processado
 * @param size - Tamanho de saída em pixels (padrão: 256)
 * @returns Promise com a imagem em base64 (data URL)
 */
export async function cropToSquare(file: File, size: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    // Criar um elemento img para carregar a imagem
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        // Liberar URL temporária
        URL.revokeObjectURL(objectUrl);
        
        // Calcular dimensões do crop centralizado
        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;
        
        // Criar canvas para o crop
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto 2D do canvas'));
          return;
        }
        
        // Configurar qualidade de suavização
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Desenhar a imagem com crop centralizado
        ctx.drawImage(
          img,
          sx, sy, minDimension, minDimension,  // Região de origem (crop quadrado)
          0, 0, size, size                      // Região de destino (redimensionado)
        );
        
        // Exportar como JPEG com qualidade 0.9
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Erro ao carregar a imagem'));
    };
    
    img.src = objectUrl;
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 * @param file - Arquivo a ser validado
 * @param maxSizeMB - Tamanho máximo em MB (padrão: 5)
 * @returns Objeto com validade e mensagem de erro
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Por favor, selecione uma imagem válida (JPG, PNG, GIF, etc.)'
    };
  }
  
  // Validar tamanho
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `A imagem deve ter no máximo ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
}
