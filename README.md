# AetherOS: The Adaptive Cognitive Desktop & AI Assistant for Neurodivergent Minds

[![AetherOS](https://img.shields.io/badge/AetherOS-v2.5_Adaptive-indigo.svg)](https://github.com)
[![Accessibility](https://img.shields.io/badge/WCAG-AAA_Compliant-emerald.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-blue.svg)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg)](https://tailwindcss.com/)

> **AetherOS** is a production-grade, full-stack, browser-based operating desktop built to eliminate the digital barriers faced by neurodivergent minds—including ADHD, Dyslexia, Autism, Dyscalculia, and Sensory Processing Differences.

---

## 🌟 Key Pillars & Features

### 1. Dynamic Cognitive Shells (Zero-Reload Context Switching)
Switch your entire desktop environment instantaneously across four calibrated sensory profiles:

- **Standard Shell**: Sleek dark slate environment (`#0B0F17`) with balanced contrast and crisp borders.
- **Dyslexia Shell**: Enforces Google Font **Lexend** globally, soft warm cream parchment background (`#FAF6EE`), dark charcoal text (`#1A202C`), expanded letter spacing (`0.05em`), and relaxed line height (`1.85`).
- **ADHD Focus Shell**: Deep navy backdrop (`#0D1117`) with electric dopamine accents (amber and emerald), task initiation countdowns, milestone confetti, and **Tunnel View Mode** (collapses background clutter to spotlight a single active micro-action).
- **Sensory Ease / Autism Shell**: Ultra-low sensory load palette (`#1E232A`), zero flashing animations or harsh glare, and direct access to literal context translators.

---

### 2. Built-in Sensory & Fixation Assistive Suite
- **Web Audio API Brown Noise Synthesizer**: Pure client-side synthetic brown noise using a 1-pole leaky integrator (-6 dB/octave attenuation) with volume control and live wave animation (zero external audio file downloads).
- **Interactive Reading Ruler**: Mouse-following horizontal line-focus ruler with adjustable dimming masks above and below to prevent visual text skipping and ocular fatigue.
- **Bionic Reading Formatter**: Client-side text converter highlighting the first 40–50% of words in bold anchor characters to optimize visual tracking.
- **Sensory Tint Overlays**: Multi-shade warm tint overlays (Parchment, Rose, Mint, Amber, Ice Blue) designed to eliminate screen glare and visual stress.

---

### 3. Four Specialized AI Micro-Engines (Powered by Google Gemini 2.5 Flash)
1. **ADHD Atomic Task De-Chunker**:
   - Decomposes paralyzing goals into frictionless micro-steps taking $\le 5$ minutes each.
   - Generates positive kickoff messages to eliminate initiation friction.
   - Includes step countdown timers and celebratory confetti upon milestone completions.
2. **Dyslexia & Dysgraphia Phonetic Reconstructor**:
   - Rebuilds phonetically spelled drafts, reversed letters, and missing punctuation without altering the author's authentic voice.
   - Integrated Web Speech API text-to-speech read-aloud.
3. **Autism & Social Ambiguity Tone Decoder**:
   - Translates indirect workplace messages into literal meaning.
   - Surfaces unspoken emotional subtext and corporate idioms.
   - Pre-drafts "Polite & Direct" and "Professional Boundary" replies.
4. **Dyscalculia "Number Lens" & Scale Clarifier**:
   - Formats unreadable digit clusters into spaced, eye-tracking friendly chunks.
   - Translates confusing budgets, loan APRs, and metrics into concrete, tangible real-world analogies.

---

### 4. Ambient Synapse AI Co-Pilot (5 Personas)
Slide-out ambient assistant dock with real-time persona switching:
- **Core Synapse**: Shell-adaptive guidance matching your active cognitive environment.
- **Initiation Coach**: Dedicated to overcoming executive dysfunction and starting 2-minute actions.
- **Neuro-Editor**: Clarifies drafts and thoughts without sounding generic.
- **Sensory Grounding**: Guides 30-second breathing exercises and de-escalates sensory overwhelm.
- **Social Context Guide**: Translates confusing emails and drafts assertive replies.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v6, Tailwind CSS v4, Lucide React, Canvas Confetti |
| **Backend** | Node.js (ES Modules), Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Zod |
| **AI Integration** | Official `@google/genai` TypeScript SDK using `gemini-2.5-flash` |
| **Audio Processing**| Native HTML5 Web Audio API (real-time brown noise generation) |
| **Persistence** | PostgreSQL DDL Schema (`server/db/init.sql`) with JSON-backed data store |

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js 18+ installed
- NPM or PNPM

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="your_google_gemini_api_key_here"

# PORT: Server port (defaults to 3000)
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_neuro_2026_x89a!
```

### 3. Start the Full-Stack Application
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

---

## 🔑 Demo Account

For instant evaluation, click the **"One-Click Demo Login"** button on the sign-in screen, or use:

- **Email:** `alex@aetheros.dev`
- **Password:** `AetherOS2026!`

---

## 🛡️ Database Schema (PostgreSQL DDL)

The complete SQL schema is defined in `server/db/init.sql`:
- `users`: Secure authentication credentials and timestamps.
- `user_preferences`: Active shell state, fonts, overlays, and sound volume.
- `task_dechunks`: Saved ADHD goals, steps, and progress records.
- `number_clarifications`: Saved dyscalculia scale conversions and analogies.
- `tone_decodings`: History of decoded messages and suggested replies.

---

## ♿ Accessibility Compliance
- **WCAG 2.1 AAA** compliant contrast ratios across dark, light, and low-sensory modes.
- Keyboard-accessible interactive elements with visible `focus-visible` focus rings.
- ARIA labels on all modal controls, sliders, sound generators, and tabs.
- Zero forced auto-play media or rapid flashing animations.

---

## 📄 License
Apache-2.0 License. Built for universal digital inclusion.
