import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ResizeHandle {
  position: string;
  cursor: string;
  className: string;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  { position: 'e', cursor: 'ew-resize', className: 'right-0 top-0 h-full w-2 cursor-ew-resize' },
  { position: 'w', cursor: 'ew-resize', className: 'left-0 top-0 h-full w-2 cursor-ew-resize' },
  { position: 's', cursor: 'ns-resize', className: 'bottom-0 left-0 w-full h-2 cursor-ns-resize' },
  { position: 'n', cursor: 'ns-resize', className: 'top-0 left-0 w-full h-2 cursor-ns-resize' },
  { position: 'se', cursor: 'nwse-resize', className: 'bottom-0 right-0 w-3 h-3 cursor-nwse-resize' },
  { position: 'sw', cursor: 'nesw-resize', className: 'bottom-0 left-0 w-3 h-3 cursor-nesw-resize' },
  { position: 'ne', cursor: 'nesw-resize', className: 'top-0 right-0 w-3 h-3 cursor-nesw-resize' },
  { position: 'nw', cursor: 'nwse-resize', className: 'top-0 left-0 w-3 h-3 cursor-nwse-resize' },
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
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);

    onResize?.(newWidth, newHeight);
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
