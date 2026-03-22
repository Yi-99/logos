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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left + container.scrollLeft,
        y: e.clientY - rect.top + container.scrollTop,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const getColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return {
        base: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
        active: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)',
      };
    };

    const draw = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const { x: mx, y: my } = mouseRef.current;
      const colors = getColors();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    resizeObserver.observe(container);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={`isolate relative ${className}`} style={{ backgroundColor: 'var(--ink-bg)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none -z-10" />
      {children}
    </div>
  );
};

export default InteractiveDotGrid;
