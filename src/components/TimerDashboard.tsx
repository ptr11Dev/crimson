import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import useGameTimer from '../hooks/useGameTimer';
import useGameStore from '../store/gameStore';
import Timer from './Timer';
import SessionControls from './SessionControls';
import MissionManager from './MissionManager';

export default function TimerDashboard() {
  const {
    currentGameTime,
    speedupTimer,
    incomeTimer,
    goldbarTimer,
    missionTimers,
    handleConfirmSpeedup,
    handleResetSpeedup,
    handleConfirmIncome,
    handleConfirmGoldbar,
    handleConfirmMission,
  } = useGameTimer();

  const { updateCurrentGameTime } = useGameStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editDay, setEditDay] = useState('');
  const [editHour, setEditHour] = useState('');
  const [editMinute, setEditMinute] = useState('');

  const handleEditClick = () => {
    if (!currentGameTime) return;
    const match = currentGameTime.match(/Dzień (\d+), (\d{2}):(\d{2})/);
    if (match) {
      setEditDay(match[1]);
      setEditHour(match[2]);
      setEditMinute(match[3]);
    }
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    const day = parseInt(editDay);
    const hour = parseInt(editHour);
    const minute = parseInt(editMinute);
    if (isNaN(day) || isNaN(hour) || isNaN(minute)) return;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || day < 1) return;
    updateCurrentGameTime(
      day,
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    );
    setIsEditing(false);
  };

  if (!currentGameTime) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>⚔️ Crimson Desert</Text>
            <Text style={styles.appSubtitle}>Timer Tracker</Text>
          </View>
          <SessionControls />
        </View>

        {/* Game clock */}
        <View style={styles.clockRow}>
          {!isEditing ? (
            <View style={styles.clockDisplay}>
              <Text style={styles.clockLabel}>Czas gry</Text>
              <Text style={styles.clockValue}>{currentGameTime}</Text>
              <TouchableOpacity onPress={handleEditClick} style={styles.editBtn}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.clockEdit}>
              <Text style={styles.clockLabel}>Dzień</Text>
              <TextInput
                style={styles.editInput}
                keyboardType="numeric"
                value={editDay}
                onChangeText={setEditDay}
              />
              <Text style={styles.clockLabel}>HH</Text>
              <TextInput
                style={styles.editInput}
                keyboardType="numeric"
                value={editHour}
                onChangeText={setEditHour}
              />
              <Text style={styles.clockSep}>:</Text>
              <TextInput
                style={styles.editInput}
                keyboardType="numeric"
                value={editMinute}
                onChangeText={setEditMinute}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTime}>
                <Text style={styles.saveBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cyclic actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionLabel}>Akcje Cykliczne</Text>
            <View style={[styles.dividerLine, styles.dividerFlex]} />
          </View>
          <View style={styles.timerGrid}>
            {speedupTimer && (
              <Timer
                icon="⚡"
                title="Przyspieszenie Czasu"
                targetDay={speedupTimer.nextDay}
                targetTime={speedupTimer.nextTime}
                currentProgress={speedupTimer.progress}
                isReady={speedupTimer.available}
                onConfirm={handleConfirmSpeedup}
                onReset={handleResetSpeedup}
                realTimeRemaining={speedupTimer.realTimeRemaining}
              />
            )}
            {incomeTimer && (
              <Timer
                icon="💰"
                title="Pobranie Dochodu"
                targetDay={incomeTimer.nextDay}
                targetTime={incomeTimer.nextTime}
                currentProgress={incomeTimer.progress}
                isReady={incomeTimer.available}
                onConfirm={handleConfirmIncome}
                realTimeRemaining={incomeTimer.realTimeRemaining}
                gameTimeRemaining={incomeTimer.gameTimeRemaining}
              />
            )}
            {goldbarTimer && (
              <Timer
                icon="🏰"
                title="Goldbar — Lioncrest Manor"
                targetDay={goldbarTimer.nextDay}
                targetTime="00:00"
                currentProgress={goldbarTimer.progress}
                isReady={goldbarTimer.available}
                onConfirm={handleConfirmGoldbar}
                realTimeRemaining={goldbarTimer.realTimeRemaining}
              />
            )}
          </View>
        </View>

        {/* Worker missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionLabel}>Misje Pracowników</Text>
            <View style={[styles.dividerLine, styles.dividerFlex]} />
          </View>
          <MissionManager />
          {missionTimers.length === 0 ? (
            <Text style={styles.emptyText}>Brak aktywnych misji</Text>
          ) : (
            <View style={[styles.timerGrid, styles.missionGrid]}>
              {missionTimers.map((mission) => (
                <Timer
                  key={mission.id}
                  icon="📋"
                  title={mission.type}
                  targetDay={mission.endDay}
                  targetTime={mission.endTime}
                  currentProgress={mission.progress}
                  isReady={mission.available}
                  onConfirm={() => handleConfirmMission(mission.id)}
                  onDelete={() => handleConfirmMission(mission.id)}
                  realTimeRemaining={mission.realTimeRemaining}
                  gameTimeRemaining={mission.gameTimeRemaining}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#34d399' },
  appSubtitle: { fontSize: 12, color: '#64748b' },
  clockRow: { marginBottom: 24 },
  clockDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  clockLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' },
  clockValue: { fontSize: 14, fontWeight: 'bold', color: '#34d399' },
  editBtn: { paddingHorizontal: 4 },
  editBtnText: { fontSize: 14 },
  clockEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editInput: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 14,
    width: 44,
    textAlign: 'center',
  },
  clockSep: { color: '#94a3b8', fontSize: 14 },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: {
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelBtnText: { color: '#cbd5e1', fontSize: 13 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dividerLine: { width: 24, height: 1, backgroundColor: '#334155' },
  dividerFlex: { flex: 1 },
  timerGrid: { gap: 8 },
  missionGrid: { marginTop: 12 },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
