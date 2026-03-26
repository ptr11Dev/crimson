import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import useGameStore from '../store/gameStore';
import { cancelAllNotifications } from '../services/notificationService';

interface Props {
  onClose: () => void;
}

export default function EndSessionModal({ onClose }: Props) {
  const { endSession } = useGameStore();

  const handleConfirm = async () => {
    await cancelAllNotifications();
    endSession();
    onClose();
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>End Session?</Text>
              <Text style={styles.body}>
                Timer state will be saved and restored on next session.
              </Text>
              <Text style={styles.sub}>
                Goldbar & income / mission times are stored locally.
              </Text>

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmText}>End Session</Text>
                </TouchableOpacity>
              </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  body: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  sub: { fontSize: 12, color: '#64748b', marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: { color: '#cbd5e1', fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: 'bold' },
});
