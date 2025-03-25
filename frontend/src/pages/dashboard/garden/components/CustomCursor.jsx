import React, { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleCanvasMouseEnter = () => {
      setIsVisible(true);
    };

    const handleCanvasMouseLeave = () => {
      setIsVisible(false);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mouseenter', handleCanvasMouseEnter);
      canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mouseenter', handleCanvasMouseEnter);
        canvas.removeEventListener('mouseleave', handleCanvasMouseLeave);
      }
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-100 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0})`,
      }}
    >
      <div className="w-4 h-4 rounded-full bg-white/80 shadow-lg border-2 border-white/20" />
    </div>
  );
} 