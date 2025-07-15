import { useRef, useEffect, useState } from 'react';

interface DragState {
  isDragging: boolean;
  position: { x: number; y: number };
  offset: { x: number; y: number };
}

export const useDraggable = (initialPosition?: { x: number; y: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    position: initialPosition || { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      const dragHandle = element.querySelector('[data-drag-handle]');
      if (!dragHandle || !dragHandle.contains(e.target as Node)) return;
      
      const rect = element.getBoundingClientRect();
      const offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      setDragState(prev => ({
        ...prev,
        isDragging: true,
        offset
      }));

      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      setDragState(prev => {
        if (!prev.isDragging) return prev;

        const newPosition = {
          x: e.clientX - prev.offset.x,
          y: e.clientY - prev.offset.y
        };

        // Constrain to viewport
        const rect = element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
        newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));

        return {
          ...prev,
          position: newPosition
        };
      });
    };

    const handleMouseUp = () => {
      setDragState(prev => ({
        ...prev,
        isDragging: false
      }));
    };

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const updatePosition = (newPosition: { x: number; y: number }) => {
    setDragState(prev => ({
      ...prev,
      position: newPosition
    }));
  };

  return {
    elementRef,
    position: dragState.position,
    isDragging: dragState.isDragging,
    updatePosition
  };
};
