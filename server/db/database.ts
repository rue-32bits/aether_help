import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  active_shell: 'standard' | 'dyslexia' | 'adhd' | 'autism';
  font_family: string;
  font_size: string;
  tint_overlay_enabled: boolean;
  tint_color: string;
  bionic_reading_enabled: boolean;
  reading_ruler_enabled: boolean;
  brown_noise_volume: number;
  updated_at: string;
}

export interface TaskStep {
  step: number;
  title: string;
  estimatedMinutes: number;
  actionTip: string;
  completed?: boolean;
}

export interface TaskDechunk {
  id: string;
  user_id: string;
  original_goal: string;
  kickoff_message: string;
  steps: TaskStep[];
  is_completed: boolean;
  created_at: string;
}

export interface NumberClarification {
  id: string;
  user_id: string;
  raw_input: string;
  chunked_form: string;
  plain_scale: string;
  relative_takeaway: string;
  created_at: string;
}

export interface ToneSuggestedReply {
  type: string;
  text: string;
}

export interface ToneDecoding {
  id: string;
  user_id: string;
  raw_message: string;
  literal_meaning: string;
  detected_tone: string;
  subtext_analysis: string;
  suggested_replies: ToneSuggestedReply[];
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  user_preferences: UserPreferences[];
  task_dechunks: TaskDechunk[];
  number_clarifications: NumberClarification[];
  tone_decodings: ToneDecoding[];
}

const DB_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'aetheros_store.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadDB(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading db file, reinitializing', e);
    }
  }

  // Pre-seed demo user: alex@aetheros.dev / AetherOS2026!
  const demoUserId = 'b73d82a1-6a23-4929-9e8c-5120fa288810';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('AetherOS2026!', salt);

  const initialDB: DatabaseSchema = {
    users: [
      {
        id: demoUserId,
        email: 'alex@aetheros.dev',
        password_hash: passwordHash,
        full_name: 'Alex Vance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    user_preferences: [
      {
        id: crypto.randomUUID(),
        user_id: demoUserId,
        active_shell: 'standard',
        font_family: 'default',
        font_size: 'base',
        tint_overlay_enabled: false,
        tint_color: '#FAF6EE',
        bionic_reading_enabled: false,
        reading_ruler_enabled: false,
        brown_noise_volume: 0.2,
        updated_at: new Date().toISOString(),
      },
    ],
    task_dechunks: [
      {
        id: crypto.randomUUID(),
        user_id: demoUserId,
        original_goal: 'File federal and state taxes before the deadline',
        kickoff_message: 'Tax paperwork triggers executive overwhelm. We will only spend 3 minutes gathering what is already in your inbox.',
        steps: [
          {
            step: 1,
            title: 'Open your email search and type "W2" or "1099"',
            estimatedMinutes: 2,
            actionTip: 'Do not look at the numbers yet—just download the PDF attachments to a folder on your desktop.',
            completed: true,
          },
          {
            step: 2,
            title: 'Create one folder named "Taxes 2026" on your desktop',
            estimatedMinutes: 2,
            actionTip: 'Move the downloaded PDFs in there so everything is visually in one place.',
            completed: true,
          },
          {
            step: 3,
            title: 'Log in to tax portal and save your login credentials',
            estimatedMinutes: 3,
            actionTip: 'You do not have to fill anything in yet. Just make sure your password works.',
            completed: false,
          },
          {
            step: 4,
            title: 'Upload the 1 main W2 document and stop',
            estimatedMinutes: 5,
            actionTip: 'Let the portal auto-fill the boxes. Take a high-five break right after.',
            completed: false,
          },
        ],
        is_completed: false,
        created_at: new Date().toISOString(),
      },
    ],
    number_clarifications: [
      {
        id: crypto.randomUUID(),
        user_id: demoUserId,
        raw_input: 'The city council allocated $142,500,000 for storm drain upgrades over 10 years.',
        chunked_form: '$ 142 , 500 , 000  ( 142.5 Million Dollars )',
        plain_scale: 'About $14.25 million per year, which is roughly $39 per resident annually for a city of 360,000 people.',
        relative_takeaway: 'This is an infrastructure maintenance budget averaging less than a monthly streaming subscription per resident.',
        created_at: new Date().toISOString(),
      },
    ],
    tone_decodings: [
      {
        id: crypto.randomUUID(),
        user_id: demoUserId,
        raw_message: 'Per my previous email, let me know when you have time to look over the revised slide deck. We need this wrapped up sooner rather than later.',
        literal_meaning: 'Please check the revised slide deck as soon as your schedule permits and confirm when you will complete it.',
        detected_tone: 'Frustrated / Urgent (Passive-Aggressive phrasing)',
        subtext_analysis: '"Per my previous email" signals impatience that an earlier request was unread or unacknowledged. "Sooner rather than later" means they are feeling deadline pressure or anxiety from superiors.',
        suggested_replies: [
          {
            type: 'Polite & Direct',
            text: 'Thanks for following up. I am reviewing the revised deck now and will send my final notes by 3:00 PM today.',
          },
          {
            type: 'Professional Boundary',
            text: 'I received the deck. I am currently finalizing the Q2 report, but I have slotted 45 minutes at 2:00 PM to review your slides and provide feedback.',
          },
        ],
        created_at: new Date().toISOString(),
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
  return initialDB;
}

let db = loadDB();

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export const dbStore = {
  // Users
  findUserByEmail: (email: string): User | undefined => {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id: string): User | undefined => {
    return db.users.find((u) => u.id === id);
  },
  createUser: (email: string, passwordHash: string, fullName: string): User => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Provision default user_preferences
    const defaultPrefs: UserPreferences = {
      id: crypto.randomUUID(),
      user_id: newUser.id,
      active_shell: 'standard',
      font_family: 'default',
      font_size: 'base',
      tint_overlay_enabled: false,
      tint_color: '#FAF6EE',
      bionic_reading_enabled: false,
      reading_ruler_enabled: false,
      brown_noise_volume: 0.2,
      updated_at: new Date().toISOString(),
    };
    db.user_preferences.push(defaultPrefs);
    saveDB();
    return newUser;
  },

  // Preferences
  getUserPreferences: (userId: string): UserPreferences => {
    let prefs = db.user_preferences.find((p) => p.user_id === userId);
    if (!prefs) {
      prefs = {
        id: crypto.randomUUID(),
        user_id: userId,
        active_shell: 'standard',
        font_family: 'default',
        font_size: 'base',
        tint_overlay_enabled: false,
        tint_color: '#FAF6EE',
        bionic_reading_enabled: false,
        reading_ruler_enabled: false,
        brown_noise_volume: 0.2,
        updated_at: new Date().toISOString(),
      };
      db.user_preferences.push(prefs);
      saveDB();
    }
    return prefs;
  },
  updateUserPreferences: (
    userId: string,
    updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'updated_at'>>
  ): UserPreferences => {
    const index = db.user_preferences.findIndex((p) => p.user_id === userId);
    if (index === -1) {
      const newPrefs: UserPreferences = {
        id: crypto.randomUUID(),
        user_id: userId,
        active_shell: updates.active_shell || 'standard',
        font_family: updates.font_family || 'default',
        font_size: updates.font_size || 'base',
        tint_overlay_enabled: updates.tint_overlay_enabled ?? false,
        tint_color: updates.tint_color || '#FAF6EE',
        bionic_reading_enabled: updates.bionic_reading_enabled ?? false,
        reading_ruler_enabled: updates.reading_ruler_enabled ?? false,
        brown_noise_volume: updates.brown_noise_volume ?? 0.2,
        updated_at: new Date().toISOString(),
      };
      db.user_preferences.push(newPrefs);
      saveDB();
      return newPrefs;
    }

    db.user_preferences[index] = {
      ...db.user_preferences[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDB();
    return db.user_preferences[index];
  },

  // Tasks
  getTasksByUserId: (userId: string): TaskDechunk[] => {
    return db.task_dechunks
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createTaskDechunk: (
    userId: string,
    originalGoal: string,
    kickoffMessage: string,
    steps: TaskStep[]
  ): TaskDechunk => {
    const task: TaskDechunk = {
      id: crypto.randomUUID(),
      user_id: userId,
      original_goal: originalGoal,
      kickoff_message: kickoffMessage,
      steps: steps.map((s, idx) => ({ ...s, completed: s.completed ?? false, step: idx + 1 })),
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    db.task_dechunks.unshift(task);
    saveDB();
    return task;
  },
  toggleTaskStep: (
    userId: string,
    taskId: string,
    stepNumber: number
  ): TaskDechunk | null => {
    const task = db.task_dechunks.find((t) => t.id === taskId && t.user_id === userId);
    if (!task) return null;
    const step = task.steps.find((s) => s.step === stepNumber);
    if (step) {
      step.completed = !step.completed;
      task.is_completed = task.steps.every((s) => s.completed);
      saveDB();
    }
    return task;
  },
  deleteTask: (userId: string, taskId: string): boolean => {
    const initialLen = db.task_dechunks.length;
    db.task_dechunks = db.task_dechunks.filter((t) => !(t.id === taskId && t.user_id === userId));
    const deleted = db.task_dechunks.length < initialLen;
    if (deleted) saveDB();
    return deleted;
  },

  // Number Clarifications
  getNumberClarifications: (userId: string): NumberClarification[] => {
    return db.number_clarifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createNumberClarification: (
    userId: string,
    rawInput: string,
    chunkedForm: string,
    plainScale: string,
    relativeTakeaway: string
  ): NumberClarification => {
    const item: NumberClarification = {
      id: crypto.randomUUID(),
      user_id: userId,
      raw_input: rawInput,
      chunked_form: chunkedForm,
      plain_scale: plainScale,
      relative_takeaway: relativeTakeaway,
      created_at: new Date().toISOString(),
    };
    db.number_clarifications.unshift(item);
    saveDB();
    return item;
  },
  deleteNumberClarification: (userId: string, id: string): boolean => {
    const initialLen = db.number_clarifications.length;
    db.number_clarifications = db.number_clarifications.filter(
      (n) => !(n.id === id && n.user_id === userId)
    );
    const deleted = db.number_clarifications.length < initialLen;
    if (deleted) saveDB();
    return deleted;
  },

  // Tone Decodings
  getToneDecodings: (userId: string): ToneDecoding[] => {
    return db.tone_decodings
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createToneDecoding: (
    userId: string,
    rawMessage: string,
    literalMeaning: string,
    detectedTone: string,
    subtextAnalysis: string,
    suggestedReplies: ToneSuggestedReply[]
  ): ToneDecoding => {
    const item: ToneDecoding = {
      id: crypto.randomUUID(),
      user_id: userId,
      raw_message: rawMessage,
      literal_meaning: literalMeaning,
      detected_tone: detectedTone,
      subtext_analysis: subtextAnalysis,
      suggested_replies: suggestedReplies,
      created_at: new Date().toISOString(),
    };
    db.tone_decodings.unshift(item);
    saveDB();
    return item;
  },
  deleteToneDecoding: (userId: string, id: string): boolean => {
    const initialLen = db.tone_decodings.length;
    db.tone_decodings = db.tone_decodings.filter(
      (t) => !(t.id === id && t.user_id === userId)
    );
    const deleted = db.tone_decodings.length < initialLen;
    if (deleted) saveDB();
    return deleted;
  },
};
