import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Sparkles,
  Layers,
  Scale,
  Compass,
  ArrowRight,
  Bookmark,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCognitive } from '../context/CognitiveContext.tsx';
import { toBionicHtml } from '../utils/bionicConverter.ts';

interface NumberResult {
  id?: string;
  chunkedForm: string;
  plainScale: string;
  relativeTakeaway: string;
}

export const DyscalculiaCard: React.FC = () => {
  const { token } = useAuth();
  const { activeShell, bionicReadingEnabled } = useCognitive();

  const [inputContext, setInputContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NumberResult | null>(null);
  const [savedItems, setSavedItems] = useState<{ id: string; raw_input: string; chunked_form: string; plain_scale: string; relative_takeaway: string }[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch saved clarifications
  useEffect(() => {
    if (!token) return;
    fetch('/api/preferences/numbers', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((items) => {
        if (Array.isArray(items)) {
          setSavedItems(items);
          if (items.length > 0 && !result) {
            setResult({
              id: items[0].id,
              chunkedForm: items[0].chunked_form,
              plainScale: items[0].plain_scale,
              relativeTakeaway: items[0].relative_takeaway,
            });
            setInputContext(items[0].raw_input);
          }
        }
      })
      .catch((err) => console.error('Failed to load numbers:', err));
  }, [token]);

  const handleClarify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContext.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/number-lens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contextText: inputContext.trim() }),
      });

      if (!res.ok) throw new Error('Number lens failed');

      const data = await res.json();
      setResult(data);

      if (data.id) {
        setSavedItems((prev) => [
          {
            id: data.id,
            raw_input: inputContext.trim(),
            chunked_form: data.chunkedForm,
            plain_scale: data.plainScale,
            relative_takeaway: data.relativeTakeaway,
          },
          ...prev.filter((i) => i.id !== data.id),
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const samplePresets = [
    'City annual budget $4,200,000 for park repairs',
    '348.5 miles at 28 mpg with gas at $3.89/gal',
    'Company equity 0.035% with 4-year vesting on 12M valuation',
  ];

  return (
    <div
      className={`shell-card rounded-2xl border transition-all p-5 sm:p-6 shadow-sm ${
        activeShell === 'dyslexia'
          ? 'bg-white border-[#e2d9c8]'
          : activeShell === 'autism'
          ? 'bg-[#242b35] border-[#333d4b]'
          : activeShell === 'adhd'
          ? 'bg-[#161b22] border-amber-500/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Dyscalculia "Number Lens" & Scale Clarifier</h2>
          <p className="text-xs text-slate-400">
            De-cluster overwhelming numbers, quantify scale, and translate math into tangible everyday analogies.
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleClarify} className="space-y-3 mb-5">
        <div>
          <textarea
            value={inputContext}
            onChange={(e) => setInputContext(e.target.value)}
            rows={2}
            placeholder="Paste confusing numbers, budgets, loan APRs, medical metrics, or percentages..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-black/20 focus:bg-black/40 text-sm focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
            disabled={isLoading}
            aria-label="Input numbers or budget text"
          />
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Quick tests:</span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputContext(preset)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-amber-300 hover:border-amber-500/30 transition-colors cursor-pointer"
            >
              {preset.slice(0, 30)}...
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputContext.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-amber-900/30 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>Clarifying Scale...</span>
            </>
          ) : (
            <>
              <Scale className="w-4 h-4" />
              <span>Clarify & Translate Scale</span>
            </>
          )}
        </button>
      </form>

      {/* Structured Output Cards */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* 1. Chunked Visually Spaced Form */}
          <div className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-amber-950/20 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Spaced Chunked Format (Eye-Tracking Friendly)
              </span>
              <button
                onClick={() => copyToClipboard(result.chunkedForm, 'chunked')}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-black/30 transition-colors"
                title="Copy chunked numbers"
              >
                {copiedField === 'chunked' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-lg sm:text-xl font-mono font-bold tracking-widest text-amber-200 select-all leading-relaxed">
              {result.chunkedForm}
            </p>
          </div>

          {/* 2. Concrete Real-World Scale */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-700/80 bg-black/25 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Plain-Scale Concrete Comparison
              </span>
              <button
                onClick={() => copyToClipboard(result.plainScale, 'scale')}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-black/30 transition-colors"
                title="Copy scale analogy"
              >
                {copiedField === 'scale' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p
              className="text-sm sm:text-base text-slate-200 leading-relaxed"
              dangerouslySetInnerHTML={
                bionicReadingEnabled ? { __html: toBionicHtml(result.plainScale) } : undefined
              }
            >
              {!bionicReadingEnabled && result.plainScale}
            </p>
          </div>

          {/* 3. Relative Takeaway */}
          <div className="p-4 sm:p-5 rounded-xl border border-teal-500/30 bg-teal-950/20 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Bottom-Line Meaning (Zero Math Anxiety)
              </span>
              <button
                onClick={() => copyToClipboard(result.relativeTakeaway, 'takeaway')}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-black/30 transition-colors"
                title="Copy takeaway"
              >
                {copiedField === 'takeaway' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p
              className="text-sm sm:text-base font-medium text-teal-200 leading-relaxed"
              dangerouslySetInnerHTML={
                bionicReadingEnabled ? { __html: toBionicHtml(result.relativeTakeaway) } : undefined
              }
            >
              {!bionicReadingEnabled && result.relativeTakeaway}
            </p>
          </div>
        </div>
      )}

      {/* History Notebook */}
      {savedItems.length > 1 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Dyscalculia Notebook History ({savedItems.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {savedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setResult({
                    id: item.id,
                    chunkedForm: item.chunked_form,
                    plainScale: item.plain_scale,
                    relativeTakeaway: item.relative_takeaway,
                  });
                  setInputContext(item.raw_input);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg border truncate max-w-[240px] transition-colors ${
                  result?.id === item.id
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-black/20 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.raw_input}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
