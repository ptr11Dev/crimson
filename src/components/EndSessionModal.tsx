import useGameStore from '../store/gameStore';

interface Props {
  onClose: () => void;
}

function EndSessionModal({ onClose }: Props) {
  const { endSession } = useGameStore();

  const handleConfirm = () => {
    endSession();
    onClose();
    // Zustand reaktywnie przełącza widok przez sessionStartTime = null
    // Nie ma potrzeby przeładowania strony
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-2">
          Zakończyć sesję?
        </h2>
        <p className="text-slate-400 text-sm mb-1">
          Stan timerów zostanie zapisany i wczytany przy następnym starcie.
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Goldbar i czasy dochodów / misji są zachowane w localStorage.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-2.5 text-sm font-semibold transition-colors cursor-pointer"
          >
            Anuluj
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-2.5 text-sm font-bold transition-colors cursor-pointer"
          >
            Tak, zakończ
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndSessionModal;
