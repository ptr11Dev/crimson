import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { REAL_TO_GAME_RATIO } from '../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LegendModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Legenda</Text>

              <View style={styles.row}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>SP</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.label}>Przyspieszenie czasu</Text>
                  <Text style={styles.value}>co 10h in-game</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>$</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.label}>Dochód</Text>
                  <Text style={styles.value}>co 3 dni in-game</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>GB</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.label}>Goldbar — Lioncrest Manor</Text>
                  <Text style={styles.value}>co 7 dni in-game</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>M</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.label}>Misja pracownika</Text>
                  <Text style={styles.value}>
                    czas zdefiniowany przy dodaniu
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.ratioText}>
                {REAL_TO_GAME_RATIO} min real ={' '}
                <Text style={styles.ratioHighlight}>1h in-game</Text>
              </Text>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Zamknij</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  ratioText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },
  ratioHighlight: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
  },
});
