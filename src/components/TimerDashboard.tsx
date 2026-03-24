import { useState } from 'react';
import useGameTimer from '../hooks/useGameTimer';
import useGameStore from '../store/gameStore';
import Timer from './Timer';
import SessionControls from './SessionControls';
import MissionManager from './MissionManager';

function TimerDashboard() {
  const {
    currentGameTime,
    speedupTimer,
    incomeTimer,
    goldbarTimer,
    missionTimers,
    handleConfirmSpeedup,
    handleResetSpeedup,
    handleConfirmIncome,
    handleConfirmGoldbar,
    handleConfirmMission,
  } = useGameTimer();

  const { updateCurrentGameTime } = useGameStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editDay, setEditDay] = useState('');
  const [editHour, setEditHour] = useState('');
  const [editMinute, setEditMinute] = useState('');

  const handleEditClick = () => {
    if (!currentGameTime) return;
    // currentGameTime = "Dzień X, HH:MM"
    const match = currentGameTime.match(/Dzień (\d+), (\d{2}):(\d{2})/);
    if (match) {
      setEditDay(match[1]);
      setEditHour(match[2]);
      setEditMinute(match[3]);
    }
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    const day = parseInt(editDay);
    const hour = parseInt(editHour);
    const minute = parseInt(editMinute);
    if (isNaN(day) || isNaN(hour) || isNaN(minute)) return;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || day < 1) return;
    updateCurrentGameTime(
      day,
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    );
    setIsEditing(false);
  };

  if (!currentGameTime) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">
              ⚔️ Crimson Desert
            </h1>
            <p className="text-slate-500 text-sm">Timer Tracker</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Current game time */}
            {!isEditing ? (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  Czas gry
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {currentGameTime}
                </span>
                <button
                  onClick={handleEditClick}
                  className="text-slate-400 hover:text-emerald-400 transition-colors text-xs ml-1"
                  title="Koryguj czas gry"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800 border border-emerald-600 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500">Dzień</span>
                <input
                  type="number"
                  min="1"
                  value={editDay}
                  onChange={(e) => setEditDay(e.target.value)}
                  className="w-14 bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500">HH</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={editHour}
                  onChange={(e) => setEditHour(e.target.value)}
                  className="w-12 bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-600">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editMinute}
                  onChange={(e) => setEditMinute(e.target.value)}
                  className="w-12 bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveTime}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black rounded px-2 py-1 text-xs font-bold transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            <SessionControls />
          </div>
        </div>

        {/* Cyclic actions */}
        <section className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Akcje Cykliczne
            <span className="flex-1 h-px bg-slate-700" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {speedupTimer && (
              <Timer
                icon="⚡"
                title="Przyspieszenie Czasu"
                targetDay={speedupTimer.nextDay}
                targetTime={speedupTimer.nextTime}
                currentProgress={speedupTimer.progress}
                isReady={speedupTimer.available}
                onConfirm={handleConfirmSpeedup}
                onReset={handleResetSpeedup}
                realTimeRemaining={speedupTimer.realTimeRemaining}
              />
            )}
            {incomeTimer && (
              <Timer
                icon="💰"
                title="Pobranie Dochodu"
                targetDay={incomeTimer.nextDay}
                targetTime={incomeTimer.nextTime}
                currentProgress={incomeTimer.progress}
                isReady={incomeTimer.available}
                onConfirm={handleConfirmIncome}
                realTimeRemaining={incomeTimer.realTimeRemaining}
              />
            )}
            {goldbarTimer && (
              <Timer
                icon="🏰"
                title="Goldbar — Lioncrest Manor"
                targetDay={goldbarTimer.nextDay}
                targetTime="00:00"
                currentProgress={goldbarTimer.progress}
                isReady={goldbarTimer.available}
                onConfirm={handleConfirmGoldbar}
                realTimeRemaining={goldbarTimer.realTimeRemaining}
              />
            )}
          </div>
        </section>

        {/* Missions */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Misje Pracowników
            <span className="flex-1 h-px bg-slate-700" />
          </h2>
          <MissionManager />
          {missionTimers.length === 0 ? (
            <p className="text-slate-600 text-sm italic text-center py-8">
              Brak aktywnych misji
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-3">
              {missionTimers.map((mission) => (
                <Timer
                  key={mission.id}
                  icon="📋"
                  title={mission.type}
                  targetDay={mission.endDay}
                  targetTime={mission.endTime}
                  currentProgress={mission.progress}
                  isReady={mission.available}
                  onConfirm={() => handleConfirmMission(mission.id)}
                  onDelete={() => handleConfirmMission(mission.id)}
                  realTimeRemaining={mission.realTimeRemaining}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default TimerDashboard;
