import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  Maximize2,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCognitive } from '../context/CognitiveContext.tsx';
import { toBionicHtml } from '../utils/bionicConverter.ts';

interface Step {
  step: number;
  title: string;
  estimatedMinutes: number;
  actionTip: string;
  completed?: boolean;
}

interface TaskItem {
  id?: string;
  goal: string;
  kickoffMessage: string;
  steps: Step[];
  is_completed?: boolean;
  created_at?: string;
}

export const TaskDechunkerCard: React.FC = () => {
  const { token } = useAuth();
  const { activeShell, bionicReadingEnabled, tunnelMode, setTunnelMode } = useCognitive();

  const [inputTask, setInputTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(null);
  const [savedTasks, setSavedTasks] = useState<TaskItem[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerActiveStep, setTimerActiveStep] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch saved tasks on mount
  useEffect(() => {
    if (!token) return;
    fetch('/api/preferences/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((tasks) => {
        if (Array.isArray(tasks) && tasks.length > 0) {
          const formatted = tasks.map((t) => ({
            id: t.id,
            goal: t.original_goal,
            kickoffMessage: t.kickoff_message,
            steps: t.steps || [],
            is_completed: t.is_completed,
            created_at: t.created_at,
          }));
          setSavedTasks(formatted);
          if (!currentTask) {
            setCurrentTask(formatted[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load tasks:', err));
  }, [token]);

  // Step countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      triggerConfetti(0.5);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const triggerConfetti = (ratio = 1) => {
    try {
      confetti({
        particleCount: Math.round(50 * ratio),
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#6366F1', '#EC4899'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleDechunk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTask.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/dechunk-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: inputTask.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to dechunk task');
      }

      const data = await res.json();
      const newTask: TaskItem = {
        id: data.id,
        goal: data.goal,
        kickoffMessage: data.kickoffMessage,
        steps: data.steps.map((s: Step) => ({ ...s, completed: false })),
        is_completed: false,
      };

      setCurrentTask(newTask);
      setSavedTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
      setInputTask('');
      triggerConfetti(0.4);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not de-chunk this task right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = async (stepNumber: number) => {
    if (!currentTask) return;

    const updatedSteps = currentTask.steps.map((s) => {
      if (s.step === stepNumber) {
        const nextCompleted = !s.completed;
        if (nextCompleted) {
          triggerConfetti(0.3);
        }
        return { ...s, completed: nextCompleted };
      }
      return s;
    });

    const isAllDone = updatedSteps.every((s) => s.completed);
    if (isAllDone) {
      triggerConfetti(1.2);
    }

    const updatedTask = {
      ...currentTask,
      steps: updatedSteps,
      is_completed: isAllDone,
    };

    setCurrentTask(updatedTask);
    setSavedTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

    // Sync to backend if id exists
    if (currentTask.id && token) {
      try {
        await fetch(`/api/preferences/tasks/${currentTask.id}/step/${stepNumber}/toggle`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Failed to sync step toggle:', e);
      }
    }
  };

  const startStepTimer = (step: Step) => {
    setTimerActiveStep(step.step);
    setTimerSeconds(step.estimatedMinutes * 60);
    setIsTimerRunning(true);
  };

  const completedCount = currentTask?.steps.filter((s) => s.completed).length || 0;
  const totalCount = currentTask?.steps.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active step for tunnel mode: the first incomplete step
  const activeTunnelStep = currentTask?.steps.find((s) => !s.completed) || currentTask?.steps[0];

  return (
    <div
      className={`shell-card rounded-2xl border transition-all p-5 sm:p-6 shadow-sm ${
        activeShell === 'dyslexia'
          ? 'bg-white border-[#e2d9c8]'
          : activeShell === 'autism'
          ? 'bg-[#242b35] border-[#333d4b]'
          : activeShell === 'adhd'
          ? 'bg-[#161b22] border-emerald-500/30 ring-1 ring-emerald-500/10'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">ADHD Atomic Task De-Chunker</h2>
            <p className="text-xs text-slate-400">
              Transform paralyzing goals into frictionless &lt;5-minute micro-actions.
            </p>
          </div>
        </div>

        {currentTask && (
          <button
            onClick={() => setTunnelMode(!tunnelMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              tunnelMode
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
            title="Focus strictly on the current micro-step"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">{tunnelMode ? 'Standard View' : 'Tunnel Focus'}</span>
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleDechunk} className="mb-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputTask}
            onChange={(e) => setInputTask(e.target.value)}
            placeholder="e.g., Clean out my garage, reply to 40 unread work emails, file taxes..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-black/20 focus:bg-black/40 text-sm focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            disabled={isLoading}
            aria-label="Overwhelming task goal"
          />
          <button
            type="submit"
            disabled={isLoading || !inputTask.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-emerald-900/30 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>De-chunking...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>De-Chunk Task</span>
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Current Task Display */}
      {currentTask && (
        <div className="space-y-4">
          {/* Kickoff Banner */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-start gap-3">
            <span className="text-xl">🚀</span>
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Kickoff & Dopamine Booster
              </h3>
              <p
                className="text-sm mt-0.5 text-slate-200"
                dangerouslySetInnerHTML={
                  bionicReadingEnabled ? { __html: toBionicHtml(currentTask.kickoffMessage) } : undefined
                }
              >
                {!bionicReadingEnabled && currentTask.kickoffMessage}
              </p>
            </div>
          </div>

          {/* Progress Bar & Milestone Status */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-400">
                Goal: <strong className="text-slate-200">{currentTask.goal}</strong>
              </span>
              <span className="text-emerald-400 font-mono">
                {completedCount} / {totalCount} completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* TUNNEL VIEW MODE: Focus on single active step */}
          {tunnelMode && activeTunnelStep ? (
            <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-950/30 shadow-lg text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase">
                Current Micro-Step {activeTunnelStep.step} of {totalCount}
              </div>

              <h4 className="text-xl font-bold text-slate-100">{activeTunnelStep.title}</h4>

              <div className="p-3 rounded-lg bg-black/30 border border-slate-700/60 max-w-lg mx-auto text-xs text-slate-300">
                💡 <strong>Action Tip:</strong> {activeTunnelStep.actionTip}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => toggleStep(activeTunnelStep.step)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Done & Next Step</span>
                </button>

                <button
                  onClick={() => startStepTimer(activeTunnelStep)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>
                    {isTimerRunning && timerActiveStep === activeTunnelStep.step
                      ? `Timer: ${Math.floor((timerSeconds || 0) / 60)}:${String((timerSeconds || 0) % 60).padStart(2, '0')}`
                      : `${activeTunnelStep.estimatedMinutes}m Timer`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD LIST VIEW */
            <div className="space-y-2.5">
              {currentTask.steps.map((step) => {
                const isStepCompleted = Boolean(step.completed);
                const isFirstStep = step.step === 1;

                return (
                  <div
                    key={step.step}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      isStepCompleted
                        ? 'bg-emerald-950/15 border-emerald-500/20 opacity-75'
                        : isFirstStep
                        ? 'bg-amber-500/5 border-amber-500/30 shadow-sm'
                        : 'bg-black/10 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(step.step)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full"
                      aria-label={`Toggle step ${step.step}: ${step.title}`}
                    >
                      {isStepCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/50" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isStepCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                          dangerouslySetInnerHTML={
                            bionicReadingEnabled ? { __html: toBionicHtml(step.title) } : undefined
                          }
                        >
                          {!bionicReadingEnabled && step.title}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {step.estimatedMinutes}m
                          </span>

                          <button
                            onClick={() => startStepTimer(step)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
                            title="Start step timer"
                            aria-label={`Start timer for step ${step.step}`}
                          >
                            {isTimerRunning && timerActiveStep === step.step ? (
                              <Pause className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p
                        className="text-xs text-slate-400 mt-1"
                        dangerouslySetInnerHTML={
                          bionicReadingEnabled ? { __html: toBionicHtml(step.actionTip) } : undefined
                        }
                      >
                        {!bionicReadingEnabled && step.actionTip}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Timer Active Bar */}
          {isTimerRunning && timerSeconds !== null && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-amber-400" />
                <span>
                  Active Step {timerActiveStep} Countdown:{' '}
                  <strong className="font-mono text-sm">
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                  </strong>
                </span>
              </div>
              <button
                onClick={() => setIsTimerRunning(false)}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold"
              >
                Pause
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Task History Switcher */}
      {savedTasks.length > 1 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <ListTodo className="w-3.5 h-3.5" />
            <span>Saved De-chunked Tasks ({savedTasks.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {savedTasks.map((t) => (
              <button
                key={t.id || t.goal}
                onClick={() => setCurrentTask(t)}
                className={`px-2.5 py-1 text-xs rounded-lg border truncate max-w-[220px] transition-colors ${
                  currentTask?.id === t.id
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/20 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.goal}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
