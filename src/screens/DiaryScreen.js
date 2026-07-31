import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';

export const DiaryScreen = ({ diaryEntries, onSaveEntry }) => {
  const { theme } = useTheme();

  const [date, setDate] = useState('2026-07-29');
  const [formattedDate, setFormattedDate] = useState('Wednesday, 29 July 2026');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('happy');
  const [content, setContent] = useState('');
  const [showSavedList, setShowSavedList] = useState(false);

  const moods = [
    { id: 'happy', emoji: '😃', label: 'Happy' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'sad', emoji: '😔', label: 'Sad' },
    { id: 'stressed', emoji: '😫', label: 'Stressed' },
  ];

  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      return;
    }
    const newEntry = {
      id: 'd_' + Date.now(),
      date,
      formattedDate,
      title: title || 'Daily Reflection',
      mood,
      content,
    };
    onSaveEntry(newEntry);
    setTitle('');
    setContent('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Diary & Reflections
        </Text>
        <TouchableOpacity
          style={[styles.historyBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => setShowSavedList(!showSavedList)}
        >
          <Text style={[styles.historyBtnText, { color: theme.colors.primary }]}>
            {showSavedList ? 'Write Entry' : 'Past Journal'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!showSavedList ? (
          <View style={styles.editorContainer}>
            {/* Date Selector Row */}
            <View
              style={[
                styles.dateCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.dateInfo}>
                <Text style={[styles.dateTextLabel, { color: theme.colors.textPrimary }]}>
                  {formattedDate}
                </Text>
                <Text style={[styles.dateSubtext, { color: theme.colors.textMuted }]}>
                  Selected Journal Date
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editDateBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => {
                  setDate('2026-07-30');
                  setFormattedDate('Thursday, 30 July 2026');
                }}
              >
                <Text style={[styles.editDateBtnText, { color: theme.colors.primary }]}>
                  Edit Date
                </Text>
              </TouchableOpacity>
            </View>

            {/* Entry Title Input */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Give today's entry a title..."
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Mood Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              How are you feeling today? (Mood)
            </Text>
            <View style={styles.moodRow}>
              {moods.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.moodPill,
                    {
                      backgroundColor:
                        mood === m.id
                          ? 'rgba(99, 102, 241, 0.18)'
                          : theme.colors.card,
                      borderColor:
                        mood === m.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setMood(m.id)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: mood === m.id ? theme.colors.primary : theme.colors.textSecondary },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reflection Writing Area */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Daily Memories & Thoughts
            </Text>
            <View
              style={[
                styles.textEditorCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <TextInput
                style={[styles.editorArea, { color: theme.colors.textPrimary }]}
                placeholder="Write about your daily highlights, achievements, learnings, or thoughts..."
                placeholderTextColor={theme.colors.textMuted}
                multiline={true}
                numberOfLines={8}
                value={content}
                onChangeText={setContent}
              />

              {/* Formatting & Attachments Tool Bar */}
              <View
                style={[
                  styles.toolbarRow,
                  { borderTopColor: theme.colors.border, backgroundColor: theme.colors.cardSecondary },
                ]}
              >
                <TouchableOpacity style={styles.toolIconBtn}>
                  <Text style={[styles.toolIconText, { color: theme.colors.textSecondary }]}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolIconBtn}>
                  <Text style={[styles.toolIconText, { color: theme.colors.textSecondary }]}>🎙️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolIconBtn}>
                  <Text style={[styles.toolIconText, { color: theme.colors.textSecondary }]}>🏷️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolIconBtn}>
                  <Text style={[styles.toolIconText, { color: theme.colors.textSecondary }]}><b>B</b></Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save Diary Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pastEntriesContainer}>
            <Text style={[styles.pastHeaderTitle, { color: theme.colors.textPrimary }]}>
              Your Past Memories ({diaryEntries.length})
            </Text>

            {diaryEntries.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.entryCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.entryHeaderRow}>
                  <Text style={[styles.entryDate, { color: theme.colors.primary }]}>
                    {entry.formattedDate || entry.date}
                  </Text>
                  <Text style={styles.entryMoodEmoji}>
                    {moods.find((m) => m.id === entry.mood)?.emoji || '😃'}
                  </Text>
                </View>

                <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]}>
                  {entry.title}
                </Text>

                <Text style={[styles.entryContent, { color: theme.colors.textSecondary }]}>
                  {entry.content}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  historyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  historyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  editorContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateTextLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  editDateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editDateBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 6,
  },
  titleInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodPill: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    width: '18%',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  textEditorCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  editorArea: {
    padding: 16,
    fontSize: 15,
    height: 160,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  toolbarRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 16,
  },
  toolIconBtn: {
    padding: 4,
  },
  toolIconText: {
    fontSize: 16,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pastEntriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  pastHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  entryCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '700',
  },
  entryMoodEmoji: {
    fontSize: 20,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});
