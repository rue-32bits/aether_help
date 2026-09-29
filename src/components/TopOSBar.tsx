import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Sliders,
  LogOut,
  User as UserIcon,
  Glasses,
  BookOpen,
  SunMedium,
  Layers,
  Zap,
  Activity,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useCognitive, CognitiveShell } from '../context/CognitiveContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { BrownNoisePlayer } from './BrownNoisePlayer.tsx';

interface TopOSBarProps {
  onOpenSettings?: () => void;
}

export const TopOSBar: React.FC<TopOSBarProps> = ({ onOpenSettings }) => {
  const {
    activeShell,
    setActiveShell,
    readingRulerEnabled,
    toggleReadingRuler,
    bionicReadingEnabled,
    toggleBionicReading,
    tintOverlayEnabled,
    toggleTintOverlay,
    tunnelMode,
    toggleTunnelMode,
    toggleSynapse,
    isSynapseOpen,
  } = useCognitive();

  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShellDropdownOpen, setIsShellDropdownOpen] = useState(false);

  const shells: { id: CognitiveShell; label: string; desc: string; icon: string; color: string }[] = [
    {
      id: 'standard',
      label: 'Standard',
      desc: 'Balanced modern slate workspace',
      icon: '⚙️',
      color: 'border-slate-500 text-slate-300',
    },
    {
      id: 'dyslexia',
      label: 'Dyslexia',
      desc: 'Lexend typography, cream parchment & high contrast',
      icon: '📖',
      color: 'border-amber-600 text-amber-800 bg-amber-50',
    },
    {
      id: 'adhd',
      label: 'ADHD Focus',
      desc: 'High dopamine, micro-steps & tunnel view',
      icon: '⚡',
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
    },
    {
      id: 'autism',
      label: 'Sensory Ease',
      desc: 'Ultra-low sensory load & literal communication',
      icon: '🌿',
      color: 'border-teal-500 text-teal-300 bg-teal-950/40',
    },
  ];

  return (
    <header
      className={`sticky top-0 z-30 w-full px-4 py-2.5 border-b backdrop-blur-md transition-colors ${
        activeShell === 'dyslexia'
          ? 'bg-[#faf6ee]/90 border-[#ded3bf] text-[#1a202c]'
          : activeShell === 'autism'
          ? 'bg-[#1e232a]/95 border-[#303844] text-[#cbd5e1]'
          : activeShell === 'adhd'
          ? 'bg-[#0d1117]/95 border-[#30363d] text-[#f0f6fc]'
          : 'bg-[#0b0f17]/90 border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-sm">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg">
                  Aether<span className="text-indigo-400 dark:text-indigo-300 font-extrabold">OS</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                  · Adaptive Cognitive Desktop
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Shell Switcher Segmented Control */}
          <div
            className="hidden lg:flex items-center gap-1 p-1 rounded-xl border border-slate-700/60 bg-black/25"
            role="tablist"
            aria-label="Cognitive Shell Selector"
          >
            {shells.map((s) => {
              const isActive = activeShell === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveShell(s.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={s.desc}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile / Compact Shell Dropdown */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsShellDropdownOpen(!isShellDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800/90 font-medium"
              aria-label="Switch active cognitive shell"
            >
              <span>{shells.find((s) => s.id === activeShell)?.icon}</span>
              <span className="font-semibold capitalize">{activeShell}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isShellDropdownOpen && (
              <div className="absolute left-0 mt-1 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-1 z-50">
                {shells.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveShell(s.id);
                      setIsShellDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left ${
                      activeShell === s.id ? 'bg-indigo-600/20 text-indigo-400 font-medium' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </div>
                    {activeShell === s.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Brown Noise Player */}
          <BrownNoisePlayer />

          {/* Assistive Quick Toggles */}
          <div className="hidden md:flex items-center gap-1 p-0.5 rounded-lg border border-slate-700/50 bg-black/20">
            {/* Reading Ruler Toggle */}
            <button
              onClick={toggleReadingRuler}
              className={`p-1.5 rounded-md transition-colors ${
                readingRulerEnabled
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              aria-label="Toggle Reading Ruler"
              title={readingRulerEnabled ? 'Disable Reading Ruler' : 'Enable Reading Ruler (Line Focus)'}
            >
              <Glasses className="w-4 h-4" />
            </button>

            {/* Bionic Reading Toggle */}
            <button
              onClick={toggleBionicReading}
              className={`p-1.5 rounded-md transition-colors ${
                bionicReadingEnabled
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              aria-label="Toggle Bionic Reading"
              title={bionicReadingEnabled ? 'Disable Bionic Reading' : 'Enable Bionic Reading (Anchor Bold)'}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Tint Overlay Toggle */}
            <button
              onClick={toggleTintOverlay}
              className={`p-1.5 rounded-md transition-colors ${
                tintOverlayEnabled
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              aria-label="Toggle Soft Tint Overlay"
              title={tintOverlayEnabled ? 'Disable Warm Tint Overlay' : 'Enable Warm Tint Overlay (Sensory Glare Reduction)'}
            >
              <SunMedium className="w-4 h-4" />
            </button>

            {/* Tunnel Focus Mode Toggle */}
            <button
              onClick={toggleTunnelMode}
              className={`p-1.5 rounded-md transition-colors ${
                tunnelMode
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              aria-label="Toggle Tunnel Focus View"
              title={tunnelMode ? 'Exit ADHD Tunnel View' : 'Enable ADHD Tunnel View (Single Step Focus)'}
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>

          {/* Synapse AI Companion Button */}
          <button
            onClick={toggleSynapse}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isSynapseOpen
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30'
                : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
            }`}
            aria-label="Toggle Synapse AI Co-Pilot"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Synapse AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-700/60 bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
              aria-label="User account menu"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'AetherOS User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@aetheros.dev'}</p>
                </div>

                <div className="py-1">
                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Accessibility Settings</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
