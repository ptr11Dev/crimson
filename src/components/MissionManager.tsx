import { useState } from 'react';
import useGameStore from '../store/gameStore';
import missionTypes from '../utils/missionTypes';

function MissionManager() {
  const { addMission } = useGameStore();
  const [selected, setSelected] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const mission = missionTypes.find((m) => m.id === parseInt(selected));
    if (mission) {
      addMission(mission.name, mission.hours);
      setSelected('');
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <option value="">Wybierz typ misji…</option>
        {missionTypes.map((m) => (
          <option key={m.id} value={m.id} className="bg-slate-900">
            {m.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!selected}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-black font-bold rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        + Dodaj
      </button>
    </form>
  );
}

export default MissionManager;
