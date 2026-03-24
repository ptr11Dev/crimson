# ⚔️ Crimson Desert — Timer Tracker

Aplikacja mobilna (iOS) do śledzenia timerów w grze Crimson Desert.
Zbudowana w **React Native + Expo SDK 55** (TypeScript).

---

## Wymagania

| Narzędzie           | Minimalna wersja                        |
| ------------------- | --------------------------------------- |
| Node.js             | 20.x                                    |
| npm                 | 10.x                                    |
| Expo CLI            | instaluje się automatycznie przez `npx` |
| iPhone              | iOS 16+                                 |
| Expo Go (App Store) | aktualna wersja                         |

---

## Opcja 1 — Expo Go (szybki start, bez konta Apple)

Expo Go to darmowa aplikacja z App Store, która pozwala uruchomić projekt bezpośrednio na telefonie bez żadnego buildu ani konta deweloperskiego. **To zalecany tryb do codziennego użytku.**

### Kroki

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom serwer deweloperski:

   ```bash
   npm start
   ```

   Lub z wymuszonym trybem LAN (jeśli QR nie działa przez localhost):

   ```bash
   npx expo start --lan
   ```

3. W terminalu pojawi się QR kod oraz adres w stylu `exp://192.168.x.x:8081`.

4. Na iPhonie otwórz aplikację **Expo Go** i zeskanuj QR aparatem (lub wklej adres ręcznie w zakładce _Enter URL manually_).

5. Przy pierwszym uruchomieniu iOS zapyta o zgodę na powiadomienia — **zatwierdź**, inaczej przypomnienia 5 minut przed końcem timerów nie zadziałają.

### Ograniczenia Expo Go

- Powiadomienia lokalne (`expo-notifications`) **działają** w Expo Go.
- Powiadomienia przy **zabitej aplikacji** (swipe up) działają tylko w Development Build lub Production Build — **nie** w Expo Go.
- Expo Go nie obsługuje niektórych natywnych pluginów, które mogą zostać dodane w przyszłości.

---

## Opcja 2 — Development Build (pełne możliwości natywne)

Development Build to własny binary aplikacji zainstalowany na Twoim telefonie — działa jak prawdziwa appka, ale z devtools Expo. Wymaga **Apple Developer Account** ($99/rok) lub lokalnego buildu przez Xcode (bez konta, tylko do własnego urządzenia).

### Wariant A — lokalny build przez Xcode (bez płatnego konta)

Wymaga macOS z zainstalowanym Xcode (bezpłatny z App Store).

1. Zainstaluj `expo-dev-client`:

   ```bash
   npx expo install expo-dev-client
   ```

2. Wygeneruj natywny projekt iOS:

   ```bash
   npx expo prebuild --platform ios
   ```

3. Otwórz projekt w Xcode:

   ```bash
   open ios/crimson-desert.xcworkspace
   ```

4. W Xcode:
   - Podłącz iPhone kablem USB
   - Wybierz swoje urządzenie jako target (nie symulator)
   - W zakładce _Signing & Capabilities_ wybierz swój Apple ID jako Team (Personal Team — bezpłatny)
   - Kliknij ▶ **Run**

5. Po zainstalowaniu na telefonie uruchom serwer deweloperski:

   ```bash
   npx expo start --dev-client
   ```

6. Na telefonie otwórz zainstalowaną aplikację _Crimson Desert_ — połączy się automatycznie z serwerem.

> **Uwaga:** Aplikacje podpisane bezpłatnym Personal Team wygasają po **7 dniach** i trzeba je ponownie wgrać przez Xcode.

### Wariant B — EAS Build (wymaga Apple Developer Account $99/rok)

EAS (Expo Application Services) buduje appkę w chmurze Expo.

1. Zainstaluj EAS CLI:

   ```bash
   npm install -g eas-cli
   ```

2. Zaloguj się do konta Expo:

   ```bash
   eas login
   ```

3. Skonfiguruj projekt (jednorazowo):

   ```bash
   eas build:configure
   ```

4. Uruchom build dla iOS:

   ```bash
   eas build --platform ios --profile development
   ```

5. Po zakończeniu buildu zainstaluj `.ipa` na urządzeniu przez link z EAS lub przez Xcode → Devices.

6. Uruchom serwer:

   ```bash
   npx expo start --dev-client
   ```

---

## Skrypty npm

| Komenda           | Opis                                                    |
| ----------------- | ------------------------------------------------------- |
| `npm start`       | Uruchamia serwer Expo (Expo Go)                         |
| `npm run ios`     | Uruchamia serwer + otwiera symulator iOS (wymaga Xcode) |
| `npm run android` | Uruchamia serwer + otwiera emulator Android             |

---

## Struktura projektu

```
src/
  App.tsx                    # root: permissions + routing
  components/
    GameStart.tsx            # ekran startowy / formularz sesji
    TimerDashboard.tsx       # główny dashboard z timerami
    Timer.tsx                # karta timera (reużywalna)
    MissionManager.tsx       # dodawanie misji pracowników
    SessionControls.tsx      # przycisk zakończenia sesji
    EndSessionModal.tsx      # modal potwierdzenia
  hooks/
    useGameTimer.ts          # główna logika timerów (interval + AppState)
  services/
    notificationService.ts   # planowanie lokalnych powiadomień iOS
  store/
    gameStore.ts             # stan aplikacji (Zustand + AsyncStorage)
  utils/
    timeCalculator.ts        # obliczenia czasu gry <-> czasu rzeczywistego
  constants.ts               # stałe (REAL_TO_GAME_RATIO = 5 min/h)
```

---

## Jak działają powiadomienia

- Przy starcie sesji każdy aktywny timer planuje powiadomienie **5 minut przed końcem** przez `expo-notifications`.
- Powiadomienia są zaplanowane jako `DATE` trigger — iOS odpala je niezależnie od stanu aplikacji (foreground, background, lock screen).
- W Expo Go: działają dla foreground i background. Przy zabitej aplikacji — wymagany Development Build.
- Po powrocie do aplikacji (`AppState → active`) wszystkie powiadomienia są przeliczane i planowane od nowa ze świeżymi timestampami.
- Zakończenie sesji (`endSession`) anuluje wszystkie zaplanowane powiadomienia.
