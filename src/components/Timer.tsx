import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  cyclic?: boolean;
  cyclesCompleted?: number;
  onToggleCyclic?: () => void;
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
  cyclic,
  cyclesCompleted,
  onToggleCyclic,
}: TimerProps) {
  const pct = Math.min(100, Math.max(0, currentProgress));
  const [colorA, colorB] = getProgressColors(pct);

  return (
    <View style={[styles.card, isReady && styles.cardReady]}>
      {/* Header: icon badge + title + action buttons */}
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
          {cyclic || (cyclesCompleted !== undefined && cyclesCompleted > 0)
            ? ` (${cyclesCompleted ?? 0})`
            : ''}
        </Text>
        <View style={styles.actions}>
          {onToggleCyclic && (
            <TouchableOpacity
              onPress={onToggleCyclic}
              style={[styles.iconBtn, cyclic && styles.cyclicBtnActive]}
            >
              <Ionicons
                name="repeat"
                size={12}
                color={cyclic ? '#10b981' : '#475569'}
              />
            </TouchableOpacity>
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

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={[colorA, colorB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${pct}%` }]}
        />
      </View>

      {/* Target time + percentage */}
      <View style={styles.infoRow}>
        <Text
          style={[styles.targetTime, isReady && styles.targetTimeReady]}
          numberOfLines={1}
        >
          {isReady ? 'READY' : formatGameDateTime(targetDay, targetTime)}
        </Text>
        <Text style={styles.pct}>{pct.toFixed(0)}%</Text>
      </View>

      {/* Countdowns */}
      {!isReady && realTimeRemaining && (
        <Text style={styles.realTime} numberOfLines={1}>
          R: {realTimeRemaining}
        </Text>
      )}
      {!isReady && gameTimeRemaining && (
        <Text style={styles.gameTime} numberOfLines={1}>
          G: {gameTimeRemaining}
        </Text>
      )}

      {/* Confirm button */}
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
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    gap: 6,
  },
  cardReady: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8' },
  title: { flex: 1, fontSize: 11, fontWeight: '600', color: '#cbd5e1' },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 3 },
  cyclicBtnActive: {
    backgroundColor: '#052e16',
    borderRadius: 3,
  },
  iconBtnText: { fontSize: 13, color: '#64748b' },
  deleteBtnText: { fontSize: 10, color: '#64748b' },
  progressTrack: {
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetTime: { fontSize: 11, fontWeight: 'bold', color: '#e2e8f0', flex: 1 },
  targetTimeReady: { color: '#34d399' },
  pct: { fontSize: 10, color: '#64748b' },
  realTime: { fontSize: 10, color: '#fbbf24' },
  gameTime: { fontSize: 10, color: '#38bdf8' },
  confirmBtn: {
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 2,
  },
  confirmBtnReady: { backgroundColor: '#10b981' },
  confirmBtnDisabled: { backgroundColor: '#1e293b' },
  confirmBtnText: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  confirmBtnTextDisabled: { color: '#334155' },
});
