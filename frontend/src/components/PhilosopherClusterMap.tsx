import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Philosopher } from '@/constants/types/Philosopher';

interface PhilosopherClusterMapProps {
  philosophers: Philosopher[];
  imageUrls: Record<string, string>;
  onPhilosopherSelect: (philosopherId: string) => void;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface NodePosition {
  x: number;
  y: number;
}

function generatePositions(philosophers: Philosopher[]): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const count = philosophers.length;
  if (count === 0) return positions;

  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / cols);

  const paddingX = 12;
  const paddingY = 15;
  const availableWidth = 100 - paddingX * 2;
  const availableHeight = 100 - paddingY * 2;

  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;

  philosophers.forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const hash = hashString(p.id);

    const jitterX = ((hash % 40) - 20) * (cellWidth / 100);
    const jitterY = (((hash >> 8) % 40) - 20) * (cellHeight / 100);

    positions.set(p.id, {
      x: paddingX + col * cellWidth + cellWidth / 2 + jitterX,
      y: paddingY + row * cellHeight + cellHeight / 2 + jitterY,
    });
  });

  return positions;
}

function generateConnections(
  philosophers: Philosopher[],
  positions: Map<string, NodePosition>
): { from: string; to: string; fromPos: NodePosition; toPos: NodePosition }[] {
  const connections: { from: string; to: string; fromPos: NodePosition; toPos: NodePosition }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < philosophers.length; i++) {
    for (let j = i + 1; j < philosophers.length; j++) {
      const a = philosophers[i];
      const b = philosophers[j];

      const sameCategory = a.metaphysicsCategory && b.metaphysicsCategory &&
        a.metaphysicsCategory === b.metaphysicsCategory;

      const posA = positions.get(a.id);
      const posB = positions.get(b.id);
      if (!posA || !posB) continue;

      const dist = Math.sqrt((posA.x - posB.x) ** 2 + (posA.y - posB.y) ** 2);
      const isNearby = dist < 30;

      if (sameCategory || isNearby) {
        const key = [a.id, b.id].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          connections.push({ from: a.id, to: b.id, fromPos: posA, toPos: posB });
        }
      }
    }
  }
  return connections;
}

const PhilosopherClusterMap: React.FC<PhilosopherClusterMapProps> = ({
  philosophers,
  imageUrls,
  onPhilosopherSelect,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () => [...philosophers].sort((a, b) => a.sortOrder - b.sortOrder),
    [philosophers]
  );

  const positions = useMemo(() => generatePositions(sorted), [sorted]);
  const connections = useMemo(() => generateConnections(sorted, positions), [sorted, positions]);

  const selectedPhilosopher = useMemo(
    () => sorted.find(p => p.id === (selectedId || hoveredId)),
    [sorted, selectedId, hoveredId]
  );

  const handleNodeClick = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const handleStartChat = useCallback(() => {
    if (selectedId) {
      onPhilosopherSelect(selectedId);
    }
  }, [selectedId, onPhilosopherSelect]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {connections.map(({ from, to, fromPos, toPos }, i) => {
          const isHighlighted = hoveredId === from || hoveredId === to ||
            selectedId === from || selectedId === to;
          return (
            <line
              key={`${from}-${to}-${i}`}
              x1={`${fromPos.x}%`}
              y1={`${fromPos.y}%`}
              x2={`${toPos.x}%`}
              y2={`${toPos.y}%`}
              stroke={isHighlighted ? 'var(--ink-primary)' : 'var(--ink-outline-variant)'}
              strokeOpacity={isHighlighted ? 0.3 : 0.15}
              strokeWidth={isHighlighted ? '1' : '0.5'}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Philosopher Nodes */}
      {sorted.map((philosopher) => {
        const pos = positions.get(philosopher.id);
        if (!pos) return null;

        const isSelected = selectedId === philosopher.id;
        const isHovered = hoveredId === philosopher.id;
        const isActive = isSelected || isHovered;
        const hasSelection = selectedId !== null;

        return (
          <div
            key={philosopher.id}
            className="absolute cursor-pointer"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) scale(${isActive ? 1.2 : 1})`,
              opacity: hasSelection && !isActive ? 0.4 : isActive ? 1 : 0.7,
              zIndex: isActive ? 10 : 1,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            }}
            onMouseEnter={() => setHoveredId(philosopher.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleNodeClick(philosopher.id)}
          >
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className={`relative mb-2 rounded-full ${
                isSelected ? 'p-1 border border-ink-primary/40' : ''
              }`}>
                <div className="w-24 h-24 rounded-full overflow-hidden bg-ink-surface-high">
                  {imageUrls[philosopher.id] ? (
                    <img
                      src={imageUrls[philosopher.id]}
                      alt={philosopher.name}
                      className={`w-full h-full object-cover ${
                        isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-60'
                      }`}
                      style={{ transition: 'filter 0.7s ease, opacity 0.5s ease' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-on-surface-variant font-serif italic text-lg">
                      {philosopher.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <span className={`font-serif whitespace-nowrap transition-all duration-500 ${
                isSelected
                  ? 'text-lg text-ink-primary italic'
                  : 'text-sm text-ink-on-surface-variant'
              }`}>
                {philosopher.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Info Panel (Asymmetric Right) */}
      {selectedPhilosopher && selectedId && (
        <aside className="absolute top-24 right-8 w-80 bg-ink-surface-low/80 backdrop-blur-xl p-8 border-l border-ink-outline-variant/15 flex flex-col gap-6 z-20">
          <div className="flex items-start justify-between">
            <span className="font-sans text-2xs tracking-widest text-ink-on-surface-variant uppercase">
              Selected Philosopher
            </span>
            <button
              onClick={() => setSelectedId(null)}
              className="text-ink-outline hover:text-ink-on-surface transition-colors duration-300 -mt-1 -mr-1"
            >
              <CloseIcon sx={{ fontSize: 22 }} />
            </button>
          </div>
          <div>
            {selectedPhilosopher.quote && (
              <h2 className="font-serif text-xl text-ink-on-surface mt-2 italic leading-tight">
                "{selectedPhilosopher.quote}"
              </h2>
            )}
            <p className="font-serif text-lg text-ink-primary mt-4">
              — {selectedPhilosopher.name}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-ink-outline-variant/15">
            <p className="text-sm text-ink-on-surface-variant leading-relaxed font-serif">
              {selectedPhilosopher.description}
            </p>
            <div className="flex items-center gap-2 text-2xs font-sans text-ink-outline">
              <span>{selectedPhilosopher.dates}</span>
              <span>•</span>
              <span>{selectedPhilosopher.location}</span>
            </div>
            {selectedPhilosopher.metaphysicsCategory && (
              <span className="inline-block px-3 py-1 bg-ink-surface-high rounded text-2xs font-sans uppercase text-ink-on-surface-variant">
                {selectedPhilosopher.metaphysicsCategory}
              </span>
            )}
          </div>

          <button
            onClick={handleStartChat}
            className="w-full py-3 bg-ink-primary text-ink-on-primary font-sans text-sm tracking-wide rounded-md hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Begin Dialogue
          </button>
        </aside>
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-ink-primary"></div>
          <span className="font-sans text-2xs tracking-tighter text-ink-on-surface-variant uppercase">
            Primary Influence
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-ink-outline-variant"></div>
          <span className="font-sans text-2xs tracking-tighter text-ink-on-surface-variant uppercase">
            Connected Thought
          </span>
        </div>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 right-8 opacity-40 pointer-events-none">
        <span className="font-sans text-[9px] tracking-widest text-ink-on-surface-variant uppercase">
          Click nodes to reveal details. Press Esc to deselect.
        </span>
      </div>
    </div>
  );
};

export default PhilosopherClusterMap;
