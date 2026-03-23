import { useState, useEffect, useRef, useCallback } from 'react';
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
import notificationSound from '../assets/sounds/notification.mp3';

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
}

interface UseGameTimerReturn {
  currentGameTime: string | null;
  speedupTimer: SpeedupTimer | null;
  incomeTimer: IncomeTimer | null;
  goldbarTimer: GoldbarTimer | null;
  missionTimers: MissionTimer[];
  handleConfirmSpeedup: () => void;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedSoundsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.5;
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        /* browser autoplay policy */
      });
    }
  }, []);

  const tick = useCallback(() => {
    if (!sessionStartTime || !baselineRealTime) return;

    const gameTime = calculateCurrentGameTime(
      baselineRealTime,
      baselineGameDay,
      baselineGameTime,
    );
    setCurrentTime(gameTime);
    setLiveGameTime(gameTime.day, gameTime.time);

    // ── Speedup ────────────────────────────────────────────────────────
    const speedup = calculateSpeedupRemaining(
      lastSpeedup,
      gameTime.day,
      gameTime.time,
    );
    if (speedup.nextDay !== undefined && speedup.nextTime !== undefined) {
      const totalMins = 10 * 60;
      const elapsed = totalMins - speedup.remainingMinutes;
      const progress = calculateProgress(elapsed, totalMins);
      const rtRemaining = !speedup.available
        ? formatMs(
            calculateRealTimeUntil(
              baselineRealTime,
              baselineGameDay,
              baselineGameTime,
              speedup.nextDay,
              speedup.nextTime,
            ),
          )
        : null;
      setSpeedupTimer({
        available: speedup.available,
        remainingMinutes: speedup.remainingMinutes,
        nextDay: speedup.nextDay,
        nextTime: speedup.nextTime,
        progress,
        realTimeRemaining: rtRemaining,
      });
      if (speedup.available && !playedSoundsRef.current.has('speedup')) {
        playSound();
        playedSoundsRef.current.add('speedup');
      }
    }

    // ── Income ──────────────────────────────────────────────────────────
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
      const rtRemaining = !income.available
        ? formatMs(
            calculateRealTimeUntil(
              baselineRealTime,
              baselineGameDay,
              baselineGameTime,
              income.nextDay,
              income.nextTime,
            ),
          )
        : null;
      setIncomeTimer({
        available: income.available,
        remainingMinutes: income.remainingMinutes ?? 0,
        nextDay: income.nextDay,
        nextTime: income.nextTime,
        progress,
        realTimeRemaining: rtRemaining,
      });
      if (income.available && !playedSoundsRef.current.has('income')) {
        playSound();
        playedSoundsRef.current.add('income');
      }
    }

    // ── Goldbar ─────────────────────────────────────────────────────────
    const goldbar = calculateGoldbarRemaining(lastGoldbarDay, gameTime.day);
    if (goldbar.nextDay !== undefined) {
      const totalDays = 7;
      const elapsed = totalDays - goldbar.remainingDays;
      const progress = calculateProgress(elapsed, totalDays);
      const rtRemaining = !goldbar.available
        ? formatMs(
            calculateRealTimeUntil(
              baselineRealTime,
              baselineGameDay,
              baselineGameTime,
              goldbar.nextDay,
              '00:00',
            ),
          )
        : null;
      setGoldbarTimer({
        available: goldbar.available,
        remainingDays: goldbar.remainingDays,
        nextDay: goldbar.nextDay,
        progress,
        realTimeRemaining: rtRemaining,
      });
      if (goldbar.available && !playedSoundsRef.current.has('goldbar')) {
        playSound();
        playedSoundsRef.current.add('goldbar');
      }
    }

    // ── Missions ─────────────────────────────────────────────────────────
    const newMissionTimers: MissionTimer[] = missions.map((mission) => {
      const missionTime = calculateMissionRemaining(
        mission,
        gameTime.day,
        gameTime.time,
      );
      const totalMins = mission.durationHours * 60;
      const elapsed = totalMins - missionTime.remainingMinutes;
      const progress = calculateProgress(elapsed, totalMins);
      const rtRemaining = !missionTime.available
        ? formatMs(
            calculateRealTimeUntil(
              baselineRealTime,
              baselineGameDay,
              baselineGameTime,
              missionTime.endDay,
              missionTime.endTime,
            ),
          )
        : null;
      if (
        missionTime.available &&
        !playedSoundsRef.current.has(`mission-${mission.id}`)
      ) {
        playSound();
        playedSoundsRef.current.add(`mission-${mission.id}`);
      }
      return {
        id: mission.id,
        type: mission.type,
        endDay: missionTime.endDay,
        endTime: missionTime.endTime,
        available: missionTime.available,
        progress,
        realTimeRemaining: rtRemaining,
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
    playSound,
    setLiveGameTime,
  ]);

  useEffect(() => {
    if (!sessionStartTime || !baselineRealTime) return;
    tick();
    const interval = setInterval(tick, TIMER_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [sessionStartTime, baselineRealTime, tick]);

  const handleConfirmSpeedup = () => {
    confirmSpeedup();
    playedSoundsRef.current.delete('speedup');
  };
  const handleConfirmIncome = () => {
    confirmIncome();
    playedSoundsRef.current.delete('income');
  };
  const handleConfirmGoldbar = () => {
    confirmGoldbar();
    playedSoundsRef.current.delete('goldbar');
  };
  const handleConfirmMission = (missionId: number) => {
    removeMission(missionId);
    playedSoundsRef.current.delete(`mission-${missionId}`);
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
    handleConfirmIncome,
    handleConfirmGoldbar,
    handleConfirmMission,
  };
};

export default useGameTimer;
