import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  BookOpen,
  Eye,
  Calculator,
  Compass,
  Heart,
  Feather,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCognitive, CognitiveShell } from '../context/CognitiveContext.tsx';
import { toBionicHtml } from '../utils/bionicConverter.ts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  persona?: string;
}

type CompanionPersona = 'synapse' | 'coach' | 'editor' | 'calm' | 'social';

export const SynapseCompanion: React.FC = () => {
  const { token, user } = useAuth();
  const { isSynapseOpen, setIsSynapseOpen, activeShell, bionicReadingEnabled } = useCognitive();

  const [input, setInput] = useState('');
  const [activePersona, setActivePersona] = useState<CompanionPersona>('synapse');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: getInitialGreeting(activeShell, user?.full_name || 'there', 'synapse'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: 'synapse',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // When shell changes, update assistant's contextual reminder
  useEffect(() => {
    const greeting = getInitialGreeting(activeShell, user?.full_name || 'there', activePersona);
    setMessages((prev) => [
      ...prev,
      {
        id: `shell-change-${Date.now()}`,
        role: 'assistant',
        text: `*Switched to **${activeShell.toUpperCase()}** cognitive mode.* ${greeting}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: activePersona,
      },
    ]);
  }, [activeShell]);

  function getInitialGreeting(shell: CognitiveShell, name: string, persona: CompanionPersona): string {
    if (persona === 'coach') {
      return `Hey ${name}! I'm your Executive Function Coach. What is one tiny 2-minute action we can start with? No judgment, no pressure.`;
    }
    if (persona === 'editor') {
      return `Hi ${name}. I'm your Neuro-Editor. Paste your draft, notes, or ideas here, and I'll clarify the structure while keeping your authentic voice.`;
    }
    if (persona === 'calm') {
      return `Breathe with me, ${name}. I'm here for sensory de-escalation and grounding. Let's silence the mental noise and take things one breath at a time.`;
    }
    if (persona === 'social') {
      return `Hello ${name}. I'm your Social Context & Tone Guide. Paste any confusing email, Slack message, or feedback, and we'll translate the unspoken subtext.`;
    }

    if (shell === 'dyslexia') {
      return `Hi ${name}. I format all thoughts with bold anchors and clean bullet points. What shall we tackle together?`;
    }
    if (shell === 'adhd') {
      return `Hey ${name}! What is one micro-step we can knock out in the next 3 minutes? Tell me and let's get that dopamine win!`;
    }
    if (shell === 'autism') {
      return `Hello ${name}. I communicate literally and transparently without unstated assumptions or metaphors. How can I assist you?`;
    }
    return `Hello ${name}. I'm Synapse, your ambient cognitive co-pilot. How can I support your focus today?`;
  }

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isTyping) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          cognitiveMode: activeShell,
          persona: activePersona,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error('Companion error');

      const data = await res.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: activePersona,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          text: "I experienced a brief sensory hiccup. Let's take a calm pause. Could you please re-send your message?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          persona: activePersona,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSpeak = (msg: Message) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = msg.text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msg.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        text: getInitialGreeting(activeShell, user?.full_name || 'there', activePersona),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: activePersona,
      },
    ]);
  };

  const personas: { id: CompanionPersona; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'synapse',
      label: 'Core Synapse',
      desc: 'Adaptive to your active shell',
      icon: <Sparkles className="w-3 h-3 text-indigo-400" />,
      color: 'border-indigo-500/40 text-indigo-300',
    },
    {
      id: 'coach',
      label: 'Initiation Coach',
      desc: 'Overcomes task paralysis',
      icon: <Zap className="w-3 h-3 text-emerald-400" />,
      color: 'border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'editor',
      label: 'Neuro-Editor',
      desc: 'Refines drafts & thoughts',
      icon: <Feather className="w-3 h-3 text-sky-400" />,
      color: 'border-sky-500/40 text-sky-300',
    },
    {
      id: 'calm',
      label: 'Sensory Grounding',
      desc: 'Reduces overwhelm & anxiety',
      icon: <Heart className="w-3 h-3 text-rose-400" />,
      color: 'border-rose-500/40 text-rose-300',
    },
    {
      id: 'social',
      label: 'Social Decoder',
      desc: 'Literal workplace translator',
      icon: <Compass className="w-3 h-3 text-teal-400" />,
      color: 'border-teal-500/40 text-teal-300',
    },
  ];

  const quickPromptsByPersona: Record<CompanionPersona, { label: string; icon: React.ReactNode }[]> = {
    synapse: [
      { label: 'Help me start my first task', icon: <Zap className="w-3 h-3 text-emerald-400" /> },
      { label: 'Summarize what I should focus on next', icon: <Eye className="w-3 h-3 text-indigo-400" /> },
      { label: 'Explain this confusing concept simply', icon: <BookOpen className="w-3 h-3 text-amber-400" /> },
    ],
    coach: [
      { label: 'Give me a 2-minute kickoff action', icon: <Zap className="w-3 h-3 text-emerald-400" /> },
      { label: 'I am stuck in decision paralysis', icon: <Sparkles className="w-3 h-3 text-amber-400" /> },
      { label: 'Help me prioritize between 3 tasks', icon: <Calculator className="w-3 h-3 text-teal-400" /> },
    ],
    editor: [
      { label: 'Check if this email sounds rude', icon: <Compass className="w-3 h-3 text-sky-400" /> },
      { label: 'Make this explanation shorter and punchier', icon: <Feather className="w-3 h-3 text-indigo-400" /> },
      { label: 'Rephrase without corporate jargon', icon: <BookOpen className="w-3 h-3 text-teal-400" /> },
    ],
    calm: [
      { label: 'I feel sensory overload right now', icon: <Heart className="w-3 h-3 text-rose-400" /> },
      { label: 'Guide me through a 30-second grounding breath', icon: <Sparkles className="w-3 h-3 text-amber-400" /> },
      { label: 'Reassure me about this deadline', icon: <Heart className="w-3 h-3 text-emerald-400" /> },
    ],
    social: [
      { label: 'What did my boss really mean here?', icon: <Eye className="w-3 h-3 text-teal-400" /> },
      { label: 'How do I decline this invitation politely?', icon: <Compass className="w-3 h-3 text-sky-400" /> },
      { label: 'Is "per my previous email" angry?', icon: <BookOpen className="w-3 h-3 text-rose-400" /> },
    ],
  };

  if (!isSynapseOpen) return null;

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 shadow-2xl flex flex-col border-l backdrop-blur-xl transition-all duration-200 ${
        isExpanded ? 'w-full md:w-[640px]' : 'w-full sm:w-[440px]'
      }`}
      style={{
        backgroundColor:
          activeShell === 'dyslexia'
            ? '#faf6ee'
            : activeShell === 'autism'
            ? '#1e232a'
            : activeShell === 'adhd'
            ? '#0d1117'
            : '#0b0f17',
        borderColor:
          activeShell === 'dyslexia'
            ? '#ded3bf'
            : activeShell === 'autism'
            ? '#303844'
            : activeShell === 'adhd'
            ? '#30363d'
            : '#1e293b',
      }}
      role="dialog"
      aria-label="Synapse AI Ambient Co-Pilot"
    >
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between border-inherit">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm tracking-tight text-slate-100">Synapse AI</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold bg-indigo-500/20 text-indigo-400">
                {activeShell} shell
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Multi-Engine Cognitive Co-Pilot</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear chat history */}
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Collapse width */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
            title={isExpanded ? 'Standard width' : 'Expand panel'}
            aria-label={isExpanded ? 'Standard width' : 'Expand panel'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close button */}
          <button
            onClick={() => setIsSynapseOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close Synapse AI panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persona Mode Switcher */}
      <div className="px-3 py-2 border-b border-inherit bg-black/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Assistant Persona
          </span>
          <span className="text-[10px] text-slate-500">
            Adapts phrasing to your current mental state
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {personas.map((p) => {
            const isActive = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePersona(p.id);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `persona-${Date.now()}`,
                      role: 'assistant',
                      text: `*Persona changed to **${p.label}**.* ${p.desc}.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      persona: p.id,
                    },
                  ]);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-black/20 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={p.desc}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Quick Prompt Chips */}
      <div className="px-3 py-2 border-b border-inherit flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPromptsByPersona[activePersona]?.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(undefined, chip.label)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-slate-700/60 bg-black/20 hover:bg-black/40 text-slate-300 hover:text-white shrink-0 transition-colors cursor-pointer"
          >
            {chip.icon}
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[85%] group relative ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : activeShell === 'dyslexia'
                      ? 'bg-white text-slate-900 border border-[#e2d9c8] rounded-bl-none shadow-sm'
                      : 'bg-black/35 border border-slate-800 text-slate-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={
                      bionicReadingEnabled
                        ? { __html: toBionicHtml(m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }
                        : { __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }
                    }
                  />
                </div>

                {/* Message action bar */}
                <div
                  className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{m.timestamp}</span>

                  {!isUser && (
                    <>
                      {/* Read Aloud button */}
                      <button
                        onClick={() => toggleSpeak(m)}
                        className="p-1 rounded hover:text-indigo-400 opacity-60 hover:opacity-100 transition-opacity"
                        title={speakingMsgId === m.id ? 'Stop audio' : 'Read aloud'}
                        aria-label="Read Synapse response aloud"
                      >
                        {speakingMsgId === m.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy button */}
                      <button
                        onClick={() => copyMessage(m.text, m.id)}
                        className="p-1 rounded hover:text-indigo-400 opacity-60 hover:opacity-100 transition-opacity"
                        title="Copy text"
                        aria-label="Copy assistant text"
                      >
                        {copiedMsgId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-300">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs pl-9">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Synapse is adapting thought patterns...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 border-t border-inherit bg-black/15">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Synapse in ${activeShell} mode (${activePersona})...`}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-black/30 focus:bg-black/50 text-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            disabled={isTyping}
            aria-label="Message to Synapse AI"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0 shadow-sm shadow-indigo-900/40"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
};
