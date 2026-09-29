import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.tsx';

export type CognitiveShell = 'standard' | 'dyslexia' | 'adhd' | 'autism';

export interface UserPreferences {
  active_shell: CognitiveShell;
  font_family: string;
  font_size: string;
  tint_overlay_enabled: boolean;
  tint_color: string;
  bionic_reading_enabled: boolean;
  reading_ruler_enabled: boolean;
  brown_noise_volume: number;
}

interface CognitiveContextType {
  activeShell: CognitiveShell;
  setActiveShell: (shell: CognitiveShell) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  readingRulerEnabled: boolean;
  setReadingRulerEnabled: (enabled: boolean) => void;
  toggleReadingRuler: () => void;
  bionicReadingEnabled: boolean;
  setBionicReadingEnabled: (enabled: boolean) => void;
  toggleBionicReading: () => void;
  tintOverlayEnabled: boolean;
  setTintOverlayEnabled: (enabled: boolean) => void;
  toggleTintOverlay: () => void;
  tintColor: string;
  setTintColor: (color: string) => void;
  brownNoiseVolume: number;
  setBrownNoiseVolume: (volume: number) => void;
  isBrownNoisePlaying: boolean;
  toggleBrownNoise: () => void;
  isSynapseOpen: boolean;
  setIsSynapseOpen: (open: boolean) => void;
  toggleSynapse: () => void;
  tunnelMode: boolean;
  setTunnelMode: (enabled: boolean) => void;
  toggleTunnelMode: () => void;
  activeCardTab: 'all' | 'adhd' | 'dyslexia' | 'autism' | 'dyscalculia';
  setActiveCardTab: (tab: 'all' | 'adhd' | 'dyslexia' | 'autism' | 'dyscalculia') => void;
  savePreferencesToBackend: () => Promise<void>;
}

const CognitiveContext = createContext<CognitiveContextType | undefined>(undefined);

export const CognitiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();

  const [activeShell, setActiveShellState] = useState<CognitiveShell>('standard');
  const [fontFamily, setFontFamily] = useState<string>('default');
  const [fontSize, setFontSize] = useState<string>('base');
  const [readingRulerEnabled, setReadingRulerEnabled] = useState<boolean>(false);
  const [bionicReadingEnabled, setBionicReadingEnabled] = useState<boolean>(false);
  const [tintOverlayEnabled, setTintOverlayEnabled] = useState<boolean>(false);
  const [tintColor, setTintColor] = useState<string>('#FAF6EE');
  const [brownNoiseVolume, setBrownNoiseVolumeState] = useState<number>(0.25);
  const [isBrownNoisePlaying, setIsBrownNoisePlaying] = useState<boolean>(false);
  const [isSynapseOpen, setIsSynapseOpen] = useState<boolean>(false);
  const [tunnelMode, setTunnelMode] = useState<boolean>(false);
  const [activeCardTab, setActiveCardTab] = useState<'all' | 'adhd' | 'dyslexia' | 'autism' | 'dyscalculia'>('all');

  // Web Audio API generator refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Sync shell to HTML body classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('shell-standard', 'shell-dyslexia', 'shell-adhd', 'shell-autism');
    root.classList.add(`shell-${activeShell}`);
  }, [activeShell]);

  // Load user saved preferences from server
  useEffect(() => {
    if (!token) return;

    fetch('/api/preferences', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((prefs) => {
        if (prefs && prefs.active_shell) {
          setActiveShellState(prefs.active_shell);
          setFontFamily(prefs.font_family || 'default');
          setFontSize(prefs.font_size || 'base');
          setTintOverlayEnabled(Boolean(prefs.tint_overlay_enabled));
          setTintColor(prefs.tint_color || '#FAF6EE');
          setBionicReadingEnabled(Boolean(prefs.bionic_reading_enabled));
          setReadingRulerEnabled(Boolean(prefs.reading_ruler_enabled));
          if (typeof prefs.brown_noise_volume === 'number') {
            setBrownNoiseVolumeState(prefs.brown_noise_volume);
          }
        }
      })
      .catch((err) => console.error('Error fetching preferences:', err));
  }, [token]);

  // Save changes to backend helper
  const savePreferencesToBackend = async () => {
    if (!token) return;
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active_shell: activeShell,
          font_family: fontFamily,
          font_size: fontSize,
          tint_overlay_enabled: tintOverlayEnabled,
          tint_color: tintColor,
          bionic_reading_enabled: bionicReadingEnabled,
          reading_ruler_enabled: readingRulerEnabled,
          brown_noise_volume: brownNoiseVolume,
        }),
      });
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  const setActiveShell = (shell: CognitiveShell) => {
    setActiveShellState(shell);
    // Dynamic contextual defaults per shell
    if (shell === 'dyslexia') {
      setFontFamily('lexend');
      setReadingRulerEnabled(true);
      setTintOverlayEnabled(true);
      setTintColor('#FAF6EE');
      setActiveCardTab('dyslexia');
    } else if (shell === 'adhd') {
      setActiveCardTab('adhd');
    } else if (shell === 'autism') {
      setActiveCardTab('autism');
    } else {
      setActiveCardTab('all');
    }

    if (token) {
      fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active_shell: shell }),
      }).catch(console.error);
    }
  };

  // Web Audio Brown Noise Synthesizer implementation
  const toggleBrownNoise = () => {
    if (isBrownNoisePlaying) {
      stopBrownNoise();
    } else {
      startBrownNoise();
    }
  };

  const startBrownNoise = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a 5-second buffer of true Brown (Red) Noise:
      // Integrating white noise at -6 dB/octave using a 1-pole leaky integrator
      const bufferSize = ctx.sampleRate * 5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Leaky integrator filter for brownian motion
        lastOut = (lastOut + 0.02 * white) / 1.02;
        // Scale to prevent clipping
        output[i] = lastOut * 3.5;
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      // Soft lowpass filter to remove any residual harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      const gain = ctx.createGain();
      gain.gain.value = brownNoiseVolume;

      whiteNoiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoiseSource.start(0);

      noiseNodeRef.current = whiteNoiseSource;
      gainNodeRef.current = gain;
      setIsBrownNoisePlaying(true);
    } catch (err) {
      console.error('Web Audio API Brown Noise failed to initialize:', err);
    }
  };

  const stopBrownNoise = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as AudioBufferSourceNode).stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {
        // ignore already stopped
      }
      noiseNodeRef.current = null;
    }
    setIsBrownNoisePlaying(false);
  };

  const setBrownNoiseVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setBrownNoiseVolumeState(clamped);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        clamped,
        audioCtxRef.current?.currentTime || 0,
        0.05
      );
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopBrownNoise();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleReadingRuler = () => setReadingRulerEnabled((prev) => !prev);
  const toggleBionicReading = () => setBionicReadingEnabled((prev) => !prev);
  const toggleTintOverlay = () => setTintOverlayEnabled((prev) => !prev);
  const toggleSynapse = () => setIsSynapseOpen((prev) => !prev);
  const toggleTunnelMode = () => setTunnelMode((prev) => !prev);

  return (
    <CognitiveContext.Provider
      value={{
        activeShell,
        setActiveShell,
        fontFamily,
        setFontFamily,
        fontSize,
        setFontSize,
        readingRulerEnabled,
        setReadingRulerEnabled,
        toggleReadingRuler,
        bionicReadingEnabled,
        setBionicReadingEnabled,
        toggleBionicReading,
        tintOverlayEnabled,
        setTintOverlayEnabled,
        toggleTintOverlay,
        tintColor,
        setTintColor,
        brownNoiseVolume,
        setBrownNoiseVolume,
        isBrownNoisePlaying,
        toggleBrownNoise,
        isSynapseOpen,
        setIsSynapseOpen,
        toggleSynapse,
        tunnelMode,
        setTunnelMode,
        toggleTunnelMode,
        activeCardTab,
        setActiveCardTab,
        savePreferencesToBackend,
      }}
    >
      {children}
    </CognitiveContext.Provider>
  );
};

export const useCognitive = () => {
  const context = useContext(CognitiveContext);
  if (!context) {
    throw new Error('useCognitive must be used within a CognitiveProvider');
  }
  return context;
};
