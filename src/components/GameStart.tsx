import { useState, useEffect } from 'react';
import useGameStore, { Mission } from '../store/gameStore';
import { REAL_TO_GAME_RATIO } from '../constants';

function GameStart() {
  const { sessionStartTime, startSession, savedSessionData, lastGoldbarDay } =
    useGameStore();

  const [gameDay, setGameDay] = useState<string>('1');
  const [gameHour, setGameHour] = useState<string>('0');
  const [gameMinute, setGameMinute] = useState<string>('0');
  const [nextSpeedupHours, setNextSpeedupHours] = useState<string>('10');
  const [nextIncomeDays, setNextIncomeDays] = useState<string>('');
  const [nextIncomeHours, setNextIncomeHours] = useState<string>('');
  const [goldbarDay, setGoldbarDay] = useState<string>('');

  // Auto-fill from persisted data on mount
  useEffect(() => {
    if (savedSessionData?.lastGameDay != null) {
      setGameDay(String(savedSessionData.lastGameDay));
    }
    if (savedSessionData?.lastGameTime != null) {
      const [h, m] = savedSessionData.lastGameTime.split(':');
      setGameHour(h);
      setGameMinute(m);
    }
    if (savedSessionData?.nextIncomeDays != null) {
      setNextIncomeDays(String(savedSessionData.nextIncomeDays));
    }
    if (savedSessionData?.nextIncomeHours != null) {
      setNextIncomeHours(String(savedSessionData.nextIncomeHours));
    }
    if (savedSessionData?.nextSpeedupHours != null) {
      setNextSpeedupHours(
        String(Math.round(savedSessionData.nextSpeedupHours)),
      );
    }
    if (lastGoldbarDay != null) {
      setGoldbarDay(String(lastGoldbarDay));
    }
  }, [savedSessionData, lastGoldbarDay]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(gameDay) || 1;
    const hour = parseInt(gameHour) || 0;
    const minute = parseInt(gameMinute) || 0;
    const speedupH = parseFloat(nextSpeedupHours) || 10;
    const incDays = nextIncomeDays.trim() ? parseInt(nextIncomeDays) : null;
    const incHours = nextIncomeHours.trim() ? parseInt(nextIncomeHours) : null;
    const gbDay = goldbarDay.trim() ? parseInt(goldbarDay) : null;

    const time = `${String(Math.min(23, Math.max(0, hour))).padStart(2, '0')}:${String(Math.min(59, Math.max(0, minute))).padStart(2, '0')}`;

    // Restore missions from saved session.
    // We keep the original durationHours and back-calculate startTime so that
    // elapsed = durationHours - remainingHours → progress bar shows correct %.
    const currentTotalMins =
      (day - 1) * 24 * 60 + Math.min(23, hour) * 60 + Math.min(59, minute);

    const existingMissions: Mission[] = (
      savedSessionData?.remainingMissions ?? []
    )
      .filter((m) => m.remainingHours > 0)
      .map((m, idx) => {
        const elapsedMins = (m.durationHours - m.remainingHours) * 60;
        const startTotalMins = currentTotalMins - elapsedMins;
        const startDay = Math.max(
          1,
          Math.floor(startTotalMins / (24 * 60)) + 1,
        );
        const startTod = ((startTotalMins % (24 * 60)) + 24 * 60) % (24 * 60);
        const startHour = Math.floor(startTod / 60);
        const startMin = startTod % 60;
        const missionStartTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
        return {
          id: Date.now() + idx,
          type: m.type,
          durationHours: m.durationHours,
          startDay,
          startTime: missionStartTime,
          startRealTime: Date.now(),
        };
      });

    startSession(
      day,
      time,
      speedupH,
      incDays,
      incHours,
      gbDay,
      existingMissions,
    );
  };

  if (sessionStartTime) return null;

  const hasSavedMissions =
    (savedSessionData?.remainingMissions ?? []).filter(
      (m) => m.remainingHours > 0,
    ).length > 0;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 tracking-tight">
            ⚔️ Crimson Desert
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Timer Tracker — Nowa sesja
          </p>
        </div>

        <form
          onSubmit={handleStart}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-6"
        >
          {/* Current game time */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Bieżący czas w grze
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Dzień</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={gameDay}
                  onChange={(e) => setGameDay(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Godzina</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  required
                  value={gameHour}
                  onChange={(e) => setGameHour(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Minuta</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  required
                  value={gameMinute}
                  onChange={(e) => setGameMinute(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* Speedup */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Przyspieszenie czasu
            </h2>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                Ile godzin (in-game) do następnego?
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={nextSpeedupHours}
                onChange={(e) => setNextSpeedupHours(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-slate-600">
                Domyślnie 10h (cykl resetuje się po wykonaniu)
              </p>
            </div>
          </section>

          {/* Income */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Następny dochód
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Za ile dni?</label>
                <input
                  type="number"
                  min="0"
                  value={nextIncomeDays}
                  onChange={(e) => setNextIncomeDays(e.target.value)}
                  placeholder="0"
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Za ile godzin?</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={nextIncomeHours}
                  onChange={(e) => setNextIncomeHours(e.target.value)}
                  placeholder="0"
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Pozostały czas do pobrania dochodu (in-game)
            </p>
          </section>

          {/* Goldbar */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Goldbar — Lioncrest Manor
            </h2>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                Dzień ostatniej kradzieży
              </label>
              <input
                type="number"
                min="1"
                value={goldbarDay}
                onChange={(e) => setGoldbarDay(e.target.value)}
                placeholder="Opcjonalne"
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-600"
              />
              <p className="text-xs text-slate-600">
                Zostaw puste jeśli nie pamiętasz
              </p>
            </div>
          </section>

          {/* Saved missions notice */}
          {hasSavedMissions && (
            <div className="bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-3 text-xs text-emerald-400">
              ✓{' '}
              {
                savedSessionData!.remainingMissions.filter(
                  (m) => m.remainingHours > 0,
                ).length
              }{' '}
              misja(-e) z poprzedniej sesji zostanie przywrócona.
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-black font-bold rounded-xl py-3 text-base transition-all duration-200 cursor-pointer"
          >
            🎮 Start Grania
          </button>
        </form>

        {/* Info */}
        <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-2">
            Legenda
          </p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>
              ⚡ Przyspieszenie czasu — co{' '}
              <span className="text-slate-400">10h</span> in-game
            </li>
            <li>
              💰 Dochód — co <span className="text-slate-400">3 dni</span>{' '}
              in-game
            </li>
            <li>
              🏰 Goldbar — co <span className="text-slate-400">7 dni</span>{' '}
              in-game
            </li>
            <li>
              ⏱ {REAL_TO_GAME_RATIO} min real ={' '}
              <span className="text-slate-400">1h</span> in-game
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GameStart;
