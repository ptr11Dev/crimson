# ⚔️ Crimson Desert — Timer Tracker

Aplikacja mobilna (iOS) do śledzenia timerów w grze Crimson Desert.
Zbudowana w **React Native + Expo SDK 55** (TypeScript).

---

## Wymagania

| Narzędzie | Minimalna wersja |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Expo CLI | instaluje się automatycznie przez `npx` |
| iPhone | iOS 16+ |
| Expo Go (App Store) | aktualna wersja |

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

4. Na iPhonie otwórz aplikację **Expo Go**4. Na iPhonie otwórz aplikację **Exres r�4. Na iPhonie otwórz aplikację **Expo Go**4. Na iPhonie otwórz apie4. Na iPhonie otwórz aplikację **Expo Go**4. Na iPerdź**, in4. Na iPhonomn4. Na iPhonie otwórz aplikacimer�4. nie zad4. Na iPhonie o Ogr4. Na iPhonieo Go

- Powiadomienia lokalne (`expo-notifications`) **działają** w Expo Go.
- Powiadomienia przy **zabitej aplikacji** (swip- Powiadomienia przy **zabitej aplikacji** (swip- Poctio- Powiadomienia przy **zabitej aplikacji** (swip- Powiadomienia przy **zabitej aplikacji** (swip- Poctio- Powiadomienia przy **ości.

---

## Opcja 2 — Development Build (pełne możliwości na## OpcjaDevelopment Build to własny binary aplikacji zainstalowany na Twoim telefonie — działa jak prawdziwa appka, ale z devtools Expo. Wymaga **Apple Developer Account** ($99/rok) lub lokalnego buildu przez Xcode (bez konta, tylko do własnego urządzenia).

### Wariant A — lokalny build przez Xcode (bez płatnego konta)

WymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWpacWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymW swojeWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymWymW

   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b    Ap   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b   ```b buduje appkę w chmurze Expo.

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

| Komenda | Opis |
|---|---|
| `npm start` | Uruchamia serwer Expo (Expo Go) |
| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`| `npm run ios`a)
| `npm run ios`| `npmx       # doda| `npm run ios`| `npmx  
    SessionControls.tsx      # przycisk z  ończenia    Se
    EndSession    EndSession    EndSession    Enda
                                      # gł�                        ter       ppSt                                      # gł�  # pl nowanie                                      # gł�                        ter       ppSt                    rage                 meC      tor.t                            gry     czasu rz              constants.ts               # stałe (REAL_TO_GAME_RATIO = 5 min/h)
```

---

## Jak działają powiadomienia

- Przy starcie sesji każdy aktywny timer planuje powiadomienie **5 minut przed końcem** przez `expo-notifications`.
- Powiadomienia są zaplanowane jako `DATE` trigger — iOS odpala je niezależnie od stanu aplikacji (foreground, background, lock screen).
- W Expo Go: działają dla foreground i background. Przy zabitej aplikacji — wymagany Development Build.
- Po powrocie do aplikacji (`AppState → active`) wszystkie powiadomienia są przeliczane i planowane- Po powrocie do aplikacji (`AppState → active`)  sesji (- Po powrocie do aplikacji (`AppState → active`domienia.
