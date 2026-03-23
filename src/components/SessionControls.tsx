import { useState } from 'react';
import EndSessionModal from './EndSessionModal';

function SessionControls() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-red-900/40 hover:bg-red-800/60 border border-red-800 text-red-400 hover:text-red-300 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer"
      >
        🚪 Zakończ sesję
      </button>
      {showModal && <EndSessionModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default SessionControls;
