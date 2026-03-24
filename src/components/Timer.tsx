import { formatGameDateTime } from '../utils/timeCalculator';

interface TimerProps {
  title: string;
  icon: string;
  targetDay: number;
  targetTime: string;
  currentProgress: number;
  isReady: boolean;
  onConfirm: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  realTimeRemaining?: string | null;
  gameTimeRemaining?: string | null;
}

function getProgressGradient(pct: number): string {
  if (pct >= 100) return 'linear-gradient(to right, #16a34a, #22c55e)';
  if (pct >= 50) {
    const t = (pct - 50) / 50;
    const r = Math.round(234 - t * (234 - 34));
    const g = Math.round(179 + t * (197 - 179));
    const b = Math.round(8 + t * (94 - 8));
    return `linear-gradient(to right, #ef4444, #eab308, rgb(${r},${g},${b}))`;
  }
  const t = pct / 50;
  const r = Math.round(239 - t * (239 - 234));
  const g = Math.round(68 + t * (179 - 68));
  const b = Math.round(68 - t * (68 - 8));
  return `linear-gradient(to right, #ef4444, rgb(${r},${g},${b}))`;
}

function Timer({
  title,
  icon,
  targetDay,
  targetTime,
  currentProgress,
  isReady,
  onConfirm,
  onDelete,
  onReset,
  realTimeRemaining,
  gameTimeRemaining,
}: TimerProps) {
  const pct = Math.min(100, Math.max(0, currentProgress));

  return (
    <div
      className={`
        flex flex-col gap-1.5 rounded-lg border px-3 py-2.5
        bg-slate-900 transition-all duration-300
        ${
          isReady
            ? 'border-emerald-500 ready-glow'
            : 'border-slate-700 hover:border-slate-600'
        }
      `}
    >
      {/* Row 1: icon + title + ready badge + delete */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0">{icon}</span>
          <span className="text-xs font-semibold text-slate-300 truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isReady && (
            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wide">
              GOTOWE
            </span>
          )}
          {onReset && (
            <button
              onClick={onReset}
              title="Zrestartuj timer"
              className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer text-sm leading-none px-0.5"
            >
              ↺
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title="Usuń misję"
              className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer text-xs leading-none px-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Row 2: target time + countdowns */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`font-mono font-bold text-sm leading-none ${
            isReady ? 'text-emerald-400' : 'text-slate-200'
          }`}
        >
          {formatGameDateTime(targetDay, targetTime)}
        </span>
        {!isReady && (realTimeRemaining || gameTimeRemaining) && (
          <div className="flex flex-col items-end gap-0.5">
            {realTimeRemaining && (
              <span className="font-mono text-amber-400 text-[11px] leading-none shrink-0">
                ⏱ {realTimeRemaining}
              </span>
            )}
            {gameTimeRemaining && (
              <span className="font-mono text-sky-400 text-[11px] leading-none shrink-0">
                🎮 {gameTimeRemaining}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row 3: progress bar + % + button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="progress-bar-fill h-full"
            style={{ width: `${pct}%`, background: getProgressGradient(pct) }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-500 w-8 text-right shrink-0">
          {pct.toFixed(0)}%
        </span>
        <button
          onClick={onConfirm}
          disabled={!isReady}
          className={`
            shrink-0 rounded px-2 py-0.5 text-xs font-bold transition-all duration-200
            ${
              isReady
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          ✓
        </button>
      </div>
    </div>
  );
}

export default Timer;
