import { Mission, SpeedupTimestamp } from '../store/gameStore';
import { REAL_TO_GAME_RATIO } from '../constants';

export interface GameTime {
  day: number;
  time: string;
  totalMinutes: number;
}

export interface SpeedupRemaining {
  available: boolean;
  remainingMinutes: number;
  nextDay?: number;
  nextTime?: string;
}

export interface IncomeRemaining {
  available: boolean;
  remainingDays: number;
  remainingMinutes?: number;
  nextDay?: number;
  nextTime?: string;
}

export interface GoldbarRemaining {
  available: boolean;
  remainingDays: number;
  nextDay?: number;
}

export interface MissionRemaining {
  available: boolean;
  remainingMinutes: number;
  endDay: number;
  endTime: string;
}

export interface RealTimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  formatted: string;
}

/**
 * Convert real-time minutes to game hours
 */
export const realMinutesToGameHours = (realMinutes: number): number => {
  return realMinutes / REAL_TO_GAME_RATIO;
};

/**
 * Convert game hours to real-time minutes
 */
export const gameHoursToRealMinutes = (gameHours: number): number => {
  return gameHours * REAL_TO_GAME_RATIO;
};

/**
 * Parse game time string "HH:MM" to total minutes
 */
export const parseGameTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Format total minutes to "HH:MM"
 */
export const formatGameTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = Math.floor(totalMinutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calculate current game time based on session start
 */
export const calculateCurrentGameTime = (
  sessionStartTime: number,
  initialGameDay: number,
  initialGameTime: string,
): GameTime => {
  const realElapsedMs = Date.now() - sessionStartTime;
  const realElapsedMinutes = realElapsedMs / (1000 * 60);
  const gameElapsedHours = realMinutesToGameHours(realElapsedMinutes);

  const initialMinutes = parseGameTime(initialGameTime);
  const totalGameMinutes = initialMinutes + gameElapsedHours * 60;

  const day = initialGameDay + Math.floor(totalGameMinutes / (24 * 60));
  const timeOfDay = totalGameMinutes % (24 * 60);

  return {
    day,
    time: formatGameTime(timeOfDay),
    totalMinutes: totalGameMinutes,
  };
};

/**
 * Format game time as "Dzień X, HH:MM"
 */
export const formatGameDateTime = (day: number, time: string): string => {
  return `Dzień ${day}, ${time}`;
};

/**
 * Calculate time remaining until next speedup (every 10 game hours)
 * Note: lastSpeedup contains the NEXT speedup time (day + time), not the last executed time
 */
export const calculateSpeedupRemaining = (
  lastSpeedup: SpeedupTimestamp | null,
  currentDay: number,
  currentTime: string,
): SpeedupRemaining => {
  if (!lastSpeedup) {
    return { available: true, remainingMinutes: 0 };
  }

  // lastSpeedup contains the NEXT speedup time
  const nextSpeedupMinutes = parseGameTime(lastSpeedup.time);
  const nextSpeedupTotalMinutes = (lastSpeedup.day - 1) * 24 * 60 + nextSpeedupMinutes;

  const currentMinutes = parseGameTime(currentTime);
  const currentTotalMinutes = (currentDay - 1) * 24 * 60 + currentMinutes;

  const remainingMinutes = nextSpeedupTotalMinutes - currentTotalMinutes;
  const available = remainingMinutes <= 0;

  return {
    available,
    remainingMinutes: available ? 0 : remainingMinutes,
    nextDay: lastSpeedup.day,
    nextTime: lastSpeedup.time,
  };
};

/**
 * Calculate time remaining until next income
 * Note: lastIncome now contains the NEXT income time (day + time)
 */
export const calculateIncomeRemaining = (
  lastIncomeDay: number | null | undefined,
  currentDay: number,
  lastIncomeTime?: string,
  currentTime?: string,
): IncomeRemaining => {
  if (!lastIncomeDay) {
    // If no income data, income is available now
    return {
      available: true,
      remainingDays: 0,
      nextDay: currentDay,
      nextTime: '00:00',
    };
  }

  // lastIncome actually stores NEXT income time
  const nextIncomeDay = lastIncomeDay;
  const nextIncomeTime = lastIncomeTime || '00:00';

  // Calculate current and next income in total minutes
  const currentMinutes = parseGameTime(currentTime || '00:00');
  const currentTotalMinutes = (currentDay - 1) * 24 * 60 + currentMinutes;

  const nextMinutes = parseGameTime(nextIncomeTime);
  const nextIncomeTotalMinutes = (nextIncomeDay - 1) * 24 * 60 + nextMinutes;

  const remainingMinutes = nextIncomeTotalMinutes - currentTotalMinutes;
  const available = remainingMinutes <= 0;

  const remainingDays = Math.floor(remainingMinutes / (24 * 60));

  return {
    available,
    remainingDays: available ? 0 : remainingDays,
    remainingMinutes: available ? 0 : remainingMinutes,
    nextDay: nextIncomeDay,
    nextTime: nextIncomeTime,
  };
};

/**
 * Calculate time remaining until next goldbar (every 7 game days)
 */
export const calculateGoldbarRemaining = (
  lastGoldbarDay: number | null,
  currentDay: number,
): GoldbarRemaining => {
  if (!lastGoldbarDay) {
    // If no last goldbar data, goldbar is available now
    return {
      available: true,
      remainingDays: 0,
      nextDay: currentDay, // Next goldbar can be collected now
    };
  }

  const elapsedDays = currentDay - lastGoldbarDay;
  const goldbarIntervalDays = 7;

  const remainingDays =
    goldbarIntervalDays - (elapsedDays % goldbarIntervalDays);
  const available = elapsedDays >= goldbarIntervalDays;

  return {
    available,
    remainingDays: available ? 0 : remainingDays,
    nextDay: lastGoldbarDay + goldbarIntervalDays,
  };
};

/**
 * Calculate mission remaining time
 */
export const calculateMissionRemaining = (
  mission: Mission,
  currentDay: number,
  currentTime: string,
): MissionRemaining => {
  const startMinutes = parseGameTime(mission.startTime);
  const startTotalMinutes = (mission.startDay - 1) * 24 * 60 + startMinutes;

  const currentMinutes = parseGameTime(currentTime);
  const currentTotalMinutes = (currentDay - 1) * 24 * 60 + currentMinutes;

  const missionDurationMinutes = mission.durationHours * 60;
  const endTotalMinutes = startTotalMinutes + missionDurationMinutes;

  const remainingMinutes = endTotalMinutes - currentTotalMinutes;
  const available = remainingMinutes <= 0;

  const endDay = Math.floor(endTotalMinutes / (24 * 60)) + 1;
  const endTime = formatGameTime(endTotalMinutes % (24 * 60));

  return {
    available,
    remainingMinutes: Math.max(0, remainingMinutes),
    endDay,
    endTime,
  };
};

/**
 * Calculate progress percentage (0-100)
 */
export const calculateProgress = (elapsed: number, total: number): number => {
  if (total === 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

/**
 * Get color for progress based on percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return '#22c55e'; // green
  if (percentage >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
};

/**
 * Calculate real-time remaining for display
 */
export const calculateRealTimeRemaining = (
  gameMinutesRemaining: number,
): RealTimeRemaining => {
  const realMinutes = gameHoursToRealMinutes(gameMinutesRemaining / 60);

  const hours = Math.floor(realMinutes / 60);
  const minutes = Math.floor(realMinutes % 60);
  const seconds = Math.floor((realMinutes % 1) * 60);

  return {
    hours,
    minutes,
    seconds,
    totalMinutes: realMinutes,
    formatted: `${hours}h ${minutes}m ${seconds}s`,
  };
};

/**
 * Calculate exact real timestamp when action will be available
 * Returns milliseconds until action is available
 */
export const calculateRealTimeUntil = (
  sessionStartTime: number,
  initialGameDay: number,
  initialGameTime: string,
  targetDay: number,
  targetTime: string,
): number => {
  // Calculate target in total game minutes from start
  const initialMinutes = parseGameTime(initialGameTime);
  const initialTotalMinutes = (initialGameDay - 1) * 24 * 60 + initialMinutes;

  const targetMinutes = parseGameTime(targetTime);
  const targetTotalMinutes = (targetDay - 1) * 24 * 60 + targetMinutes;

  const gameMinutesToTarget = targetTotalMinutes - initialTotalMinutes;

  // Convert to real time
  const realMinutesToTarget = gameHoursToRealMinutes(gameMinutesToTarget / 60);
  const realMsToTarget = realMinutesToTarget * 60 * 1000;

  // Calculate exact timestamp when target will be reached
  const targetRealTimestamp = sessionStartTime + realMsToTarget;

  // Return milliseconds remaining
  return Math.max(0, targetRealTimestamp - Date.now());
};

/**
 * Format milliseconds to readable time string
 */
export const formatMillisecondsToTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};
