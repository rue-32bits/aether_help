import React, { useEffect, useState } from 'react';
import { useCognitive } from '../context/CognitiveContext.tsx';

export const ReadingRuler: React.FC = () => {
  const { readingRulerEnabled, activeShell } = useCognitive();
  const [mouseY, setMouseY] = useState<number>(300);
  const [rulerHeight, setRulerHeight] = useState<number>(38);

  useEffect(() => {
    if (!readingRulerEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingRulerEnabled]);

  if (!readingRulerEnabled) return null;

  const topMaskHeight = Math.max(0, mouseY - rulerHeight / 2);
  const bandTop = topMaskHeight;
  const bottomMaskTop = mouseY + rulerHeight / 2;

  // Mask color adapts to shell
  const maskBg =
    activeShell === 'dyslexia'
      ? 'rgba(60, 48, 30, 0.28)'
      : activeShell === 'autism'
      ? 'rgba(15, 20, 25, 0.40)'
      : 'rgba(0, 0, 0, 0.42)';

  const highlightBorder =
    activeShell === 'dyslexia'
      ? 'rgba(217, 119, 6, 0.5)'
      : activeShell === 'adhd'
      ? 'rgba(16, 185, 129, 0.5)'
      : 'rgba(99, 102, 241, 0.5)';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-200"
      aria-hidden="true"
    >
      {/* Top Dimmed Area */}
      <div
        className="absolute top-0 left-0 right-0 backdrop-blur-[0.5px]"
        style={{
          height: `${topMaskHeight}px`,
          backgroundColor: maskBg,
        }}
      />

      {/* Focused Reading Line Band */}
      <div
        className="absolute left-0 right-0 border-y transition-all duration-75"
        style={{
          top: `${bandTop}px`,
          height: `${rulerHeight}px`,
          borderColor: highlightBorder,
          backgroundColor:
            activeShell === 'dyslexia'
              ? 'rgba(254, 243, 199, 0.18)'
              : 'rgba(99, 102, 241, 0.08)',
          boxShadow: `0 0 16px ${
            activeShell === 'dyslexia' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(99, 102, 241, 0.15)'
          }`,
        }}
      >
        {/* Soft edge guiding guides */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-mono tracking-wider text-amber-600 dark:text-amber-400 select-none">
            FOCUS LINE
          </span>
        </div>
      </div>

      {/* Bottom Dimmed Area */}
      <div
        className="absolute bottom-0 left-0 right-0 backdrop-blur-[0.5px]"
        style={{
          top: `${bottomMaskTop}px`,
          backgroundColor: maskBg,
        }}
      />
    </div>
  );
};
