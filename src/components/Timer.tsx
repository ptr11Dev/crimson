import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatGameDateTime } from '../utils/timeCalculator';

interface TimerProps {
  title: string;
  icon: string;
  targetDay: number;
  targetTime: string;
  currentProgress: number;
  isReady: boolean;
  onConfirm: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  realTimeRemaining?: string | null;
  gameTimeRemaining?: string | null;
}

function getProgressColors(pct: number): [string, string] {
  if (pct >= 100) return ['#16a34a', '#22c55e'];
  if (pct >= 50) {
    const t = (pct - 50) / 50;
    const r = Math.round(234 - t * (234 - 34));
    const g = Math.round(179 + t * (197 - 179));
    const b = Math.round(8 + t * (94 - 8));
    return ['#ef4444', `rgb(${r},${g},${b})`];
  }
  const t = pct / 50;
  const r = Math.round(239 - t * (239 - 234));
  const g = Math.round(68 + t * (179 - 68));
  const b = Math.round(68 - t * (68 - 8));
  return ['#ef4444', `rgb(${r},${g},${b})`];
}

export default function Timer({
  title,
  icon,
  targetDay,
  targetTime,
  currentProgress,
  isReady,
  onConfirm,
  onDelete,
  onReset,
  realTimeRemaining,
  gameTimeRemaining,
}: TimerProps) {
  const pct = Math.min(100, Math.max(0, currentProgress));
  const [colorA, colorB] = getProgressColors(pct);

  return (
    <View style={[styles.card, isReady && styles.cardReady]}>
      {/* Row 1: icon + title + badges + action buttons */}
      <View style={styles.row}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.actions}>
          {isReady && (
            <View style={styles.readyBadge}>
              <Text style={styles.readyText}>GOTOWE</Text>
            </View>
          )}
          {onReset && (
            <TouchableOpacity onPress={onReset} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>↺</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Row 2: target time + countdowns */}
      <View style={styles.row}>
        <Text style={[styles.targetTime, isReady && styles.targetTimeReady]}>
          {formatGameDateTime(targetDay, targetTime)}
        </Text>
        {!isReady && (realTimeRemaining || gameTimeRemaining) && (
          <View style={styles.countdowns}>
            {realTimeRemaining && (
              <Text style={styles.realTime}>⏱ {realTimeRemaining}</Text>
            )}
            {gameTimeRemaining && (
              <Text style={styles.gameTime}>🎮 {gameTimeRemaining}</Text>
            )}
          </View>
        )}
      </View>

      {/* Row 3: progress bar + % + confirm button */}
      <View style={styles.row}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colorA, colorB]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${pct}%` }]}
          />
        </View>
        <Text style={styles.pct}>{pct.toFixed(0)}%</Text>
        <TouchableOpacity
          onPress={onConfirm}
          disabled={!isReady}
          style={[
            styles.confirmBtn,
            isReady ? styles.confirmBtnReady : styles.confirmBtnDisabled,
          ]}
        >
          <Text
            style={[
              styles.confirmBtnText,
              !isReady && styles.confirmBtnTextDisabled,
            ]}
          >
            ✓
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    gap: 8,
  },
  cardReady: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  icon: { fontSize: 14 },
  title: { fontSize: 12, fontWeight: '600', color: '#cbd5e1', flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readyBadge: {
    backgroundColor: '#10b981',
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  readyText: { fontSize: 9, fontWeight: 'bold', color: '#000' },
  iconBtn: { padding: 2 },
  iconBtnText: { fontSize: 14, color: '#64748b' },
  deleteBtnText: { fontSize: 11, color: '#64748b' },
  targetTime: { fontSize: 13, fontWeight: 'bold', color: '#e2e8f0', flex: 1 },
  targetTimeReady: { color: '#34d399' },
  countdowns: { alignItems: 'flex-end', gap: 2 },
  realTime: { fontSize: 11, color: '#fbbf24' },
  gameTime: { fontSize: 11, color: '#38bdf8' },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99 },
  pct: { fontSize: 10, color: '#64748b', width: 32, textAlign: 'right' },
  confirmBtn: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  confirmBtnReady: { backgroundColor: '#10b981' },
  confirmBtnDisabled: { backgroundColor: '#1e293b' },
  confirmBtnText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  confirmBtnTextDisabled: { color: '#475569' },
});
