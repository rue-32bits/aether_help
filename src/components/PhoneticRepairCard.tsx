import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCognitive } from '../context/CognitiveContext.tsx';
import { toBionicHtml } from '../utils/bionicConverter.ts';

interface RepairResult {
  original: string;
  corrected: string;
  keyFixes: string[];
}

export const PhoneticRepairCard: React.FC = () => {
  const { token } = useAuth();
  const { activeShell, bionicReadingEnabled } = useCognitive();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RepairResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleDyslexicPhrases = [
    'i wud liek to ask if we can chek the schejule for tomoro becos teh time was not clear',
    'pleas find atached the reqest form i did yesterday night and tel me if i need to chnage anythng',
    'we shud definatly meet up to deside the projeckt goal befor fridat',
  ];

  const handleRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/dyslexia-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (!res.ok) throw new Error('Dyslexia repair failed');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.corrected);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!result || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.corrected);
      utterance.rate = 0.95; // slightly slower, calm cadence
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`shell-card rounded-2xl border transition-all p-5 sm:p-6 shadow-sm ${
        activeShell === 'dyslexia'
          ? 'bg-white border-[#e2d9c8]'
          : activeShell === 'autism'
          ? 'bg-[#242b35] border-[#333d4b]'
          : activeShell === 'adhd'
          ? 'bg-[#161b22] border-indigo-500/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
          <FileEdit className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Dyslexia & Dysgraphia Phonetic Reconstructor
          </h2>
          <p className="text-xs text-slate-400">
            Write as you speak. Reconstructs phonetically spelled or flipped text while preserving your genuine voice.
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleRepair} className="space-y-3 mb-5">
        <div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Type freely without worrying about spelling, letter order, or punctuation..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-black/20 focus:bg-black/40 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors leading-relaxed"
            disabled={isLoading}
            aria-label="Raw text to reconstruct"
          />
        </div>

        {/* Quick test phrases */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Try phonetic samples:</span>
          {sampleDyslexicPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(phrase)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors cursor-pointer"
            >
              {phrase.slice(0, 32)}...
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-indigo-900/30 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>Reconstructing Intent...</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              <span>Reconstruct & Polish Draft</span>
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-1">
          {/* Side by side comparison / Clean view */}
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Polished Accessible Output
              </span>

              <div className="flex items-center gap-1">
                {/* Speech read-aloud */}
                <button
                  onClick={toggleSpeech}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    isSpeaking
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
                  }`}
                  title={isSpeaking ? 'Stop read aloud' : 'Read repaired text aloud'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
                </button>

                {/* Copy button */}
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p
              className="text-base font-medium text-slate-100 leading-relaxed select-all"
              dangerouslySetInnerHTML={
                bionicReadingEnabled ? { __html: toBionicHtml(result.corrected) } : undefined
              }
            >
              {!bionicReadingEnabled && result.corrected}
            </p>
          </div>

          {/* Key Fixes & Reconstructions */}
          {result.keyFixes && result.keyFixes.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                Adaptive Adjustments Made:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.keyFixes.map((fix, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/30 border border-slate-700/60 text-indigo-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {fix}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
