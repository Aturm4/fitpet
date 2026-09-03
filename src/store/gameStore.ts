import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { XP_PER_REP, getLevel, getLevelProgress } from '../game/xpSystem';
import type { ExerciseType } from '../game/xpSystem';
import type { CharacterType } from '../game/characterStages';

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  xp: number;
  level: number;
  levelProgress: number;
  totalReps: number;
  repsByExercise: Record<ExerciseType, number>;
  createdAt: number;
  // Daily goal
  dailyGoal: number;
  todayReps: number;
  lastCheckDate: string;
  streak: number;
  bestStreak: number;
  // Stats history: 'YYYY-MM-DD' → reps that day
  dailyHistory: Record<string, number>;
}

export interface DecayInfo {
  xpLost: number;
  daysMissed: number;
}

type Screen = 'menu' | 'create' | 'game';

interface GameState {
  characters: Character[];
  activeId: string | null;
  screen: Screen;
  isLevelingUp: boolean;
  decayInfo: DecayInfo | null;

  createCharacter: (name: string, type: CharacterType) => void;
  selectCharacter: (id: string) => void;
  addRep: (exercise: ExerciseType) => void;
  finishLevelUp: () => void;
  goToMenu: () => void;
  goToCreate: () => void;
  setDailyGoal: (id: string, goal: number) => void;
  applyDecay: () => void;
  clearDecayInfo: () => void;
}

function dateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const DECAY_PER_DAY = 80;

function withDefaults(c: Partial<Character> & Pick<Character, 'id' | 'name' | 'type' | 'xp' | 'level' | 'levelProgress' | 'totalReps' | 'repsByExercise' | 'createdAt'>): Character {
  return {
    dailyGoal: 50,
    todayReps: 0,
    lastCheckDate: dateStr(),
    streak: 0,
    bestStreak: 0,
    dailyHistory: {},
    ...c,
  } as Character;
}

function makeCharacter(name: string, type: CharacterType): Character {
  return {
    id: generateId(),
    name,
    type,
    xp: 0,
    level: 1,
    levelProgress: 0,
    totalReps: 0,
    repsByExercise: { squat: 0, pushup: 0, jumpingjack: 0 },
    createdAt: Date.now(),
    dailyGoal: 50,
    todayReps: 0,
    lastCheckDate: dateStr(),
    streak: 0,
    bestStreak: 0,
    dailyHistory: {},
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      characters: [],
      activeId: null,
      screen: 'menu',
      isLevelingUp: false,
      decayInfo: null,

      createCharacter: (name, type) => {
        const char = makeCharacter(name, type);
        set((s) => ({ characters: [...s.characters, char], activeId: char.id, screen: 'game' }));
      },

      selectCharacter: (id) => set({ activeId: id, screen: 'game' }),

      addRep: (exercise) => {
        const { characters, activeId } = get();
        if (!activeId) return;
        const today = dateStr();
        const updated = characters.map((raw) => {
          if (raw.id !== activeId) return raw;
          const c = withDefaults(raw);
          const newXp = c.xp + XP_PER_REP[exercise];
          const newLevel = getLevel(newXp);
          if (newLevel > c.level) set({ isLevelingUp: true });
          const todayReps = (c.lastCheckDate === today ? c.todayReps : 0) + 1;
          const dailyHistory = {
            ...c.dailyHistory,
            [today]: (c.dailyHistory[today] ?? 0) + 1,
          };
          return {
            ...c,
            xp: newXp,
            level: newLevel,
            levelProgress: getLevelProgress(newXp),
            totalReps: c.totalReps + 1,
            repsByExercise: { ...c.repsByExercise, [exercise]: c.repsByExercise[exercise] + 1 },
            todayReps,
            lastCheckDate: today,
            dailyHistory,
          };
        });
        set({ characters: updated });
      },

      finishLevelUp: () => set({ isLevelingUp: false }),

      goToMenu: () => set({ screen: 'menu', activeId: null }),

      goToCreate: () => set({ screen: 'create' }),

      setDailyGoal: (id, goal) => {
        set((s) => ({
          characters: s.characters.map((raw) =>
            raw.id === id ? { ...withDefaults(raw), dailyGoal: goal } : raw
          ),
        }));
      },

      applyDecay: () => {
        const today = dateStr();
        let totalLost = 0;
        let maxMissed = 0;

        const characters = get().characters.map((raw) => {
          const c = withDefaults(raw);
          const days = daysBetween(c.lastCheckDate, today);
          if (days === 0) return c;

          const streakContinued = days === 1 && c.todayReps >= c.dailyGoal;
          const newStreak = streakContinued ? c.streak + 1 : 0;
          const newBestStreak = Math.max(c.bestStreak, newStreak);

          const decayDays = Math.max(0, days - 1);
          const xpLost = decayDays * DECAY_PER_DAY;
          const newXP = Math.max(0, c.xp - xpLost);

          if (xpLost > 0 && c.xp > 0) {
            totalLost += Math.min(xpLost, c.xp);
            maxMissed = Math.max(maxMissed, decayDays);
          }

          return {
            ...c,
            xp: newXP,
            level: getLevel(newXP),
            levelProgress: getLevelProgress(newXP),
            todayReps: 0,
            lastCheckDate: today,
            streak: newStreak,
            bestStreak: newBestStreak,
          };
        });

        set({
          characters,
          decayInfo: totalLost > 0 ? { xpLost: totalLost, daysMissed: maxMissed } : null,
        });
      },

      clearDecayInfo: () => set({ decayInfo: null }),
    }),
    { name: 'fitpet-save-v2' }
  )
);

export function useActiveCharacter(): Character | null {
  const { characters, activeId } = useGameStore();
  const raw = characters.find((c) => c.id === activeId);
  if (!raw) return null;
  return withDefaults(raw);
}
