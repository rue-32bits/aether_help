import React from 'react';
import { useCognitive } from '../context/CognitiveContext.tsx';

export const TintOverlay: React.FC = () => {
  const { tintOverlayEnabled, tintColor } = useCognitive();

  if (!tintOverlayEnabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 transition-colors duration-300 mix-blend-multiply opacity-25"
      style={{
        backgroundColor: tintColor,
      }}
      aria-hidden="true"
    />
  );
};
