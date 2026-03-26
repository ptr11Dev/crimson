import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useGameTimer from '../hooks/useGameTimer';
import useGameStore from '../store/gameStore';
import Timer from './Timer';
import SessionControls from './SessionControls';
import MissionManager from './MissionManager';
import LegendModal from './LegendModal';
import SettingsModal from './SettingsModal';

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
    handleToggleMissionCyclic,
  } = useGameTimer();

  const { updateCurrentGameTime } = useGameStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editDay, setEditDay] = useState('');
  const [editHour, setEditHour] = useState('');
  const [editMinute, setEditMinute] = useState('');
  const [legendVisible, setLegendVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleEditClick = () => {
    if (!currentGameTime) return;
    const match = currentGameTime.match(/Day (\d+), (\d{2}):(\d{2})/);
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
      <LegendModal
        visible={legendVisible}
        onClose={() => setLegendVisible(false)}
      />
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Top bar: legend left, title centered, spacer right */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setLegendVisible(true)}
            style={styles.infoBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            style={styles.infoBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="settings-outline" size={18} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.appTitle}>Crimson Desert</Text>
            <Text style={styles.appSubtitle}>Timer Tracker</Text>
          </View>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Game clock */}
        <View style={styles.clockRow}>
          {!isEditing ? (
            <View style={styles.clockDisplay}>
              <Text style={styles.clockValue}>{currentGameTime}</Text>
              <TouchableOpacity
                onPress={handleEditClick}
                style={styles.editBtn}
              >
                <Ionicons name="pencil" size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.clockEdit}>
              <Text style={styles.clockLabel}>Day</Text>
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
                <Text style={styles.saveBtnText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* End session below clock */}
        <View style={styles.endSessionRow}>
          <SessionControls />
        </View>

        {/* Cyclic actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionLabel}>Cyclic Actions</Text>
            <View style={[styles.dividerLine, styles.dividerFlex]} />
          </View>
          <View style={styles.timerGrid}>
            {speedupTimer && (
              <View style={styles.timerCell}>
                <Timer
                  icon="SP"
                  title="Time Skip"
                  targetDay={speedupTimer.nextDay}
                  targetTime={speedupTimer.nextTime}
                  currentProgress={speedupTimer.progress}
                  isReady={speedupTimer.available}
                  onConfirm={handleConfirmSpeedup}
                  onReset={handleResetSpeedup}
                  realTimeRemaining={speedupTimer.realTimeRemaining}
                  gameTimeRemaining={speedupTimer.gameTimeRemaining}
                />
              </View>
            )}
            {incomeTimer && (
              <View style={styles.timerCell}>
                <Timer
                  icon="$"
                  title="Income"
                  targetDay={incomeTimer.nextDay}
                  targetTime={incomeTimer.nextTime}
                  currentProgress={incomeTimer.progress}
                  isReady={incomeTimer.available}
                  onConfirm={handleConfirmIncome}
                  realTimeRemaining={incomeTimer.realTimeRemaining}
                  gameTimeRemaining={incomeTimer.gameTimeRemaining}
                />
              </View>
            )}
            {goldbarTimer && (
              <View style={styles.timerCell}>
                <Timer
                  icon="GB"
                  title="Goldbar"
                  targetDay={goldbarTimer.nextDay}
                  targetTime="00:00"
                  currentProgress={goldbarTimer.progress}
                  isReady={goldbarTimer.available}
                  onConfirm={handleConfirmGoldbar}
                  realTimeRemaining={goldbarTimer.realTimeRemaining}
                  gameTimeRemaining={goldbarTimer.gameTimeRemaining}
                />
              </View>
            )}
          </View>
        </View>

        {/* Worker missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionLabel}>Worker Missions</Text>
            <View style={[styles.dividerLine, styles.dividerFlex]} />
          </View>
          <MissionManager />
          {missionTimers.length === 0 ? (
            <Text style={styles.emptyText}>No active missions</Text>
          ) : (
            <View style={[styles.timerGrid, styles.missionGrid]}>
              {missionTimers.map((mission) => (
                <View key={mission.id} style={styles.timerCell}>
                  <Timer
                    icon="M"
                    title={mission.type}
                    targetDay={mission.endDay}
                    targetTime={mission.endTime}
                    currentProgress={mission.progress}
                    isReady={mission.available}
                    onConfirm={() => handleConfirmMission(mission.id)}
                    onDelete={() => handleConfirmMission(mission.id)}
                    realTimeRemaining={mission.realTimeRemaining}
                    gameTimeRemaining={mission.gameTimeRemaining}
                    cyclic={mission.cyclic}
                    cyclesCompleted={mission.cyclesCompleted}
                    onToggleCyclic={() => handleToggleMissionCyclic(mission.id)}
                  />
                </View>
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
    marginBottom: 12,
  },
  topBarCenter: { flex: 1, alignItems: 'center' },
  topBarSpacer: { width: 56 },
  infoBtn: { width: 28, alignItems: 'flex-start' },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#34d399' },
  appSubtitle: { fontSize: 12, color: '#64748b' },
  endSessionRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clockRow: { marginBottom: 8 },
  clockDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clockLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' },
  clockValue: { fontSize: 20, fontWeight: 'bold', color: '#34d399' },
  editBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#0284c7',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'stretch',
  },
  timerCell: { width: '48%', flexGrow: 1 },
  missionGrid: { marginTop: 12 },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
