import React, { useState, useEffect } from 'react';
import {
  MessageSquareText,
  Sparkles,
  Search,
  Eye,
  ShieldCheck,
  Send,
  Copy,
  Check,
  History,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCognitive } from '../context/CognitiveContext.tsx';
import { toBionicHtml } from '../utils/bionicConverter.ts';

interface ToneReply {
  type: string;
  text: string;
}

interface ToneResult {
  id?: string;
  literal: string;
  detectedTone: string;
  subtextAnalysis: string;
  suggestedReplies: ToneReply[];
}

export const ToneDecoderCard: React.FC = () => {
  const { token } = useAuth();
  const { activeShell, bionicReadingEnabled } = useCognitive();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ToneResult | null>(null);
  const [savedTones, setSavedTones] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sampleMessages = [
    'Per my previous email, let me know when you have time to look over the revised slide deck.',
    'No worries if you are too busy, I can just figure it out myself.',
    'Thanks for your contribution. Let us take this offline so we can align.',
  ];

  // Load history
  useEffect(() => {
    if (!token) return;
    fetch('/api/preferences/tones', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((items) => {
        if (Array.isArray(items)) {
          setSavedTones(items);
          if (items.length > 0 && !result) {
            setResult({
              id: items[0].id,
              literal: items[0].literal_meaning,
              detectedTone: items[0].detected_tone,
              subtextAnalysis: items[0].subtext_analysis,
              suggestedReplies: items[0].suggested_replies || [],
            });
            setInputMessage(items[0].raw_message);
          }
        }
      })
      .catch((err) => console.error('Failed to load tones:', err));
  }, [token]);

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/decode-tone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: inputMessage.trim() }),
      });

      if (!res.ok) throw new Error('Tone decoding failed');

      const data = await res.json();
      setResult(data);

      if (data.id) {
        setSavedTones((prev) => [
          {
            id: data.id,
            raw_message: inputMessage.trim(),
            literal_meaning: data.literal,
            detected_tone: data.detectedTone,
            subtext_analysis: data.subtextAnalysis,
            suggested_replies: data.suggestedReplies,
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

  const copyReply = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className={`shell-card rounded-2xl border transition-all p-5 sm:p-6 shadow-sm ${
        activeShell === 'dyslexia'
          ? 'bg-white border-[#e2d9c8]'
          : activeShell === 'autism'
          ? 'bg-[#242b35] border-[#333d4b]'
          : activeShell === 'adhd'
          ? 'bg-[#161b22] border-teal-500/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
          <MessageSquareText className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Autism & Social Ambiguity Tone Decoder
          </h2>
          <p className="text-xs text-slate-400">
            Translate indirect subtext, corporate idioms, and ambiguous tone into transparent, literal clarity.
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleDecode} className="space-y-3 mb-5">
        <div>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            rows={2}
            placeholder="Paste confusing Slack messages, performance review notes, or client emails..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-black/20 focus:bg-black/40 text-sm focus-visible:ring-2 focus-visible:ring-teal-500 transition-colors"
            disabled={isLoading}
            aria-label="Ambiguous message text"
          />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Test ambiguous phrases:</span>
          {sampleMessages.map((msg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputMessage(msg)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-teal-300 hover:border-teal-500/30 transition-colors cursor-pointer"
            >
              {msg.slice(0, 32)}...
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-teal-900/30 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>Decoding Subtext...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Decode Message Tone</span>
            </>
          )}
        </button>
      </form>

      {/* Structured Output */}
      {result && (
        <div className="space-y-3.5 pt-1">
          {/* Detected Tone Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Detected Tone:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {result.detectedTone}
            </span>
          </div>

          {/* 1. Literal Meaning */}
          <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-950/20">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-1">
              <Eye className="w-3.5 h-3.5" />
              Literal Transparent Meaning (No Ambiguity)
            </span>
            <p
              className="text-sm font-medium text-slate-100"
              dangerouslySetInnerHTML={
                bionicReadingEnabled ? { __html: toBionicHtml(result.literal) } : undefined
              }
            >
              {!bionicReadingEnabled && result.literal}
            </p>
          </div>

          {/* 2. Subtext Analysis */}
          <div className="p-3.5 rounded-xl border border-slate-700 bg-black/20">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5" />
              Unspoken Context & Emotional Subtext
            </span>
            <p
              className="text-xs sm:text-sm text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={
                bionicReadingEnabled ? { __html: toBionicHtml(result.subtextAnalysis) } : undefined
              }
            >
              {!bionicReadingEnabled && result.subtextAnalysis}
            </p>
          </div>

          {/* 3. Suggested Replies */}
          {result.suggestedReplies && result.suggestedReplies.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Stress-Free Pre-Drafted Replies:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.suggestedReplies.map((reply, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-700/80 bg-black/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {reply.type}
                        </span>
                        <button
                          onClick={() => copyReply(reply.text, idx)}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 leading-normal">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Tones */}
      {savedTones.length > 1 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <History className="w-3.5 h-3.5" />
            <span>Tone Decoding History ({savedTones.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {savedTones.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setResult({
                    id: item.id,
                    literal: item.literal_meaning,
                    detectedTone: item.detected_tone,
                    subtextAnalysis: item.subtext_analysis,
                    suggestedReplies: item.suggested_replies || [],
                  });
                  setInputMessage(item.raw_message);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg border truncate max-w-[240px] transition-colors ${
                  result?.id === item.id
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-black/20 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.raw_message}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
