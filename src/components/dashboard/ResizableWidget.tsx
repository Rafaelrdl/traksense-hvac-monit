import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ResizeHandle {
  position: string;
  cursor: string;
  className: string;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  // Apenas handles verticais para não quebrar o grid horizontal
  { position: 's', cursor: 'ns-resize', className: 'bottom-0 left-0 w-full h-2 cursor-ns-resize' },
  { position: 'n', cursor: 'ns-resize', className: 'top-0 left-0 w-full h-2 cursor-ns-resize' },
  // Handles de canto também funcionam apenas na vertical
  { position: 'se', cursor: 'ns-resize', className: 'bottom-0 right-0 w-3 h-3 cursor-ns-resize' },
  { position: 'sw', cursor: 'ns-resize', className: 'bottom-0 left-0 w-3 h-3 cursor-ns-resize' },
];

interface ResizableWidgetProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
  enabled?: boolean;
  className?: string;
}

export const ResizableWidget: React.FC<ResizableWidgetProps> = ({
  children,
  width,
  height,
  minWidth = 200,
  minHeight = 150,
  onResize,
  onResizeEnd,
  enabled = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStateRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handle: string | null;
  }>({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    handle: null,
  });

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    if (!enabled || !containerRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();

    resizeStateRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      handle,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizeStateRef.current.isResizing || !containerRef.current) return;

    const { startX, startY, startWidth, startHeight, handle } = resizeStateRef.current;
    let deltaY = e.clientY - startY;

    let newHeight = startHeight;

    // Apenas redimensionamento vertical (não mexe na largura do grid)
    if (handle?.includes('s')) {
      newHeight = startHeight + deltaY;
    }
    if (handle?.includes('n')) {
      newHeight = startHeight - deltaY;
    }

    // Aplicar limites - garantir que não ultrapasse mínimos
    const finalHeight = Math.max(minHeight, newHeight);
    
    // Chamar callback de resize apenas com altura (largura mantém do grid)
    onResize?.(startWidth, finalHeight);
  };

  const handleMouseUp = () => {
    if (!resizeStateRef.current.isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    resizeStateRef.current.isResizing = false;

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    onResizeEnd?.(rect.width, rect.height);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full', className)}
      style={{
        // Apenas altura customizada (largura vem do grid)
        height: height ? `${height}px` : undefined,
        minHeight: minHeight ? `${minHeight}px` : undefined,
      }}
    >
      {children}
      
      {enabled && RESIZE_HANDLES.map((handle) => (
        <div
          key={handle.position}
          className={cn(
            'absolute z-50 group',
            handle.className
          )}
          onMouseDown={(e) => handleMouseDown(e, handle.position)}
        >
          <div className={cn(
            'w-full h-full transition-colors',
            'hover:bg-primary/20',
            handle.position.length === 1 && 'group-hover:bg-primary/30'
          )} />
        </div>
      ))}
    </div>
  );
};
