import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import EndSessionModal from './EndSessionModal';

export default function SessionControls() {
  const [showModal, setShowModal] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.btn} onPress={() => setShowModal(true)}>
        <Text style={styles.btnText}>Zakończ sesję</Text>
      </TouchableOpacity>
      {showModal && <EndSessionModal onClose={() => setShowModal(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#1f0a0a',
    borderWidth: 1,
    borderColor: '#991b1b',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnText: { color: '#f87171', fontWeight: '600', fontSize: 14 },
});
