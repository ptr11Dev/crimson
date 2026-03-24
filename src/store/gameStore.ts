import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Mission {
  id: number;
  type: string;
  durationHours: number;
  startDay: number;
  startTime: string;
  startRealTime: number;
}

export interface SpeedupTimestamp {
  day: number;
  time: string;
}

export interface IncomeTimestamp {
  day: number;
  time: string;
}

export interface SavedMission {
  type: string;
  durationHours: number;
  remainingHours: number;
}

export interface SavedSessionData {
  nextSpeedupHours: number | null;
  nextIncomeDays: number | null;
  nextIncomeHours: number | null;
  remainingMissions: SavedMission[];
  lastGameDay: number | null;
  lastGameTime: string | null;
}

interface GameState {
  // Session state (not persisted)
  sessionStartTime: number | null;
  // Baseline: the real-time anchor point for game time calculation.
  // Resets whenever the user manually corrects the game time.
  baselineRealTime: number | null;
  baselineGameDay: number;
  baselineGameTime: string;
  // Current game time (updated by hook, used for display and action timestamps)
  currentGameDay: number;
  currentGameTime: string;

  // Action timestamps – each stores the NEXT occurrence time
  lastSpeedup: SpeedupTimestamp | null;
  lastIncome: IncomeTimestamp | null;

  missions: Mission[];

  // Persisted data
  lastGoldbarDay: number | null;
  savedSessionData: SavedSessionData;

  // Actions
  startSession: (
    gameDay: number,
    gameTime: string,
    nextSpeedupHours: number,
    nextIncomeDays: number | null,
    nextIncomeHours: number | null,
    goldbarDay: number | null,
    existingMissions?: Mission[],
  ) => void;
  endSession: () => void;
  updateCurrentGameTime: (day: number, time: string) => void;
  setLiveGameTime: (day: number, time: string) => void;
  confirmSpeedup: () => void;
  resetSpeedup: () => void;
  confirmIncome: () => void;
  confirmGoldbar: () => void;
  addMission: (missionType: string, durationHours: number) => void;
  removeMission: (missionId: number) => void;
}

// Helper: add game minutes to a day+time, returns {day, time}
function addGameMinutes(
  day: number,
  time: string,
  minutes: number,
): { day: number; time: string } {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = (day - 1) * 24 * 60 + h * 60 + m + minutes;
  const newDay = Math.floor(totalMinutes / (24 * 60)) + 1;
  const tod = totalMinutes % (24 * 60);
  const newHour = Math.floor(tod / 60);
  const newMin = tod % 60;
  return {
    day: newDay,
    time: `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`,
  };
}

// Helper: difference in game minutes between two day+time points (end - start)
function diffGameMinutes(
  endDay: number,
  endTime: string,
  startDay: number,
  startTime: string,
): number {
  const [eh, em] = endTime.split(':').map(Number);
  const [sh, sm] = startTime.split(':').map(Number);
  const endTotal = (endDay - 1) * 24 * 60 + eh * 60 + em;
  const startTotal = (startDay - 1) * 24 * 60 + sh * 60 + sm;
  return endTotal - startTotal;
}

const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessionStartTime: null,
      baselineRealTime: null,
      baselineGameDay: 1,
      baselineGameTime: '00:00',
      currentGameDay: 1,
      currentGameTime: '00:00',
      lastSpeedup: null,
      lastIncome: null,
      missions: [],
      lastGoldbarDay: null,
      savedSessionData: {
        nextSpeedupHours: null,
        nextIncomeDays: null,
        nextIncomeHours: null,
        remainingMissions: [],
        lastGameDay: null,
        lastGameTime: null,
      },

      startSession: (
        gameDay,
        gameTime,
        nextSpeedupHours,
        nextIncomeDays,
        nextIncomeHours,
        goldbarDay,
        existingMissions = [],
      ) => {
        const now = Date.now();

        // Next speedup = current game time + nextSpeedupHours
        const speedupNext = addGameMinutes(
          gameDay,
          gameTime,
          nextSpeedupHours * 60,
        );
        const lastSpeedup: SpeedupTimestamp = {
          day: speedupNext.day,
          time: speedupNext.time,
        };

        // Next income = current game time + (days * 24 + hours)
        let lastIncome: IncomeTimestamp | null = null;
        if (nextIncomeDays !== null || nextIncomeHours !== null) {
          const totalMins =
            (nextIncomeDays ?? 0) * 24 * 60 + (nextIncomeHours ?? 0) * 60;
          const incomeNext = addGameMinutes(gameDay, gameTime, totalMins);
          lastIncome = { day: incomeNext.day, time: incomeNext.time };
        }

        set({
          sessionStartTime: now,
          baselineRealTime: now,
          baselineGameDay: gameDay,
          baselineGameTime: gameTime,
          currentGameDay: gameDay,
          currentGameTime: gameTime,
          lastSpeedup,
          lastIncome,
          lastGoldbarDay: goldbarDay,
          missions: existingMissions,
        });
      },

      endSession: () => {
        const state = get();

        // --- next speedup remaining hours ---
        let nextSpeedupHours: number | null = null;
        if (state.lastSpeedup) {
          const remainingMins = diffGameMinutes(
            state.lastSpeedup.day,
            state.lastSpeedup.time,
            state.currentGameDay,
            state.currentGameTime,
          );
          nextSpeedupHours = Math.max(0, remainingMins) / 60;
        }

        // --- next income remaining ---
        let nextIncomeDays: number | null = null;
        let nextIncomeHours: number | null = null;
        if (state.lastIncome) {
          const remainingMins = diffGameMinutes(
            state.lastIncome.day,
            state.lastIncome.time,
            state.currentGameDay,
            state.currentGameTime,
          );
          const remaining = Math.max(0, remainingMins);
          nextIncomeDays = Math.floor(remaining / (24 * 60));
          nextIncomeHours = Math.floor((remaining % (24 * 60)) / 60);
        }

        // --- missions remaining ---
        const remainingMissions: SavedMission[] = state.missions.map((m) => {
          const missionEndMins =
            diffGameMinutes(m.startDay, m.startTime, 1, '00:00') +
            m.durationHours * 60;
          const currentMins = diffGameMinutes(
            state.currentGameDay,
            state.currentGameTime,
            1,
            '00:00',
          );
          const remaining = Math.max(0, missionEndMins - currentMins) / 60;
          return {
            type: m.type,
            durationHours: m.durationHours,
            remainingHours: remaining,
          };
        });

        const savedData: SavedSessionData = {
          nextSpeedupHours,
          nextIncomeDays,
          nextIncomeHours,
          remainingMissions,
          lastGameDay: state.currentGameDay,
          lastGameTime: state.currentGameTime,
        };

        set({
          savedSessionData: savedData,
          sessionStartTime: null,
          baselineRealTime: null,
          missions: [],
          lastSpeedup: null,
          lastIncome: null,
        });
      },

      // Manual time correction: resets the baseline so the interval
      // continues from this new reference point instead of drifting back.
      updateCurrentGameTime: (day: number, time: string) => {
        const now = Date.now();
        set({
          baselineRealTime: now,
          baselineGameDay: day,
          baselineGameTime: time,
          currentGameDay: day,
          currentGameTime: time,
        });
      },

      // Called by the hook every tick to update display-only game time
      setLiveGameTime: (day: number, time: string) => {
        set({ currentGameDay: day, currentGameTime: time });
      },

      confirmSpeedup: () => {
        const { currentGameDay, currentGameTime } = get();
        // Speedup advances in-game time by 12h — update the baseline so the
        // live clock immediately reflects the jump.
        const jumped = addGameMinutes(currentGameDay, currentGameTime, 12 * 60);
        const now = Date.now();
        // Next speedup is 10h after the new (post-jump) game time.
        const next = addGameMinutes(jumped.day, jumped.time, 10 * 60);
        set({
          baselineRealTime: now,
          baselineGameDay: jumped.day,
          baselineGameTime: jumped.time,
          currentGameDay: jumped.day,
          currentGameTime: jumped.time,
          lastSpeedup: { day: next.day, time: next.time },
        });
      },

      resetSpeedup: () => {
        const { currentGameDay, currentGameTime } = get();
        // Reset timer to 10h from now — no game time jump
        const next = addGameMinutes(currentGameDay, currentGameTime, 10 * 60);
        set({ lastSpeedup: { day: next.day, time: next.time } });
      },

      confirmIncome: () => {
        const { currentGameDay, currentGameTime } = get();
        const next = addGameMinutes(
          currentGameDay,
          currentGameTime,
          3 * 24 * 60,
        );
        set({ lastIncome: { day: next.day, time: next.time } });
      },

      confirmGoldbar: () => {
        const { currentGameDay } = get();
        set({ lastGoldbarDay: currentGameDay });
      },

      addMission: (missionType: string, durationHours: number) => {
        const state = get();
        const newMission: Mission = {
          id: Date.now(),
          type: missionType,
          durationHours,
          startDay: state.currentGameDay,
          startTime: state.currentGameTime,
          startRealTime: Date.now(),
        };
        set({ missions: [...state.missions, newMission] });
      },

      removeMission: (missionId: number) => {
        set((state) => ({
          missions: state.missions.filter((m) => m.id !== missionId),
        }));
      },
    }),
    {
      name: 'crimson-desert-timers',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastGoldbarDay: state.lastGoldbarDay,
        savedSessionData: state.savedSessionData,
      }),
    },
  ),
);

export default useGameStore;
