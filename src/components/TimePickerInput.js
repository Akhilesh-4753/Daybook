import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const TimePickerInput = ({ value = '10:10 AM', onChangeTime }) => {
  const { theme } = useTheme();

  // Parse initial value e.g. "08:00 AM" or "10:30 PM"
  const parseTime = (timeStr) => {
    if (!timeStr) return { hh: '10', mm: '10', period: 'AM' };
    const parts = timeStr.trim().split(' ');
    const period = parts[1] && (parts[1].toUpperCase() === 'PM' || parts[1].toUpperCase() === 'AM') ? parts[1].toUpperCase() : 'AM';
    const timeParts = parts[0] ? parts[0].split(':') : ['10', '10'];
    let hh = timeParts[0] || '10';
    let mm = timeParts[1] || '10';

    hh = String(Math.min(12, Math.max(1, parseInt(hh, 10) || 10))).padStart(2, '0');
    mm = String(Math.min(59, Math.max(0, parseInt(mm, 10) || 0))).padStart(2, '0');

    return { hh, mm, period };
  };

  const initial = parseTime(value);
  const [hours, setHours] = useState(initial.hh);
  const [minutes, setMinutes] = useState(initial.mm);
  const [period, setPeriod] = useState(initial.period);

  const prevValueRef = useRef(value);

  useEffect(() => {
    // Only update internal state if value changed externally from outside parent
    if (value && value !== prevValueRef.current) {
      prevValueRef.current = value;
      const parsed = parseTime(value);
      setHours(parsed.hh);
      setMinutes(parsed.mm);
      setPeriod(parsed.period);
    }
  }, [value]);

  const notifyChange = (h, m, p) => {
    if (onChangeTime) {
      const formattedH = h !== '' ? String(Math.min(12, Math.max(1, parseInt(h, 10) || 10))).padStart(2, '0') : '10';
      const formattedM = m !== '' ? String(Math.min(59, Math.max(0, parseInt(m, 10) || 0))).padStart(2, '0') : '00';
      const newFormattedTime = `${formattedH}:${formattedM} ${p}`;
      prevValueRef.current = newFormattedTime;
      onChangeTime(newFormattedTime);
    }
  };

  const handleHoursChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setHours('');
      return;
    }
    let num = parseInt(cleaned, 10);
    if (num > 12) num = 12;
    const str = String(num);
    setHours(str);
    notifyChange(str, minutes, period);
  };

  const handleHoursBlur = () => {
    let num = parseInt(hours, 10);
    if (isNaN(num) || num < 1) num = 10;
    if (num > 12) num = 12;
    const formatted = String(num).padStart(2, '0');
    setHours(formatted);
    notifyChange(formatted, minutes, period);
  };

  const handleMinutesChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setMinutes('');
      return;
    }
    let num = parseInt(cleaned, 10);
    if (num > 59) num = 59;
    const str = String(num);
    setMinutes(str);
    notifyChange(hours, str, period);
  };

  const handleMinutesBlur = () => {
    let num = parseInt(minutes, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 59) num = 59;
    const formatted = String(num).padStart(2, '0');
    setMinutes(formatted);
    notifyChange(hours, formatted, period);
  };

  const togglePeriod = () => {
    const nextPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(nextPeriod);
    notifyChange(hours, minutes, nextPeriod);
  };

  return (
    <View style={styles.container}>
      {/* Hours Input */}
      <View style={[styles.timeBox, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
        <TextInput
          style={[styles.timeInput, { color: theme.colors.textPrimary }]}
          keyboardType="number-pad"
          maxLength={2}
          value={hours}
          onChangeText={handleHoursChange}
          onBlur={handleHoursBlur}
          placeholder="08"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      {/* Fixed Colon Separator */}
      <Text style={[styles.colonText, { color: theme.colors.textPrimary }]}>:</Text>

      {/* Minutes Input */}
      <View style={[styles.timeBox, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
        <TextInput
          style={[styles.timeInput, { color: theme.colors.textPrimary }]}
          keyboardType="number-pad"
          maxLength={2}
          value={minutes}
          onChangeText={handleMinutesChange}
          onBlur={handleMinutesBlur}
          placeholder="00"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      {/* AM / PM Toggle Pill */}
      <TouchableOpacity
        style={[styles.periodBtn, { backgroundColor: theme.colors.primary }]}
        onPress={togglePeriod}
        activeOpacity={0.8}
      >
        <Text style={styles.periodText}>{period}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBox: {
    width: 60,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    outlineStyle: 'none',
  },
  colonText: {
    fontSize: 22,
    fontWeight: '800',
  },
  periodBtn: {
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
