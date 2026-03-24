import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import useGameStore from '../store/gameStore';

export default function MissionManager() {
  const { addMission } = useGameStore();
  const [hours, setHours] = useState('');

  const handleAdd = () => {
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    addMission(`Misja ${h}h`, h);
    setHours('');
  };

  const valid = !!hours && parseFloat(hours) > 0;

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={hours}
        onChangeText={setHours}
        placeholder="Czas misji (godz. in-game)"
        placeholderTextColor="#475569"
      />
      <TouchableOpacity
        onPress={handleAdd}
        disabled={!valid}
        style={[styles.btn, !valid && styles.btnDisabled]}
      >
        <Text style={[styles.btnText, !valid && styles.btnTextDisabled]}>
          + Dodaj
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#e2e8f0',
  },
  btn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: '#1e293b' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  btnTextDisabled: { color: '#475569' },
});
