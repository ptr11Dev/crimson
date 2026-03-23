# Plan: React + Vite Game Timer Tracker

Aplikacja śledząca timery w grze z synchronizacją czasu realnego i czasu w grze (5 min realu = 1h gry). Użytkownik śledzi 4 typy akcji: przyspieszenie czasu (co 10h gry), wielokrotne misje pracowników (1h-48h), dochód (co 3 dni gry), oraz goldbar z Lioncrest Manor (co 7 dni gry). Każdy timer wyświetla countdown "Dzień X, HH:MM", gradient progress bar (czerwony→żółty→zielony), odświeża się co zadany czas i odtwarza dźwięk po zakończeniu. Funkcja "Zakończ sesję" z modalem potwierdzenia zapisuje stan do localStorage.

## Steps

1. **Zainicjalizuj projekt z zależnościami** — Uruchom `npm create vite@latest . -- --template react`, zainstaluj Zustand (`npm i zustand`), przygotuj strukturę: src/{components/, store/, utils/, hooks/, assets/sounds/}, dodaj plik dźwiękowy notification.mp3

2. **Stwórz Zustand store z persistence** — W [src/store/gameStore.js](src/store/gameStore.js) zdefiniuj state: sessionStartTime (null=nieaktywna sesja), currentGameDay, currentGameTime, lastSpeedup, lastIncome, lastGoldbarDay, missions array; użyj `persist` middleware do zapisywania lastGoldbarDay, savedSessionData (czasy pozostałe do akcji, aktywne misje); dodaj akcje: startSession, endSession, confirmAction, addMission, removeMission

3. **Zaimplementuj kalkulator i typy misji** — W [src/utils/timeCalculator.js](src/utils/timeCalculator.js) dodaj: konwersję 5min→1h gry, obliczanie aktualnego czasu "Dzień X, HH:MM", liczenie pozostałego czasu akcji, formatowanie czasu, obliczanie procentu postępu (0-100%); w [src/utils/missionTypes.js](src/utils/missionTypes.js) zdefiniuj tablicę opcji misji: 1h, 2h, 3h, 4h, i tak do 48h

4. **Stwórz formularz inicjalizacji sesji z autofill** — W [src/components/GameStart.jsx](src/components/GameStart.jsx) dodaj: button "Start Grania", inputy dla dnia/godziny:minuty w grze, inputy dla dni ostatniego dochodu/goldbara (wartości domyślne z localStorage savedSessionData), opcjonalne inputy dla aktywnych misji, przycisk wywołujący `startSession()` w store

5. **Zbuduj komponenty timerów w grid layout** — Stwórz [src/components/Timer.jsx](src/components/Timer.jsx) z: nazwą akcji, countdown "Dzień X, HH:MM", gradient progress bar (czerwony 0%→żółty 50%→zielony 100%), button "Wykonano", pulsującym zielonym tłem gdy progress=100%; [src/components/TimerDashboard.jsx](src/components/TimerDashboard.jsx) w CSS Grid 2 kolumny (desktop) / 1 kolumna (mobile), sekcje: Akcje Cykliczne + Misje

6. **Implementuj auto-refresh i notyfikacje audio** — W [src/hooks/useGameTimer.js](src/hooks/useGameTimer.js) dodaj setInterval co zadany czas aktualizujący wszystkie timery w store, sprawdzający progress=100%, odtwarzający dźwięk z [src/assets/sounds/notification.mp3](src/assets/sounds/notification.mp3), ustawiający stan "ready" dla timera

7. **Dodaj zarządzanie wieloma misjami** — W [src/components/MissionManager.jsx](src/components/MissionManager.jsx) dodaj: dropdown wyboru typu misji z [src/utils/missionTypes.js](src/utils/missionTypes.js), button "Dodaj misję" wywołujący `addMission()` w store z currentGameTime jako startTime, każda misja renderowana jako `Timer` z button "Wykonano" wywołującym `removeMission()`

8. **Implementuj potwierdzanie akcji z modalem zakończenia** — Button "Wykonano" w [src/components/Timer.jsx](src/components/Timer.jsx) wywołuje `confirmAction()` aktualizujący lastSpeedup/lastIncome/lastGoldbarDay; w [src/components/SessionControls.jsx](src/components/SessionControls.jsx) button "Zakończ sesję" otwierający [src/components/EndSessionModal.jsx](src/components/EndSessionModal.jsx) z potwierdzeniem "Czy na pewno?", który wywołuje `endSession()` zapisujący stan do localStorage i czyszczący sessionStartTime

9. **Dodaj stylizację z gradientowym progress barem** — W [src/styles/index.css](src/styles/index.css) lub Tailwind: grid layout (grid-cols-2 lg, grid-cols-1 sm), gradient progress bar używający `linear-gradient` z kalkulacją koloru na podstawie procentu (0%=#ef4444, 50%=#eab308, 100%=#22c55e), keyframe animation `pulse` dla gotowych timerów (background-color green z opacity 0.7→1), smooth transitions

## Gotowe do implementacji

Plan jest kompletny i uwzględnia wszystkie wymagania. Możesz teraz przystąpić do implementacji aplikacji zgodnie z powyższymi krokami.
