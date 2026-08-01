import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';
import { TimePickerInput } from './TimePickerInput';

let Audio = null;
let Asset = null;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  console.warn('expo-av load warning:', e);
}
try {
  Asset = require('expo-asset').Asset;
} catch (e) {
  console.warn('expo-asset load warning:', e);
}

export const AddReminderModal = ({ visible, onClose, onSave, selectedDate, editingReminder }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [importance, setImportance] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState('High');
  const [alarmTone, setAlarmTone] = useState('Brisk Bell');
  const [notification, setNotification] = useState(true);
  const [category, setCategory] = useState('Work');

  const [soundObject, setSoundObject] = useState(null);
  const [playingTone, setPlayingTone] = useState(null);

  const repeatOptions = ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
  const priorityOptions = ['Normal', 'High', 'Critical'];
  const categoryOptions = ['Work', 'Health', 'Personal', 'Finance'];
  const toneOptions = [
    { id: 'No Ringtone', label: 'No Ringtone', icon: 'volumeOff', sound: null },
    { id: 'Cartoon Bell', label: 'Cartoon Bell', icon: 'bell', sound: require('../../assets/sounds/cartoon.wav') },
    { id: 'Brisk Bell', label: 'Brisk Bell', icon: 'bell', sound: require('../../assets/sounds/brisk bell.wav') },
    { id: 'Gentle Chime', label: 'Gentle Chime', icon: 'music', sound: require('../../assets/sounds/gentle chime.wav') },
    { id: 'Soft Bell', label: 'Soft Bell', icon: 'bell', sound: require('../../assets/sounds/soft bell.mp3') },
  ];

  const stopAudioIfPlaying = async () => {
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (e) {}
      setSoundObject(null);
    }
    setPlayingTone(null);
  };

  useEffect(() => {
    return () => {
      stopAudioIfPlaying();
    };
  }, []);

  const handleSelectTone = async (toneObj) => {
    setAlarmTone(toneObj.label);

    await stopAudioIfPlaying();

    if (!toneObj.sound) {
      return;
    }

    try {
      setPlayingTone(toneObj.id);

      if (Audio && Audio.Sound) {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });
        } catch (modeErr) {}

        let soundSource = toneObj.sound;
        if (Asset && typeof toneObj.sound === 'number') {
          try {
            const asset = Asset.fromModule(toneObj.sound);
            await asset.downloadAsync();
            if (asset.localUri || asset.uri) {
              soundSource = { uri: asset.localUri || asset.uri };
            }
          } catch (assetErr) {
            console.warn('Asset download fallback:', assetErr);
          }
        }

        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 1.0 }
        );

        setSoundObject(sound);
        await sound.setPositionAsync(0);
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setPlayingTone(null);
            sound.unloadAsync();
          }
        });
      } else if (typeof window !== 'undefined' && window.Audio) {
        const htmlAudio = new window.Audio(toneObj.sound);
        htmlAudio.volume = 1.0;
        htmlAudio.play().catch(() => {});
        setSoundObject({
          stopAsync: async () => htmlAudio.pause(),
          unloadAsync: async () => {
            htmlAudio.pause();
            htmlAudio.currentTime = 0;
          },
        });
        htmlAudio.onended = () => {
          setPlayingTone(null);
        };
      }
    } catch (e) {
      console.error('Audio playback error:', e);
      setPlayingTone(null);
    }
  };

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title || '');
      setImportance(editingReminder.importance || '');
      setNotes(editingReminder.notes || '');
      setTime(editingReminder.time || '10:00 AM');
      setRepeat(editingReminder.repeat || 'Does not repeat');
      setPriority(editingReminder.priority || 'High');
      setAlarmTone(editingReminder.alarmTone || 'Brisk Bell');
      setNotification(editingReminder.notification !== false);
      setCategory(editingReminder.category || 'Work');
    } else {
      resetForm();
    }
  }, [editingReminder, visible]);

  const handleClose = async () => {
    await stopAudioIfPlaying();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    await stopAudioIfPlaying();
    const reminderData = {
      id: editingReminder ? editingReminder.id : 'r_' + Date.now(),
      title,
      importance,
      notes,
      date: editingReminder
        ? editingReminder.date
        : selectedDate && selectedDate >= new Date().toISOString().split('T')[0]
        ? selectedDate
        : new Date().toISOString().split('T')[0],
      time,
      alarmTone,
      repeat,
      priority,
      notification,
      category,
      notificationId: editingReminder ? editingReminder.notificationId : null,
    };
    onSave(reminderData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setImportance('');
    setNotes('');
    setTime('10:00 AM');
    setRepeat('Does not repeat');
    setPriority('High');
    setAlarmTone('Brisk Bell');
    setNotification(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
              </Text>
              <Text style={[styles.dateBadge, { color: theme.colors.primary }]}>
                {editingReminder ? editingReminder.date : selectedDate || 'Today'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Icon name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Title Field */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title Field</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Add Reminder Title (e.g., Team Meeting)"
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Importance Field */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Why is this date important?
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Importance details (e.g., Annual project deliverable)"
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={2}
              value={importance}
              onChangeText={setImportance}
            />

            {/* Notes / Motivation Quote */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Motivation Quote / Quick Notes
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Quick notes or motivational reminder..."
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Time Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reminder Time</Text>
            <TimePickerInput value={time} onChangeTime={setTime} />

            {/* Alarm Ringtone Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Ringtone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollOptions}>
              {toneOptions.map((toneObj) => {
                const isSelected = alarmTone === toneObj.label || alarmTone === toneObj.id;
                const isPlaying = playingTone === toneObj.id;

                return (
                  <TouchableOpacity
                    key={toneObj.id}
                    style={[
                      styles.tonePill,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                        borderColor: isPlaying ? '#10B981' : isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleSelectTone(toneObj)}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={isPlaying ? 'sparkles' : toneObj.icon}
                      size={15}
                      color={isSelected ? '#FFFFFF' : theme.colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {toneObj.label}
                    </Text>
                    {isPlaying && <View style={styles.playingDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Category Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
            <View style={styles.optionsRow}>
              {categoryOptions.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor:
                        category === cat
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: category === cat ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Priority</Text>
            <View style={styles.optionsRow}>
              {priorityOptions.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor:
                        priority === p
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: priority === p ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Repeat Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Repeat</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollOptions}>
              {repeatOptions.map((rep) => (
                <TouchableOpacity
                  key={rep}
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor:
                        repeat === rep
                          ? theme.colors.secondary
                          : theme.colors.surfaceVariant,
                      marginRight: 8,
                    },
                  ]}
                  onPress={() => setRepeat(rep)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: repeat === rep ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {rep}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Notification Toggle */}
            <View style={styles.toggleRow}>
              <Text style={[styles.label, { color: theme.colors.textPrimary, marginBottom: 0 }]}>
                Enable Trigger Notification & Alarm
              </Text>
              <Switch
                value={notification}
                onValueChange={setNotification}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={notification ? theme.colors.primary : '#F4F3F4'}
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {editingReminder ? 'Save Changes' : 'Save Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateBadge: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    outlineStyle: 'none',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 8,
  },
  playingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 8,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
