import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * TimePickerInput
 *
 * – No keyboard ever opens.
 * – Tap [HH] or [MM] to select which field the shared +/− affect.
 * – Active highlight auto-clears after 3 s of no interaction.
 * – Layout:  [HH]  :  [MM]   [＋]   [AM/PM]
 *                              [－]
 */
export const TimePickerInput = ({ value = '08:00 AM', onChangeTime }) => {
  const { theme } = useTheme();

  // ─── Parse incoming value ─────────────────────────────────────────────────
  const parseTime = (timeStr) => {
    if (!timeStr) return { hh: 8, mm: 0, period: 'AM' };
    const parts = timeStr.trim().split(' ');
    const period =
      parts[1] && (parts[1].toUpperCase() === 'PM' || parts[1].toUpperCase() === 'AM')
        ? parts[1].toUpperCase()
        : 'AM';
    const tp = parts[0] ? parts[0].split(':') : ['8', '0'];
    return {
      hh: Math.min(12, Math.max(1, parseInt(tp[0], 10) || 8)),
      mm: Math.min(59, Math.max(0, parseInt(tp[1], 10) || 0)),
      period,
    };
  };

  const initial = parseTime(value);
  const [hours, setHours]       = useState(initial.hh);
  const [minutes, setMinutes]   = useState(initial.mm);
  const [period, setPeriod]     = useState(initial.period);
  // null = no field selected (no highlight shown)
  const [activeField, setActiveField] = useState(null);

  const prevValueRef  = useRef(value);
  const blurTimerRef  = useRef(null);   // auto-blur timer

  // ─── Auto-blur after 3 s of no interaction ────────────────────────────────
  const scheduleBlur = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      setActiveField(null);
    }, 3000);
  };

  useEffect(() => () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
  }, []);

  // ─── Sync when parent changes value externally ────────────────────────────
  useEffect(() => {
    if (value && value !== prevValueRef.current) {
      prevValueRef.current = value;
      const p = parseTime(value);
      setHours(p.hh);
      setMinutes(p.mm);
      setPeriod(p.period);
    }
  }, [value]);

  // ─── Notify parent ────────────────────────────────────────────────────────
  const notify = (h, m, p) => {
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
    prevValueRef.current = formatted;
    if (onChangeTime) onChangeTime(formatted);
  };

  // ─── Select a field ───────────────────────────────────────────────────────
  const selectField = (field) => {
    setActiveField(field);
    scheduleBlur();
  };

  // ─── Shared +/− handler ───────────────────────────────────────────────────
  const step = (dir) => {
    // Default to hours if nothing is selected yet
    const field = activeField || 'hours';
    if (activeField === null) setActiveField('hours');
    scheduleBlur();

    if (field === 'hours') {
      // Compute first, then setState and notify separately (never inside updater)
      let next = hours + dir;
      if (next > 12) next = 1;
      if (next < 1)  next = 12;
      setHours(next);
      notify(next, minutes, period);
    } else {
      let next = minutes + dir;
      if (next > 59) next = 0;
      if (next < 0)  next = 59;
      setMinutes(next);
      notify(hours, next, period);
    }
  };

  // ─── AM / PM toggle ───────────────────────────────────────────────────────
  const togglePeriod = () => {
    // Tapping AM/PM counts as interacting elsewhere — clear the field focus
    setActiveField(null);
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    const next = period === 'AM' ? 'PM' : 'AM';
    setPeriod(next);
    notify(hours, minutes, next);
  };

  // ─── Colours ──────────────────────────────────────────────────────────────
  const c = theme.colors;

  const boxStyle = (field) => ({
    ...styles.displayBox,
    borderWidth: activeField === field ? 2 : 1,
    borderColor: activeField === field ? c.primary : c.border,
    backgroundColor: c.surfaceVariant,
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Hour box */}
      <TouchableOpacity style={boxStyle('hours')} onPress={() => selectField('hours')} activeOpacity={0.8}>
        <Text style={[styles.displayText, { color: c.textPrimary }]}>
          {String(hours).padStart(2, '0')}
        </Text>
      </TouchableOpacity>

      {/* Colon */}
      <Text style={[styles.colon, { color: c.textPrimary }]}>:</Text>

      {/* Minute box */}
      <TouchableOpacity style={boxStyle('minutes')} onPress={() => selectField('minutes')} activeOpacity={0.8}>
        <Text style={[styles.displayText, { color: c.textPrimary }]}>
          {String(minutes).padStart(2, '0')}
        </Text>
      </TouchableOpacity>

      {/* ＋ / － column — placed BEFORE AM/PM */}
      <View style={styles.stepperCol}>
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: c.primary }]}
          onPress={() => step(1)}
          activeOpacity={0.75}
        >
          <Text style={styles.stepBtnText}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: c.surfaceVariant, borderColor: c.border, borderWidth: 1 }]}
          onPress={() => step(-1)}
          activeOpacity={0.75}
        >
          <Text style={[styles.stepBtnText, { color: c.primary }]}>－</Text>
        </TouchableOpacity>
      </View>

      {/* AM / PM toggle */}
      <TouchableOpacity
        style={[styles.periodBtn, { backgroundColor: c.primary }]}
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

  // HH / MM display boxes
  displayBox: {
    width: 58,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Colon
  colon: {
    fontSize: 24,
    fontWeight: '900',
  },

  // +/- vertical stack
  stepperCol: {
    flexDirection: 'column',
    gap: 5,
  },
  stepBtn: {
    width: 40,
    height: 21,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },

  // AM/PM pill
  periodBtn: {
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
