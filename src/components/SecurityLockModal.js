import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { useSecurity } from '../context/SecurityContext';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const SecurityLockModal = () => {
  const { isLocked, isBiometricsSupported, isBiometricsEnabled, unlockWithPin, unlockWithBiometrics } = useSecurity();
  const { theme } = useTheme();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocked) return null;

  const handlePressNum = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const verify = async (inputPin) => {
    const success = await unlockWithPin(inputPin);
    if (!success) {
      Vibration.vibrate(200);
      setErrorMsg('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleBioUnlock = async () => {
    const success = await unlockWithBiometrics();
    if (!success) {
      setErrorMsg('Biometric authentication failed.');
    }
  };

  return (
    <Modal visible={isLocked} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
            <Icon name="lock" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Daybook Locked</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your 4-digit security PIN to unlock
          </Text>
        </View>

        {/* PIN Indicators */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: pin.length > idx ? theme.colors.primary : 'transparent',
                },
              ]}
            />
          ))}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Keypad */}
        <View style={styles.keypad}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.keyBtn, { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.border }]}
                  onPress={() => handlePressNum(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.keypadRow}>
            {isBiometricsSupported && isBiometricsEnabled ? (
              <TouchableOpacity
                style={[styles.keyBtn, { backgroundColor: 'transparent', borderWidth: 0 }]}
                onPress={handleBioUnlock}
              >
                <Icon name="sparkles" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.keyBtnEmpty} />
            )}

            <TouchableOpacity
              style={[styles.keyBtn, { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.border }]}
              onPress={() => handlePressNum('0')}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyBtn, { backgroundColor: 'transparent', borderWidth: 0 }]}
              onPress={handleDelete}
            >
              <Icon name="delete" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnEmpty: {
    width: 70,
    height: 70,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
  },
});
