import React from 'react';
import { Volume2, VolumeX, Play, Pause, Waves } from 'lucide-react';
import { useCognitive } from '../context/CognitiveContext.tsx';

export const BrownNoisePlayer: React.FC = () => {
  const {
    isBrownNoisePlaying,
    toggleBrownNoise,
    brownNoiseVolume,
    setBrownNoiseVolume,
    activeShell,
  } = useCognitive();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrownNoiseVolume(parseFloat(e.target.value));
  };

  const isMuted = brownNoiseVolume === 0;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        activeShell === 'dyslexia'
          ? 'bg-[#f4ecdf] border-[#ded3bf] text-[#1a202c]'
          : activeShell === 'autism'
          ? 'bg-[#242b35] border-[#384353] text-[#94a3b8]'
          : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
      }`}
      role="region"
      aria-label="Brown Noise Synthesizer"
    >
      <button
        onClick={toggleBrownNoise}
        className={`p-1.5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          isBrownNoisePlaying
            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
            : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
        }`}
        aria-label={isBrownNoisePlaying ? 'Pause Brown Noise' : 'Play Brown Noise Synthesizer'}
        title={isBrownNoisePlaying ? 'Pause Brown Noise' : 'Play Masking Brown Noise'}
      >
        {isBrownNoisePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
      </button>

      {/* Title & Animated waveform */}
      <div className="flex items-center gap-1.5">
        <Waves className={`w-3.5 h-3.5 ${isBrownNoisePlaying ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-xs font-medium tracking-tight select-none hidden sm:inline">
          Brown Noise
        </span>
      </div>

      {/* Mini equalizer bars when playing */}
      {isBrownNoisePlaying && (
        <div className="flex items-end gap-0.5 h-3.5 px-0.5" aria-hidden="true">
          <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
          <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
          <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
          <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-3" style={{ animationDelay: '75ms' }} />
        </div>
      )}

      {/* Volume slider */}
      <div className="flex items-center gap-1.5 ml-1">
        <button
          onClick={() => setBrownNoiseVolume(isMuted ? 0.25 : 0)}
          className="text-slate-400 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-400 p-0.5 rounded"
          aria-label={isMuted ? 'Unmute brown noise' : 'Mute brown noise'}
        >
          {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={brownNoiseVolume}
          onChange={handleVolumeChange}
          className="w-14 sm:w-18 h-1 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-amber-500 focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Brown Noise Volume"
          title={`Volume: ${Math.round(brownNoiseVolume * 100)}%`}
        />
      </div>
    </div>
  );
};
