# Task: Port React web app to Expo iOS (incremental, safe)

Goal: create a mobile version using Expo. Reuse logic (TS/store/timers), rewrite UI to React Native. Start with Expo Go, keep compatibility with future development build.

## Rules

- Do not rewrite business logic unless necessary
- No browser APIs (window, document, localStorage)
- Keep changes incremental and reviewable
- Expo Go is only for development, not final target

## Steps

### 1. Setup

- Create branch `ios`
- Commit current state
- Analyze project:
  - reusable TS logic
  - browser-only parts
  - UI to rewrite

### 2. Init Expo

- Initialize Expo app (TypeScript, compatible with Expo Go on iPhone → SDK 54)
- Install:
  - expo-notifications
  - @react-native-async-storage/async-storage
  - zustand
  - dayjs
  - nativewind
  - expo-linear-gradient (if needed)

### 3. Migrate logic

- Move:
  - store
  - timers
  - utils
  - types
- Replace:
  - localStorage → AsyncStorage
- Remove:
  - DOM dependencies

### 4. Notifications

Create `notificationService.ts`:

- scheduleTimerNotification(timerId, timestamp, label)
- cancelTimerNotification(timerId)
- cancelAllNotifications()

Rules:

- use expo-notifications
- schedule at (end - 5min)
- reschedule on any timer change
- reschedule after restore

### 5. Permissions

- Request notification permission on start
- If denied → show info, do not crash

### 6. Rewrite UI

- div → View
- text → Text
- button → Pressable

Rules:

- remove hover/focus/cursor CSS
- replace breakpoints → useWindowDimensions
- full screen → flex: 1 / absolute
- animations → Animated
- gradients → expo-linear-gradient
- styling → NativeWind

### 7. Timer correctness

Ensure:

- background
- lock screen
- app killed
- restore from storage

Rules:

- compute from timestamps (not intervals)
- reschedule notifications after restore

### 8. Time correction

- cancel all notifications
- recompute timestamps
- reschedule all

### 9. Cleanup

- remove web-only files AFTER mobile works

### 10. Test (real iPhone, Expo Go)

Verify:

- timers after background
- notifications on lock screen
- notifications after app kill
- rescheduling after changes
- multiple timers
- permission denied case
- manual time correction

## Deliverables

- working Expo app (branch ios)
- reused logic modules
- RN UI
- notifications integrated
- AsyncStorage persistence
