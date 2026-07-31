import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { HabitCard } from '../components/HabitCard';
import { Icon } from '../components/Icons';

export const HabitsScreen = ({ habits, onToggleHabit, onToggleAutoAdd, onAddHabit }) => {
  const { theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFrequency, setNewFrequency] = useState('Daily');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newHabit = {
      id: 'h_' + Date.now(),
      title: newTitle,
      frequency: newFrequency,
      progress: 0,
      streak: 1,
      completedToday: false,
      autoAddToday: true,
      icon: 'sparkles',
    };
    onAddHabit(newHabit);
    setNewTitle('');
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Habit Tracker
        </Text>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ New Habit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak Motivation Banner */}
        <View
          style={[
            styles.streakBanner,
            { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: theme.colors.success },
          ]}
        >
          <View style={styles.streakIconBox}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
          <View style={styles.streakContent}>
            <Text style={[styles.streakTitle, { color: theme.colors.success }]}>
              12 Day Streak!
            </Text>
            <Text style={[styles.streakSubtitle, { color: theme.colors.textPrimary }]}>
              Keep going! You are building fantastic daily momentum.
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Recurring Habits & Goals ({habits.length})
          </Text>
        </View>

        {/* Habits List */}
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleComplete={onToggleHabit}
            onToggleAutoAdd={onToggleAutoAdd}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* New Habit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Create New Recurring Habit
            </Text>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Habit Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g., Morning Meditation, Jogging, Water"
              placeholderTextColor={theme.colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Frequency
            </Text>
            <View style={styles.freqRow}>
              {['Daily', '5 Times/Week', '3 Times/Week'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.freqPill,
                    {
                      backgroundColor:
                        newFrequency === freq
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setNewFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.freqText,
                      { color: newFrequency === freq ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleAdd}
              >
                <Text style={styles.submitBtnText}>Create Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 12,
  },
  streakIconBox: {
    marginRight: 14,
  },
  fireEmoji: {
    fontSize: 32,
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  streakSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  freqPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  freqText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
