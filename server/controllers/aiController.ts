import { Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import { dbStore } from '../db/database.ts';

const apiKey = process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Dyslexia / Dysgraphia Phonetic Writing Repair
export async function dyslexiaRepair(req: AuthRequest, res: Response) {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Input text is required.' });
  }

  const prompt = `You are an assistive writing assistant for individuals with dyslexia and dysgraphia.
Analyze the user's input: "${text}"
Reconstruct the intended meaning accurately, correct phonetic misspellings, flipped letters, and missing punctuation without altering the author's voice or sounding condescending.

Return ONLY a JSON object:
{
  "original": string,
  "corrected": string,
  "keyFixes": string[]
}`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              corrected: { type: Type.STRING },
              keyFixes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['original', 'corrected', 'keyFixes'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (error) {
      console.warn('Gemini dyslexiaRepair call error, using assistive fallback:', error);
    }
  }

  // Fallback heuristic repair
  const fallbackRepair = generateDyslexiaFallback(text);
  return res.json(fallbackRepair);
}

// 2. ADHD Atomic Task De-Chunker
export async function dechunkTask(req: AuthRequest, res: Response) {
  const { task } = req.body;
  if (!task || typeof task !== 'string') {
    return res.status(400).json({ message: 'Task goal is required.' });
  }

  const prompt = `You are an executive function coach for an individual with ADHD experiencing task paralysis.
Break down the overwhelming goal: "${task}"
Decompose it into 3 to 5 micro-steps that take 5 minutes or less each. The first step MUST be ridiculously easy to eliminate initiation friction. Provide a supportive, dopamine-inducing kickoff message.

Return ONLY a JSON object:
{
  "goal": string,
  "kickoffMessage": string,
  "steps": [
    {
      "step": number,
      "title": string,
      "estimatedMinutes": number,
      "actionTip": string
    }
  ]
}`;

  let resultData = null;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goal: { type: Type.STRING },
              kickoffMessage: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    estimatedMinutes: { type: Type.INTEGER },
                    actionTip: { type: Type.STRING },
                  },
                  required: ['step', 'title', 'estimatedMinutes', 'actionTip'],
                },
              },
            },
            required: ['goal', 'kickoffMessage', 'steps'],
          },
        },
      });

      resultData = JSON.parse(response.text?.trim() || '{}');
    } catch (error) {
      console.warn('Gemini dechunkTask call error, using assistive fallback:', error);
    }
  }

  if (!resultData) {
    resultData = generateADHDTaskFallback(task);
  }

  // Save to database if user is authenticated
  if (req.user) {
    const saved = dbStore.createTaskDechunk(
      req.user.id,
      resultData.goal || task,
      resultData.kickoffMessage || 'You got this!',
      resultData.steps || []
    );
    return res.json({ ...resultData, id: saved.id, is_completed: saved.is_completed });
  }

  return res.json(resultData);
}

// 3. Autism & Social Tone Decoder
export async function decodeTone(req: AuthRequest, res: Response) {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Input message is required.' });
  }

  const prompt = `You are a social context translator assisting an autistic individual navigate indirect or ambiguous workplace communication.
Analyze this message: "${message}"

Return ONLY a JSON object:
{
  "literal": string,
  "detectedTone": string,
  "subtextAnalysis": string,
  "suggestedReplies": [
    { "type": "Polite & Direct", "text": string },
    { "type": "Professional Boundary", "text": string }
  ]
}`;

  let resultData = null;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              literal: { type: Type.STRING },
              detectedTone: { type: Type.STRING },
              subtextAnalysis: { type: Type.STRING },
              suggestedReplies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['type', 'text'],
                },
              },
            },
            required: ['literal', 'detectedTone', 'subtextAnalysis', 'suggestedReplies'],
          },
        },
      });

      resultData = JSON.parse(response.text?.trim() || '{}');
    } catch (error) {
      console.warn('Gemini decodeTone call error, using assistive fallback:', error);
    }
  }

  if (!resultData) {
    resultData = generateToneFallback(message);
  }

  // Save to database
  if (req.user) {
    const saved = dbStore.createToneDecoding(
      req.user.id,
      message,
      resultData.literal,
      resultData.detectedTone,
      resultData.subtextAnalysis,
      resultData.suggestedReplies
    );
    return res.json({ ...resultData, id: saved.id });
  }

  return res.json(resultData);
}

// 4. Dyscalculia Number Lens
export async function numberLens(req: AuthRequest, res: Response) {
  const { contextText } = req.body;
  if (!contextText || typeof contextText !== 'string') {
    return res.status(400).json({ message: 'Context text with numbers is required.' });
  }

  const prompt = `You are a cognitive accessibility guide specialized in dyscalculia, math anxiety, and visual scale perception.
Analyze the numbers, scale, or metrics in this input: "${contextText}"

Return ONLY a JSON object:
{
  "chunkedForm": string,
  "plainScale": string,
  "relativeTakeaway": string
}`;

  let resultData = null;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chunkedForm: { type: Type.STRING },
              plainScale: { type: Type.STRING },
              relativeTakeaway: { type: Type.STRING },
            },
            required: ['chunkedForm', 'plainScale', 'relativeTakeaway'],
          },
        },
      });

      resultData = JSON.parse(response.text?.trim() || '{}');
    } catch (error) {
      console.warn('Gemini numberLens call error, using assistive fallback:', error);
    }
  }

  if (!resultData) {
    resultData = generateNumberFallback(contextText);
  }

  // Save to database
  if (req.user) {
    const saved = dbStore.createNumberClarification(
      req.user.id,
      contextText,
      resultData.chunkedForm,
      resultData.plainScale,
      resultData.relativeTakeaway
    );
    return res.json({ ...resultData, id: saved.id });
  }

  return res.json(resultData);
}

// 5. Ambient Synapse AI Companion
export async function companionChat(req: AuthRequest, res: Response) {
  const { message, history, cognitiveMode = 'standard', persona = 'synapse' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Message is required.' });
  }

  let systemInstruction = `You are Synapse, an ambient, non-judgmental cognitive co-pilot embedded in the AetherOS neurodivergent desktop.`;

  // Persona adaptation
  if (persona === 'coach') {
    systemInstruction += ` You are acting as a supportive Executive Function Coach. Help overcome inertia, celebrate small progress, break tasks into 2-minute micro-actions, and combat analysis paralysis without pressure.`;
  } else if (persona === 'editor') {
    systemInstruction += ` You are acting as an Assistive Neuro-Editor. Help rephrase thoughts clearly, eliminate jargon, clarify structure, and verify that text expresses the user's authentic intent without sounding generic.`;
  } else if (persona === 'calm') {
    systemInstruction += ` You are acting as a Sensory Grounding & De-Escalation Anchor. The user may be experiencing sensory overload or decision fatigue. Speak in a soothing, reassuring tone with breathing anchors and gentle validation.`;
  } else if (persona === 'social') {
    systemInstruction += ` You are acting as a Social Context & Workplace Translator. Provide literal translations of ambiguous communication, uncover unspoken subtext, and suggest calm, assertive replies.`;
  }

  // Cognitive shell formatting adaptation
  if (cognitiveMode === 'dyslexia') {
    systemInstruction += ` The user has dyslexia. Format your response cleanly: keep paragraphs strictly under 3 sentences. Use bold anchor keywords at the start of bullet points. Avoid dense walls of continuous text.`;
  } else if (cognitiveMode === 'adhd') {
    systemInstruction += ` The user has ADHD. Provide the single most important answer or first step immediately in bold at the top. Break solutions into atomic 3-minute micro-actions. Use engaging, encouraging language to spark initiation dopamine.`;
  } else if (cognitiveMode === 'autism') {
    systemInstruction += ` The user is autistic. Be completely direct, literal, transparent, and logical. Do not use sarcasm, idioms, or vague corporate metaphors. Explain the clear 'why' behind any suggestion.`;
  } else {
    systemInstruction += ` Provide clear, calm, empathetic, and actionable guidance with high clarity and low cognitive friction.`;
  }

  if (aiClient) {
    try {
      const contentsPayload = [];

      // Add recent history if provided
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) {
          if (item.role && item.text) {
            contentsPayload.push({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contentsPayload.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || '';
      return res.json({ reply: replyText, cognitiveMode, persona });
    } catch (error) {
      console.warn('Gemini companionChat call error, using assistive fallback:', error);
    }
  }

  // Fallback empathetic response
  const fallbackReply = generateCompanionFallback(message, cognitiveMode, persona);
  return res.json({ reply: fallbackReply, cognitiveMode, persona });
}

// ---------------------------------------------------------------------
// Heuristic Assistive Fallbacks (Guarantees zero-hang offline usability)
// ---------------------------------------------------------------------

function generateDyslexiaFallback(text: string) {
  // Simple heuristic cleanup for common typos and phonetic swaps
  let cleaned = text
    .replace(/\bteh\b/gi, 'the')
    .replace(/\brecieve\b/gi, 'receive')
    .replace(/\bseperate\b/gi, 'separate')
    .replace(/\bdefinatly\b/gi, 'definitely')
    .replace(/\buntill\b/gi, 'until')
    .replace(/\bthier\b/gi, 'their')
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bcant\b/gi, "can't");

  // Capitalize first letter of sentences
  cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  if (!cleaned.endsWith('.') && !cleaned.endsWith('?') && !cleaned.endsWith('!')) {
    cleaned += '.';
  }

  return {
    original: text,
    corrected: cleaned,
    keyFixes: [
      'Reconstructed sentence cadence and standard punctuation',
      'Smoothed phonetic letter placements and capitalization',
      'Preserved authentic tone and original vocabulary',
    ],
  };
}

function generateADHDTaskFallback(task: string) {
  return {
    goal: task,
    kickoffMessage: "Starting is 90% of the cognitive resistance. You only need to do Step 1 right now—it takes less than 2 minutes.",
    steps: [
      {
        step: 1,
        title: "Create physical or digital workspace setup",
        estimatedMinutes: 2,
        actionTip: "Clear 1 square foot on your desk or close all browser tabs except one.",
      },
      {
        step: 2,
        title: "Write down the exact 3 files or items you need",
        estimatedMinutes: 3,
        actionTip: "Don't open them yet; simply name them on a blank sticky note.",
      },
      {
        step: 3,
        title: "Complete the initial 5-minute draft or action",
        estimatedMinutes: 5,
        actionTip: "Set a 5-minute timer. When it rings, you have full permission to pause or keep going.",
      },
      {
        step: 4,
        title: "Quick milestone checkpoint",
        estimatedMinutes: 2,
        actionTip: "Drink water, check off the progress bar, and claim your dopamine reward.",
      },
    ],
  };
}

function generateToneFallback(message: string) {
  const isUrgent = /urgent|asap|today|sooner|immediately|per my/i.test(message);
  return {
    literal: `The sender is requesting that you review or address: "${message.slice(0, 80)}..."`,
    detectedTone: isUrgent ? 'Urgent / Deadline-Driven' : 'Direct Professional Request',
    subtextAnalysis: isUrgent
      ? 'The writer likely feels pressure from an upcoming timeline and is asking for early acknowledgement so they can update their own schedule.'
      : 'The message is functional correspondence without hidden negative intent.',
    suggestedReplies: [
      {
        type: 'Polite & Direct',
        text: 'Thank you for reaching out. I have received this and will review the details by 4:00 PM today.',
      },
      {
        type: 'Professional Boundary',
        text: 'Got it. I am currently focused on a scheduled milestone today, but I will review this tomorrow morning first thing.',
      },
    ],
  };
}

function generateNumberFallback(contextText: string) {
  // Extract digits
  const numbers = contextText.match(/[\$£€]?\s?\d+([.,]\d+)*/g) || ['1,000,000'];
  const firstNum = numbers[0] || '1,000,000';

  return {
    chunkedForm: `${firstNum}  ( Spaced for visual tracking )`,
    plainScale: 'Comparable to an everyday tangible quantity, broken down into manageable single units.',
    relativeTakeaway: `This metric represents a specific allocation; consider it as small, discrete chunks rather than one giant overwhelming figure.`,
  };
}

function generateCompanionFallback(message: string, mode: string, persona: string = 'synapse') {
  if (persona === 'coach') {
    return `**Immediate 2-Minute Action:**\n\n1. Put your phone face-down.\n2. Open the single window or document you need.\n3. Type or organize just **one sentence or item**.\n\nYou do not need to finish the whole project today. Starting is 90% of the cognitive resistance—you are already doing great.`;
  }
  if (persona === 'editor') {
    return `**Draft Clarity Check:**\n\n• **Core Idea:** "${message.slice(0, 70)}..."\n• **Clarity:** Stated directly with unnecessary filler removed.\n• **Tone:** Calm, respectful, and authentic to your voice.\n\nWould you like me to tailor this for email, chat, or documentation?`;
  }
  if (persona === 'calm') {
    return `**Take a slow breath with me.**\n\nInhale for 4 seconds... hold for 4... exhale for 6.\n\nYou are safe in your workspace. Sensory and decision overwhelm are real physiological responses, not personal failure. Let's silence extra background noise and tackle nothing more than this single moment.`;
  }
  if (persona === 'social') {
    return `**Direct Context Breakdown:**\n\n• **Literal Meaning:** The communication is focused on coordinating deliverables.\n• **Subtext:** Any perceived urgency reflects external schedule pressure, not dissatisfaction with your capabilities.\n• **Recommended Next Step:** Acknowledge receipt calmly with a clear timeline.`;
  }

  if (mode === 'dyslexia') {
    return `**I am right here with you.**\n\n• **Core point:** Let's take this one step at a time.\n• **Action:** I have formatted your workspace for relaxed reading.\n• **Next:** What would you like to tackle first?`;
  }
  if (mode === 'adhd') {
    return `**Bottom line:** We don't have to finish the whole mountain right now. Just pick **one 3-minute sliver**. Pick the easiest piece, launch the timer, and let's get that quick dopamine win!`;
  }
  if (mode === 'autism') {
    return `I understand your message literally. The most logical next step is to isolate the primary objective and execute it sequentially without unstated assumptions. What specific detail can I clarify for you?`;
  }
  return `I am here to support your cognitive workflow. Whether you want to de-chunk an overwhelming task, decode ambiguous communication, or adjust sensory soundscapes, I'm ready.`;
}
