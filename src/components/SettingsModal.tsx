import React, { useState } from 'react';
import {
  X,
  Sliders,
  Type,
  SunMedium,
  Glasses,
  BookOpen,
  Volume2,
  Check,
  Save,
} from 'lucide-react';
import { useCognitive, CognitiveShell } from '../context/CognitiveContext.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    activeShell,
    setActiveShell,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    readingRulerEnabled,
    setReadingRulerEnabled,
    bionicReadingEnabled,
    setBionicReadingEnabled,
    tintOverlayEnabled,
    setTintOverlayEnabled,
    tintColor,
    setTintColor,
    brownNoiseVolume,
    setBrownNoiseVolume,
    savePreferencesToBackend,
  } = useCognitive();

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const tintPresets = [
    { label: 'Parchment Cream', color: '#FAF6EE' },
    { label: 'Rose Calming', color: '#FFF1F2' },
    { label: 'Mint Sensory', color: '#F0FDF4' },
    { label: 'Amber Warmth', color: '#FEF3C7' },
    { label: 'Ice Blue Soft', color: '#EFF6FF' },
  ];

  const handleSave = async () => {
    await savePreferencesToBackend();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="AetherOS Cognitive Accessibility Settings"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Cognitive & Accessibility Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Active Shell */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Cognitive Shell Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'standard', name: 'Standard Slate', desc: 'Balanced modern UI' },
                  { id: 'dyslexia', name: 'Dyslexia Parchment', desc: 'Lexend font & high contrast' },
                  { id: 'adhd', name: 'ADHD Focus', desc: 'High dopamine & tunnel view' },
                  { id: 'autism', name: 'Sensory Ease', desc: 'Low sensory load & literal' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveShell(s.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    activeShell === s.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{s.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Typography & Font Family</span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setFontFamily('default')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium ${
                  fontFamily === 'default'
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300'
                }`}
              >
                System Sans
              </button>
              <button
                onClick={() => setFontFamily('lexend')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium font-lexend ${
                  fontFamily === 'lexend'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300'
                }`}
              >
                Lexend (Dyslexia Friendly)
              </button>
            </div>
          </div>

          {/* Sensory Tools Toggles */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Visual Overlays & Fixation Aids
            </label>

            {/* Reading Ruler */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <Glasses className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-semibold text-xs text-slate-200">Interactive Reading Ruler</p>
                  <p className="text-[11px] text-slate-400">Mouse-following highlight band to reduce visual skipping.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={readingRulerEnabled}
                onChange={(e) => setReadingRulerEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                aria-label="Toggle Reading Ruler"
              />
            </div>

            {/* Bionic Reading */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="font-semibold text-xs text-slate-200">Bionic Reading Mode</p>
                  <p className="text-[11px] text-slate-400">Emphasizes first 40% of words for ocular anchors.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={bionicReadingEnabled}
                onChange={(e) => setBionicReadingEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                aria-label="Toggle Bionic Reading"
              />
            </div>

            {/* Tint Overlay */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-800/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SunMedium className="w-4 h-4 text-amber-300" />
                  <div>
                    <p className="font-semibold text-xs text-slate-200">Sensory Tint Overlay</p>
                    <p className="text-[11px] text-slate-400">Soft warm color filter to eliminate screen glare.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tintOverlayEnabled}
                  onChange={(e) => setTintOverlayEnabled(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  aria-label="Toggle Tint Overlay"
                />
              </div>

              {tintOverlayEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Palette:</span>
                  {tintPresets.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setTintColor(preset.color)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        tintColor === preset.color ? 'scale-110 ring-2 ring-indigo-400' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.label}
                      aria-label={`Select ${preset.label} tint`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {savedSuccess ? '✅ Preferences saved to database' : 'Preferences persist to your profile'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
