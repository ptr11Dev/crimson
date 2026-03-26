import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import useSettingsStore, {
  DEFAULT_NOTIFICATION_LEAD_MINUTES,
  DEFAULT_REAL_TO_GAME_RATIO,
} from '../store/settingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LEAD_PRESETS = [1, 2, 5, 10, 15];

export default function SettingsModal({ visible, onClose }: Props) {
  const {
    realToGameRatio,
    notificationLeadMinutes,
    setRealToGameRatio,
    setNotificationLeadMinutes,
  } = useSettingsStore();

  // Local draft so changes apply live on close
  const [draftRatio, setDraftRatio] = useState(realToGameRatio);

  const handleOpen = () => {
    setDraftRatio(realToGameRatio);
  };

  const handleClose = () => {
    setRealToGameRatio(draftRatio);
    onClose();
  };

  const ratioLabel =
    draftRatio === DEFAULT_REAL_TO_GAME_RATIO
      ? `${draftRatio} min real = 1h in-game (default)`
      : `${draftRatio} min real = 1h in-game`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      onShow={handleOpen}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Settings</Text>

              {/* Time ratio */}
              <Text style={styles.sectionLabel}>TIME RATIO</Text>
              <Text style={styles.ratioValue}>{ratioLabel}</Text>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderEdge}>1</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  step={1}
                  value={draftRatio}
                  onValueChange={setDraftRatio}
                  minimumTrackTintColor="#10b981"
                  maximumTrackTintColor="#334155"
                  thumbTintColor="#10b981"
                />
                <Text style={styles.sliderEdge}>20</Text>
                <TouchableOpacity
                  onPress={() => setDraftRatio(DEFAULT_REAL_TO_GAME_RATIO)}
                  style={styles.resetBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="refresh" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text style={styles.hint}>
                How many real-world minutes equal 1 in-game hour.
              </Text>

              <View style={styles.divider} />

              {/* Notification lead */}
              <Text style={styles.sectionLabel}>NOTIFY BEFORE END</Text>
              <View style={styles.presetRow}>
                {LEAD_PRESETS.map((min) => (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.presetBtn,
                      notificationLeadMinutes === min && styles.presetBtnActive,
                    ]}
                    onPress={() => setNotificationLeadMinutes(min)}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        notificationLeadMinutes === min &&
                          styles.presetBtnTextActive,
                      ]}
                    >
                      {min}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hint}>
                Push notification fires this many real minutes before a timer
                ends.
              </Text>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeBtnText}>Save & Close</Text>
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
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  ratioValue: {
    fontSize: 13,
    color: '#34d399',
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  sliderEdge: {
    fontSize: 11,
    color: '#64748b',
    width: 16,
    textAlign: 'center',
  },
  resetBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#052e16',
    borderColor: '#10b981',
  },
  presetBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  presetBtnTextActive: {
    color: '#10b981',
  },
  closeBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
