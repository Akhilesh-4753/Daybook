import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';

export const DiaryScreen = ({ diaryEntries = [], onSaveEntry }) => {
  const { theme } = useTheme();

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('happy');
  const [content, setContent] = useState('');
  const [showSavedList, setShowSavedList] = useState(false);

  // Filters for Past Journal
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const moods = [
    { id: 'happy', emoji: '😃', label: 'Happy' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'sad', emoji: '😔', label: 'Sad' },
    { id: 'stressed', emoji: '😫', label: 'Stressed' },
  ];

  const yearsList = useMemo(() => {
    const yearsSet = new Set(['All']);
    diaryEntries.forEach((entry) => {
      if (entry.date) {
        const y = entry.date.split('-')[0];
        if (y) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet);
  }, [diaryEntries]);

  const monthsList = [
    { label: 'All Months', value: 'All' },
    { label: 'Jan', value: '01' },
    { label: 'Feb', value: '02' },
    { label: 'Mar', value: '03' },
    { label: 'Apr', value: '04' },
    { label: 'May', value: '05' },
    { label: 'Jun', value: '06' },
    { label: 'Jul', value: '07' },
    { label: 'Aug', value: '08' },
    { label: 'Sep', value: '09' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
  ];

  const filteredEntries = useMemo(() => {
    return diaryEntries.filter((entry) => {
      if (!entry.date) return true;
      const [y, m] = entry.date.split('-');
      const yearMatch = selectedYear === 'All' || y === selectedYear;
      const monthMatch = selectedMonth === 'All' || m === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [diaryEntries, selectedYear, selectedMonth]);

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
    setShowSavedList(true); // Automatically show past journal list after saving
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
            {/* Date Card (Default Current Date, Readonly) */}
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
                  Today's Journal Date
                </Text>
              </View>
              <View style={[styles.todayBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Text style={[styles.todayBadgeText, { color: theme.colors.primary }]}>Today</Text>
              </View>
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

            {/* Reflection Writing Area (Toolbar Removed) */}
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
            {/* Filter Bar: Year > Month */}
            <Text style={[styles.filterBarTitle, { color: theme.colors.textMuted }]}>
              FILTER PAST DIARY BY YEAR & MONTH
            </Text>
            <View style={styles.filtersRow}>
              {/* Year Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Year:</Text>
                {yearsList.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedYear === yr ? theme.colors.primary : theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedYear(yr)}
                  >
                    <Text style={{ color: selectedYear === yr ? '#FFFFFF' : theme.colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                      {yr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filtersRow}>
              {/* Month Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Month:</Text>
                {monthsList.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedMonth === m.value ? theme.colors.primary : theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedMonth(m.value)}
                  >
                    <Text style={{ color: selectedMonth === m.value ? '#FFFFFF' : theme.colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={[styles.pastHeaderTitle, { color: theme.colors.textPrimary }]}>
              Past Journal Entries ({filteredEntries.length})
            </Text>

            {filteredEntries.length === 0 ? (
              <View style={[styles.noEntriesBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Icon name="book" size={32} color={theme.colors.textMuted} />
                <Text style={[styles.noEntriesText, { color: theme.colors.textMuted }]}>
                  No diary entries found for the selected period.
                </Text>
              </View>
            ) : (
              filteredEntries.map((entry) => (
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
              ))
            )}
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
  todayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
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
    height: 180,
    textAlignVertical: 'top',
    lineHeight: 22,
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
  filterBarTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
    alignSelf: 'center',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  pastHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 14,
  },
  noEntriesBox: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noEntriesText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
