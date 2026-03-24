import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import useGameStore from '../store/gameStore';
import { TIMER_REFRESH_INTERVAL } from '../constants';
import {
  calculateCurrentGameTime,
  calculateSpeedupRemaining,
  calculateIncomeRemaining,
  calculateGoldbarRemaining,
  calculateMissionRemaining,
  calculateProgress,
  calculateRealTimeUntil,
  formatGameDateTime,
  GameTime,
} from '../utils/timeCalculator';
import {
  scheduleTimerNotification,
  cancelTimerNotification,
} from '../services/notificationService';

dayjs.extend(duration);

function formatMs(ms: number): string {
  if (ms <= 0) return '0h 0m 0s';
  const d = dayjs.duration(ms);
  const h = Math.floor(d.asHours());
  const m = d.minutes();
  const s = d.seconds();
  return `${h}h ${m}m ${s}s`;
}

export interface SpeedupTimer {
  available: boolean;
  remainingMinutes: number;
  nextDay: number;
  nextTime: string;
  progress: number;
  realTimeRemaining: string | null;
}

export interface IncomeTimer {
  available: boolean;
  remainingMinutes: number;
  nextDay: number;
  nextTime: string;
  progress: number;
  realTimeRemaining: string | null;
  gameTimeRemaining: string | null;
}

export interface GoldbarTimer {
  available: boolean;
  remainingDays: number;
  nextDay: number;
  progress: number;
  realTimeRemaining: string | null;
}

export interface MissionTimer {
  id: number;
  type: string;
  endDay: number;
  endTime: string;
  available: boolean;
  progress: number;
  realTimeRemaining: string | null;
  gameTimeRemaining: string | null;
}

interface UseGameTimerReturn {
  currentGameTime: string | null;
  speedupTimer: SpeedupTimer | null;
  incomeTimer: IncomeTimer | null;
  goldbarTimer: GoldbarTimer | null;
  missionTimers: MissionTimer[];
  handleConfirmSpeedup: () => void;
  handleResetSpeedup: () => void;
  handleConfirmIncome: () => void;
  handleConfirmGoldbar: () => void;
  handleConfirmMission: (missionId: number) => void;
}

const useGameTimer = (): UseGameTimerReturn => {
  const {
    sessionStartTime,
    baselineRealTime,
    baselineGameDay,
    baselineGameTime,
    lastSpeedup,
    lastIncome,
    lastGoldbarDay,
    missions,
    confirmSpeedup,
    resetSpeedup,
    confirmIncome,
    confirmGoldbar,
    removeMission,
    setLiveGameTime,
  } = useGameStore();

  const [currentTime, setCurrentTime] = useState<GameTime | null>(null);
  const [speedupTimer, setSpeedupTimer] = useState<SpeedupTimer | null>(null);
  const [incomeTimer, setIncomeTimer] = useState<IncomeTimer | null>(null);
  const [goldbarTimer, setGoldbarTimer] = useState<GoldbarTimer | null>(null);
  const [missionTimers, setMissionTimers] = useState<MissionTimer[]>([]);

  // Track which timers already had notifications scheduled so we don't
  // re-schedule on every tick — only once per timer per cycle.
  const notifScheduledRef = useRef<Set<string>>(new Set());

  const scheduleIfNeeded = useCallback(
    async (timerId: string, endTimestampMs: number, label: string) => {
      if (notifScheduledRef.current.has(timerId)) return;
      notifScheduledRef.current.add(timerId);
      await scheduleTimerNotification(timerId, endTimestampMs, label);
    },
    [],
  );

  const tick = useCallback(() => {
    if (!sessionStartTime || !baselineRealTime) return;

    const gameTime = calculateCurrentGameTime(
      baselineRealTime,
      baselineGameDay,
      baselineGameTime,
    );
    setCurrentTime(gameTime);
    setLiveGameTime(gameTime.day, gameTime.time);

    // Speedup
    const speedup = calculateSpeedupRemaining(
      lastSpeedup,
      gameTime.day,
      gameTime.time,
    );
    if (speedup.nextDay !== undefined && speedup.nextTime !== undefined) {
      const totalMins = 10 * 60;
      const elapsed = totalMins - speedup.remainingMinutes;
      const progress = calculateProgress(elapsed, totalMins);
      const msUntil = !speedup.available
        ? calculateRealTimeUntil(
            baselineRealTime,
            baselineGameDay,
            baselineGameTime,
            speedup.nextDay,
            speedup.nextTime,
          )
        : 0;
      setSpeedupTimer({
        available: speedup.available,
        remainingMinutes: speedup.remainingMinutes,
        nextDay: speedup.nextDay,
        nextTime: speedup.nextTime,
        progress,
        realTimeRemaining: !speedup.available ? formatMs(msUntil) : null,
      });
      if (!speedup.available) {
        scheduleIfNeeded(
          'speedup',
          Date.now() + msUntil,
          'Przyspieszenie Czasu',
        );
      }
    }

    // Income
    const income = calculateIncomeRemaining(
      lastIncome?.day,
      gameTime.day,
      lastIncome?.time,
      gameTime.time,
    );
    if (income.nextDay !== undefined && income.nextTime !== undefined) {
      const totalMins = 3 * 24 * 60;
      const elapsed = totalMins - (income.remainingMinutes ?? 0);
      const progress = calculateProgress(elapsed, totalMins);
      const msUntilIncome = !income.available
        ? calculateRealTimeUntil(
            baselineRealTime,
            baselineGameDay,
            baselineGameTime,
            income.nextDay,
            income.nextTime,
          )
        : 0;
      const incomeGameRemaining =
        !income.available && (income.remainingMinutes ?? 0) > 0
          ? (() => {
              const rem = income.remainingMinutes ?? 0;
              const days = Math.floor(rem / (24 * 60));
              const h = Math.floor((rem % (24 * 60)) / 60);
              const m = Math.floor(rem % 60);
              return days > 0 ? `${days}d ${h}h ${m}m` : `${h}h ${m}m`;
            })()
          : null;
      setIncomeTimer({
        available: income.available,
        remainingMinutes: income.remainingMinutes ?? 0,
        nextDay: income.nextDay,
        nextTime: income.nextTime,
        progress,
        realTimeRemaining: !income.available ? formatMs(msUntilIncome) : null,
        gameTimeRemaining: incomeGameRemaining,
      });
      if (!income.available) {
        scheduleIfNeeded(
          'income',
          Date.now() + msUntilIncome,
          'Pobranie Dochodu',
        );
      }
    }

    // Goldbar
    const goldbar = calculateGoldbarRemaining(lastGoldbarDay, gameTime.day);
    if (goldbar.nextDay !== undefined) {
      const totalDays = 7;
      const elapsed = totalDays - goldbar.remainingDays;
      const progress = calculateProgress(elapsed, totalDays);
      const msUntilGoldbar = !goldbar.available
        ? calculateRealTimeUntil(
            baselineRealTime,
            baselineGameDay,
            baselineGameTime,
            goldbar.nextDay,
            '00:00',
          )
        : 0;
      setGoldbarTimer({
        available: goldbar.available,
        remainingDays: goldbar.remainingDays,
        nextDay: goldbar.nextDay,
        progress,
        realTimeRemaining: !goldbar.available ? formatMs(msUntilGoldbar) : null,
      });
      if (!goldbar.available) {
        scheduleIfNeeded(
          'goldbar',
          Date.now() + msUntilGoldbar,
          'Goldbar — Lioncrest Manor',
        );
      }
    }

    // Missions
    const newMissionTimers: MissionTimer[] = missions.map((mission) => {
      const missionTime = calculateMissionRemaining(
        mission,
        gameTime.day,
        gameTime.time,
      );
      const totalMins = mission.durationHours * 60;
      const elapsed = totalMins - missionTime.remainingMinutes;
      const progress = calculateProgress(elapsed, totalMins);
      const msUntilMission = !missionTime.available
        ? calculateRealTimeUntil(
            baselineRealTime,
            baselineGameDay,
            baselineGameTime,
            missionTime.endDay,
            missionTime.endTime,
          )
        : 0;
      if (!missionTime.available) {
        scheduleIfNeeded(
          `mission-${mission.id}`,
          Date.now() + msUntilMission,
          mission.type,
        );
      }
      const gameRemaining =
        !missionTime.available && missionTime.remainingMinutes > 0
          ? (() => {
              const h = Math.floor(missionTime.remainingMinutes / 60);
              const m = Math.floor(missionTime.remainingMinutes % 60);
              return `${h}h ${m}m`;
            })()
          : null;
      return {
        id: mission.id,
        type: mission.type,
        endDay: missionTime.endDay,
        endTime: missionTime.endTime,
        available: missionTime.available,
        progress,
        realTimeRemaining: !missionTime.available
          ? formatMs(msUntilMission)
          : null,
        gameTimeRemaining: gameRemaining,
      };
    });
    setMissionTimers(newMissionTimers);
  }, [
    sessionStartTime,
    baselineRealTime,
    baselineGameDay,
    baselineGameTime,
    lastSpeedup,
    lastIncome,
    lastGoldbarDay,
    missions,
    scheduleIfNeeded,
    setLiveGameTime,
  ]);

  // Only tick while app is active; notifications fire independently in background
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      appStateRef.current = next;
      if (next === 'active') {
        // Returning to foreground: clear scheduled set so notifications
        // are re-evaluated and rescheduled with fresh timestamps
        notifScheduledRef.current.clear();
        tick();
      }
    });
    return () => sub.remove();
  }, [tick]);

  useEffect(() => {
    if (!sessionStartTime || !baselineRealTime) return;
    notifScheduledRef.current.clear();
    tick();
    const interval = setInterval(() => {
      if (appStateRef.current === 'active') tick();
    }, TIMER_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [sessionStartTime, baselineRealTime, tick]);

  const handleConfirmSpeedup = () => {
    cancelTimerNotification('speedup');
    notifScheduledRef.current.delete('speedup');
    confirmSpeedup();
  };
  const handleResetSpeedup = () => {
    cancelTimerNotification('speedup');
    notifScheduledRef.current.delete('speedup');
    resetSpeedup();
  };
  const handleConfirmIncome = () => {
    cancelTimerNotification('income');
    notifScheduledRef.current.delete('income');
    confirmIncome();
  };
  const handleConfirmGoldbar = () => {
    cancelTimerNotification('goldbar');
    notifScheduledRef.current.delete('goldbar');
    confirmGoldbar();
  };
  const handleConfirmMission = (missionId: number) => {
    cancelTimerNotification(`mission-${missionId}`);
    notifScheduledRef.current.delete(`mission-${missionId}`);
    removeMission(missionId);
  };

  return {
    currentGameTime: currentTime
      ? formatGameDateTime(currentTime.day, currentTime.time)
      : null,
    speedupTimer,
    incomeTimer,
    goldbarTimer,
    missionTimers,
    handleConfirmSpeedup,
    handleResetSpeedup,
    handleConfirmIncome,
    handleConfirmGoldbar,
    handleConfirmMission,
  };
};

export default useGameTimer;
