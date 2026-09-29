import React, { useState } from 'react';
import {
  Zap,
  BookOpen,
  MessageSquareText,
  Calculator,
  LayoutGrid,
  Sparkles,
  Sliders,
  Glasses,
  Waves,
  SunMedium,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useCognitive } from '../context/CognitiveContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { TopOSBar } from '../components/TopOSBar.tsx';
import { ReadingRuler } from '../components/ReadingRuler.tsx';
import { TintOverlay } from '../components/TintOverlay.tsx';
import { SynapseCompanion } from '../components/SynapseCompanion.tsx';
import { TaskDechunkerCard } from '../components/TaskDechunkerCard.tsx';
import { DyscalculiaCard } from '../components/DyscalculiaCard.tsx';
import { PhoneticRepairCard } from '../components/PhoneticRepairCard.tsx';
import { ToneDecoderCard } from '../components/ToneDecoderCard.tsx';
import { SettingsModal } from '../components/SettingsModal.tsx';

export const DesktopDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    activeShell,
    setActiveShell,
    activeCardTab,
    setActiveCardTab,
    tunnelMode,
    toggleTunnelMode,
    isBrownNoisePlaying,
    readingRulerEnabled,
    bionicReadingEnabled,
    tintOverlayEnabled,
    toggleSynapse,
  } = useCognitive();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const tabs = [
    { id: 'all', label: 'All Micro-Engines', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'adhd', label: 'ADHD Task De-Chunker', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'dyslexia', label: 'Dyslexia Writing Repair', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'autism', label: 'Social Tone Decoder', icon: <MessageSquareText className="w-3.5 h-3.5 text-teal-400" /> },
    { id: 'dyscalculia', label: 'Dyscalculia Number Lens', icon: <Calculator className="w-3.5 h-3.5 text-amber-400" /> },
  ] as const;

  const shellMeta = {
    standard: {
      title: 'Standard Desktop',
      desc: 'Clean, balanced dark slate environment with full assistive micro-engines on standby.',
      badge: 'Balanced Productivity',
      accent: 'border-slate-700 bg-slate-800/40 text-slate-300',
    },
    dyslexia: {
      title: 'Dyslexia Parchment Shell',
      desc: 'Enforcing Lexend typography, warm parchment background, expanded line-height, and fixation rulers.',
      badge: 'Visual Ease & Ocular Fixation',
      accent: 'border-amber-600/40 bg-amber-50 text-amber-900',
    },
    adhd: {
      title: 'ADHD Executive Focus Shell',
      desc: 'High dopamine, micro-step countdowns, instant task initiation, and noise reduction tunnel view.',
      badge: 'Dopamine & Initiation Support',
      accent: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    },
    autism: {
      title: 'Sensory Ease & Social Transparency',
      desc: 'Low sensory load, zero glare/animations, direct literal communication, and subtext translation.',
      badge: 'Low Sensory Load & Literal Translation',
      accent: 'border-teal-500/40 bg-teal-950/30 text-teal-300',
    },
  }[activeShell];

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-200">
      {/* Visual Assistive Overlays */}
      <ReadingRuler />
      <TintOverlay />

      {/* Top OS Navigation Bar */}
      <TopOSBar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main OS Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Active Shell Overview */}
        <section
          className={`p-5 sm:p-7 rounded-2xl border transition-all ${
            activeShell === 'dyslexia'
              ? 'bg-[#ffffff] border-[#ded3bf] text-[#1a202c]'
              : activeShell === 'autism'
              ? 'bg-[#242b35] border-[#333d4b] text-[#cbd5e1]'
              : activeShell === 'adhd'
              ? 'bg-[#161b22] border-[#30363d] text-[#f0f6fc]'
              : 'bg-slate-900/80 border-slate-800 text-slate-200'
          }`}
          aria-label="Active Cognitive Shell Overview"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-indigo-400 dark:text-indigo-300">
                  {shellMeta.badge}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Welcome, <strong className="text-slate-200">{user?.full_name || 'Explorer'}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {shellMeta.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                {shellMeta.desc}
              </p>
            </div>

            {/* Active Assistive Engine Status Toggles */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
              {isBrownNoisePlaying && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Waves className="w-3.5 h-3.5 animate-pulse" />
                  <span>Brown Noise Masking</span>
                </span>
              )}
              {readingRulerEnabled && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Glasses className="w-3.5 h-3.5" />
                  <span>Reading Ruler</span>
                </span>
              )}
              {bionicReadingEnabled && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bionic Anchors</span>
                </span>
              )}
              {tintOverlayEnabled && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <SunMedium className="w-3.5 h-3.5" />
                  <span>Sensory Tint</span>
                </span>
              )}
              {tunnelMode && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>ADHD Tunnel</span>
                </span>
              )}
            </div>
          </div>

          {/* Domain Tab Navigation */}
          <div
            className="flex items-center gap-1.5 mt-6 pt-4 border-t border-inherit overflow-x-auto no-scrollbar"
            role="tablist"
            aria-label="Assistive micro-engine tabs"
          >
            {tabs.map((tab) => {
              const isSelected = activeCardTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCardTab(tab.id as any)}
                  role="tab"
                  aria-selected={isSelected}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-black/20'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Modular Card Canvas */}
        <section aria-label="Assistive Tools Workspace">
          {activeCardTab === 'all' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskDechunkerCard />
              <PhoneticRepairCard />
              <ToneDecoderCard />
              <DyscalculiaCard />
            </div>
          )}

          {activeCardTab === 'adhd' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <TaskDechunkerCard />
              <div className="p-4 rounded-xl border border-slate-800 bg-black/20 text-xs text-slate-400 flex items-center justify-between">
                <span>💡 <strong>ADHD Tip:</strong> If starting still feels hard, ask Synapse AI to make Step 1 take only 60 seconds.</span>
                <button onClick={toggleSynapse} className="text-indigo-400 hover:underline font-semibold shrink-0 ml-2">
                  Open Synapse
                </button>
              </div>
            </div>
          )}

          {activeCardTab === 'dyslexia' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <PhoneticRepairCard />
              <div className="p-4 rounded-xl border border-slate-800 bg-black/20 text-xs text-slate-400 flex items-center justify-between">
                <span>💡 <strong>Dyslexia Tip:</strong> You can click the "Read Aloud" button to listen to any repaired draft before sending.</span>
              </div>
            </div>
          )}

          {activeCardTab === 'autism' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <ToneDecoderCard />
              <div className="p-4 rounded-xl border border-slate-800 bg-black/20 text-xs text-slate-400 flex items-center justify-between">
                <span>💡 <strong>Literal Communication:</strong> Synapse will never use ambiguous sarcasm, passive aggression, or confusing idioms.</span>
              </div>
            </div>
          )}

          {activeCardTab === 'dyscalculia' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <DyscalculiaCard />
              <div className="p-4 rounded-xl border border-slate-800 bg-black/20 text-xs text-slate-400 flex items-center justify-between">
                <span>💡 <strong>Scale Tip:</strong> Dyscalculia Number Lens breaks down large digit clusters into spaced groups and relatable everyday metrics.</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Ambient Synapse AI Slide-out Dock */}
      <SynapseCompanion />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
