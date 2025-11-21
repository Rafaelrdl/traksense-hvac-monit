import { useState, useCallback, useEffect, useRef } from 'react';

export interface ResizableState {
  width: number;
  height: number;
  isResizing: boolean;
}

export type ResizeHandle = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

interface UseResizableOptions {
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
  enabled?: boolean;
  gridSize?: number; // Para snap to grid
}

export const useResizable = (options: UseResizableOptions = {}) => {
  const {
    initialWidth,
    initialHeight,
    minWidth = 200,
    minHeight = 150,
    maxWidth,
    maxHeight,
    onResize,
    onResizeEnd,
    enabled = true,
    gridSize = 1
  } = options;

  const [state, setState] = useState<ResizableState>({
    width: initialWidth || 0,
    height: initialHeight || 0,
    isResizing: false,
  });

  const resizeStateRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handle: ResizeHandle | null;
  }>({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    handle: null,
  });

  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      if (!enabled) return;
      
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget.parentElement;
      if (!target) return;

      const rect = target.getBoundingClientRect();

      resizeStateRef.current = {
        isResizing: true,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        handle,
      };

      setState(prev => ({ ...prev, isResizing: true }));
    },
    [enabled]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeStateRef.current.isResizing) return;

      const { startX, startY, startWidth, startHeight, handle } = resizeStateRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Calcular nova largura e altura baseado no handle
      if (handle?.includes('e')) {
        newWidth = startWidth + deltaX;
      }
      if (handle?.includes('w')) {
        newWidth = startWidth - deltaX;
      }
      if (handle?.includes('s')) {
        newHeight = startHeight + deltaY;
      }
      if (handle?.includes('n')) {
        newHeight = startHeight - deltaY;
      }

      // Aplicar limites
      newWidth = Math.max(minWidth, Math.min(maxWidth || Infinity, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight || Infinity, newHeight));

      // Snap to grid
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);

      setState(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }));

      onResize?.(newWidth, newHeight);
    },
    [minWidth, minHeight, maxWidth, maxHeight, onResize, gridSize]
  );

  const handleMouseUp = useCallback(() => {
    if (!resizeStateRef.current.isResizing) return;

    resizeStateRef.current.isResizing = false;
    setState(prev => ({ ...prev, isResizing: false }));

    onResizeEnd?.(state.width, state.height);
  }, [state.width, state.height, onResizeEnd]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseMove, handleMouseUp]);

  return {
    state,
    handleMouseDown,
    enabled,
  };
};
