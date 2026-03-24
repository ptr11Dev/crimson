import { useState } from 'react';
import useGameStore from '../store/gameStore';

function MissionManager() {
  const { addMission } = useGameStore();
  const [hours, setHours] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    addMission(`Misja ${h}h`, h);
    setHours('');
  };

  return (
    <form onSubmit={handleAdd} className="flex gap-2">
      <input
        type="number"
        min="1"
        max="48"
        step="1"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        placeholder="Czas misji (godziny in-game)"
        className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-600"
      />
      <button
        type="submit"
        disabled={!hours || parseFloat(hours) <= 0}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-black font-bold rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        + Dodaj
      </button>
    </form>
  );
}

export default MissionManager;
