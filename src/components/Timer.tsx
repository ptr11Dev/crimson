import { formatGameDateTime } from '../utils/timeCalculator';

interface TimerProps {
  title: string;
  icon: string;
  targetDay: number;
  targetTime: string;
  currentProgress: number; // 0–100
  isReady: boolean;
  onConfirm: () => void;
  realTimeRemaining?: string | null;
}

function getProgressGradient(pct: number): string {
  if (pct >= 100) return 'linear-gradient(to right, #16a34a, #22c55e)';
  if (pct >= 50) {
    // yellow → green
    const t = (pct - 50) / 50;
    const r = Math.round(234 - t * (234 - 34));
    const g = Math.round(179 + t * (197 - 179));
    const b = Math.round(8 + t * (94 - 8));
    return `linear-gradient(to right, #ef4444, #eab308, rgb(${r},${g},${b}))`;
  }
  // red → yellow
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
  realTimeRemaining,
}: TimerProps) {
  const pct = Math.min(100, Math.max(0, currentProgress));

  return (
    <div
      className={`
        relative flex flex-col gap-3 rounded-xl border p-4
        bg-slate-900 transition-all duration-300
        ${
          isReady
            ? 'border-emerald-500 ready-glow'
            : 'border-slate-700 hover:border-slate-500'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-slate-200 text-sm">{title}</span>
        </div>
        {isReady && (
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-black uppercase tracking-wide">
            GOTOWE
          </span>
        )}
      </div>

      {/* Target time */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
          Dostępne
        </p>
        <p
          className={`font-mono font-bold text-base ${isReady ? 'text-emerald-400' : 'text-slate-200'}`}
        >
          {formatGameDateTime(targetDay, targetTime)}
        </p>
      </div>

      {/* Real-time countdown */}
      {!isReady && realTimeRemaining && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
            Pozostało (real)
          </p>
          <p className="font-mono text-amber-400 text-sm">
            {realTimeRemaining}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Postęp</span>
          <span className="text-xs font-mono text-slate-400">
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="progress-bar-fill"
            style={{
              width: `${pct}%`,
              background: getProgressGradient(pct),
            }}
          />
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={!isReady}
        className={`
          w-full rounded-lg py-2 text-sm font-bold transition-all duration-200
          ${
            isReady
              ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }
        `}
      >
        ✓ Wykonano
      </button>
    </div>
  );
}

export default Timer;
