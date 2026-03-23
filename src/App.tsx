import GameStart from './components/GameStart';
import TimerDashboard from './components/TimerDashboard';
import useGameStore from './store/gameStore';

function App() {
  const { sessionStartTime } = useGameStore();

  return (
    <div className="app">
      {!sessionStartTime ? <GameStart /> : <TimerDashboard />}
    </div>
  );
}

export default App;
