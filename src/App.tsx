import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useGameStore from './store/gameStore';
import GameStart from './components/GameStart';
import TimerDashboard from './components/TimerDashboard';
import {
  requestNotificationPermissions,
  configureNotificationHandler,
} from './services/notificationService';

export default function App() {
  const { sessionStartTime } = useGameStore();
  const [permissionsChecked, setPermissionsChecked] = useState(false);

  useEffect(() => {
    configureNotificationHandler();
    requestNotificationPermissions().then((granted) => {
      if (!granted) {
        Alert.alert(
          'Powiadomienia wyłączone',
          'Aby otrzymywać przypomnienia 5 minut przed końcem timerów, włącz powiadomienia dla tej aplikacji w Ustawieniach iOS.',
          [{ text: 'OK' }],
        );
      }
      setPermissionsChecked(true);
    });
  }, []);

  if (!permissionsChecked) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>⚔️</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {!sessionStartTime ? <GameStart /> : <TimerDashboard />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loading: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 48,
  },
});
