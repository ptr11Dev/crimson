import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import useGameStore, { Mission } from '../store/gameStore';
import { REAL_TO_GAME_RATIO } from '../constants';

export default function GameStart() {
  const { sessionStartTime, startSession, savedSessionData, lastGoldbarDay } =
    useGameStore();

  const [gameDay, setGameDay] = useState('1');
  const [gameHour, setGameHour] = useState('0');
  const [gameMinute, setGameMinute] = useState('0');
  const [nextSpeedupHours, setNextSpeedupHours] = useState('10');
  const [nextIncomeDays, setNextIncomeDays] = useState('');
  const [nextIncomeHours, setNextIncomeHours] = useState('');
  const [goldbarDay, setGoldbarDay] = useState('');

  useEffect(() => {
    if (savedSessionData?.lastGameDay != null) {
      setGameDay(String(savedSessionData.lastGameDay));
    }
    if (savedSessionData?.lastGameTime != null) {
      const [h, m] = savedSessionData.lastGameTime.split(':');
      setGameHour(h);
      setGameMinute(m);
    }
    if (savedSessionData?.nextIncomeDays != null) {
      setNextIncomeDays(String(savedSessionData.nextIncomeDays));
    }
    if (savedSessionData?.nextIncomeHours != null) {
      setNextIncomeHours(String(savedSessionData.nextIncomeHours));
    }
    if (savedSessionData?.nextSpeedupHours != null) {
      setNextSpeedupHours(
        String(Math.round(savedSessionData.nextSpeedupHours)),
      );
    }
    if (lastGoldbarDay != null) {
      setGoldbarDay(String(lastGoldbarDay));
    }
  }, [savedSessionData, lastGoldbarDay]);

  const handleStart = () => {
    const day = parseInt(gameDay) || 1;
    const hour = Math.min(23, Math.max(0, parseInt(gameHour) || 0));
    const minute = Math.min(59, Math.max(0, parseInt(gameMinute) || 0));
    const speedupH = parseFloat(nextSpeedupHours) || 10;
    const incDays = nextIncomeDays.trim() ? parseInt(nextIncomeDays) : null;
    const incHours = nextIncomeHours.trim() ? parseInt(nextIncomeHours) : null;
    const gbDay = goldbarDay.trim() ? parseInt(goldbarDay) : null;

    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const currentTotalMins = (day - 1) * 24 * 60 + hour * 60 + minute;

    const existingMissions: Mission[] = (
      savedSessionData?.remainingMissions ?? []
    )
      .filter((m) => m.remainingHours > 0)
      .map((m, idx) => {
        const elapsedMins = (m.durationHours - m.remainingHours) * 60;
        const startTotalMins = currentTotalMins - elapsedMins;
        const startDay = Math.max(
          1,
          Math.floor(startTotalMins / (24 * 60)) + 1,
        );
        const startTod = ((startTotalMins % (24 * 60)) + 24 * 60) % (24 * 60);
        const startHour = Math.floor(startTod / 60);
        const startMin = startTod % 60;
        return {
          id: Date.now() + idx,
          type: m.type,
          durationHours: m.durationHours,
          startDay,
          startTime: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
          startRealTime: Date.now(),
        };
      });

    startSession(
      day,
      time,
      speedupH,
      incDays,
      incHours,
      gbDay,
      existingMissions,
    );
  };

  if (sessionStartTime) return null;

  const savedMissionCount = (savedSessionData?.remainingMissions ?? []).filter(
    (m) => m.remainingHours > 0,
  ).length;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>⚔️ Crimson Desert</Text>
          <Text style={styles.subtitle}>Timer Tracker — Nowa sesja</Text>
        </View>

        <View style={styles.card}>
          {/* Game time */}
          <Text style={styles.sectionLabel}>Bieżący czas w grze</Text>
          <View style={styles.row3}>
            <View style={styles.flex}>
              <Text style={styles.inputLabel}>Dzień</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={gameDay}
                onChangeText={setGameDay}
                placeholderTextColor="#475569"
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.inputLabel}>Godzina</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={gameHour}
                onChangeText={setGameHour}
                placeholderTextColor="#475569"
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.inputLabel}>Minuta</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={gameMinute}
                onChangeText={setGameMinute}
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          {/* Speedup */}
          <Text style={[styles.sectionLabel, styles.sectionGap]}>
            Przyspieszenie czasu
          </Text>
          <Text style={styles.inputLabel}>
            Ile godzin (in-game) do następnego?
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={nextSpeedupHours}
            onChangeText={setNextSpeedupHours}
            placeholderTextColor="#475569"
          />
          <Text style={styles.hint}>
            Domyślnie 10h (cykl resetuje się po wykonaniu)
          </Text>

          {/* Income */}
          <Text style={[styles.sectionLabel, styles.sectionGap]}>
            Następny dochód
          </Text>
          <View style={styles.row2}>
            <View style={styles.flex}>
              <Text style={styles.inputLabel}>Za ile dni?</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={nextIncomeDays}
                onChangeText={setNextIncomeDays}
                placeholder="0"
                placeholderTextColor="#475569"
              />
            </View>
            <View style={[styles.flex, styles.rowGap]}>
              <Text style={styles.inputLabel}>Za ile godzin?</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={nextIncomeHours}
                onChangeText={setNextIncomeHours}
                placeholder="0"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
          <Text style={styles.hint}>
            Pozostały czas do pobrania dochodu (in-game)
          </Text>

          {/* Goldbar */}
          <Text style={[styles.sectionLabel, styles.sectionGap]}>
            Goldbar — Lioncrest Manor
          </Text>
          <Text style={styles.inputLabel}>Dzień ostatniej kradzieży</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={goldbarDay}
            onChangeText={setGoldbarDay}
            placeholder="Opcjonalne"
            placeholderTextColor="#475569"
          />
          <Text style={styles.hint}>Zostaw puste jeśli nie pamiętasz</Text>

          {/* Restored missions notice */}
          {savedMissionCount > 0 && (
            <View style={styles.restoredBadge}>
              <Text style={styles.restoredText}>
                ✓ {savedMissionCount} misja(-e) z poprzedniej sesji zostanie
                przywrócona.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>🎮 Start Grania</Text>
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>LEGENDA</Text>
          <Text style={styles.legendItem}>
            ⚡ Przyspieszenie czasu — co{' '}
            <Text style={styles.legendValue}>10h</Text> in-game
          </Text>
          <Text style={styles.legendItem}>
            💰 Dochód — co <Text style={styles.legendValue}>3 dni</Text> in-game
          </Text>
          <Text style={styles.legendItem}>
            🏰 Goldbar — co <Text style={styles.legendValue}>7 dni</Text>{' '}
            in-game
          </Text>
          <Text style={styles.legendItem}>
            ⏱ {REAL_TO_GAME_RATIO} min real ={' '}
            <Text style={styles.legendValue}>1h</Text> in-game
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#34d399' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionGap: { marginTop: 20 },
  inputLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#f1f5f9',
  },
  hint: { fontSize: 11, color: '#475569', marginTop: 4 },
  row3: { flexDirection: 'row', gap: 10 },
  row2: { flexDirection: 'row', gap: 10 },
  rowGap: { marginLeft: 0 },
  restoredBadge: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#166534',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  restoredText: { fontSize: 12, color: '#34d399' },
  startBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  startBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  legend: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  legendItem: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  legendValue: { color: '#94a3b8' },
});
