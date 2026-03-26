import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_REAL_TO_GAME_RATIO = 5; // 5 real minutes = 1 game hour
export const DEFAULT_NOTIFICATION_LEAD_MINUTES = 5; // notify 5 min before end

interface SettingsState {
  realToGameRatio: number;
  notificationLeadMinutes: number;
  setRealToGameRatio: (ratio: number) => void;
  setNotificationLeadMinutes: (minutes: number) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      realToGameRatio: DEFAULT_REAL_TO_GAME_RATIO,
      notificationLeadMinutes: DEFAULT_NOTIFICATION_LEAD_MINUTES,
      setRealToGameRatio: (ratio) => set({ realToGameRatio: ratio }),
      setNotificationLeadMinutes: (minutes) =>
        set({ notificationLeadMinutes: minutes }),
    }),
    {
      name: 'crimson-desert-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useSettingsStore;
