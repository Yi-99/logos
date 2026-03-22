import React, { useRef, useEffect } from 'react';

interface InteractiveDotGridProps {
  className?: string;
  children?: React.ReactNode;
}

const GRID_SIZE = 24;
const BASE_RADIUS = 1;
const MAX_RADIUS = 3.5;
const INFLUENCE_RADIUS = 70;

const InteractiveDotGrid: React.FC<InteractiveDotGridProps> = ({ className = '', children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const getColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return {
        base: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
        active: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)',
        bg: isDark ? '#0e0e0e' : '#fbf9f8',
      };
    };

    const draw = () => {
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const { x: mx, y: my } = mouseRef.current;
      const colors = getColors();

      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / GRID_SIZE) + 1;
      const rows = Math.ceil(h / GRID_SIZE) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const dx = col * GRID_SIZE;
          const dy = row * GRID_SIZE;
          const dist = Math.hypot(dx - mx, dy - my);
          const t = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
          const radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * t;

          ctx.beginPath();
          ctx.arc(dx, dy, radius, 0, Math.PI * 2);
          ctx.fillStyle = t > 0 ? colors.active : colors.base;
          ctx.globalAlpha = t > 0 ? 0.3 + t * 0.7 : 1;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ backgroundColor: 'var(--ink-bg)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default InteractiveDotGrid;
