import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { formatMultiLineText } from '../utils/textUtils';

export const DiaryScreen = ({ diaryEntries = [], onSaveEntry, onDeleteEntry }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('Happy');
  const [content, setContent] = useState('');
  const [showSavedList, setShowSavedList] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const today = new Date();
  const date = today.toISOString().split('T')[0];

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const moods = [
    { id: 'Happy', label: 'Happy', emoji: '😊' },
    { id: 'Calm', label: 'Calm', emoji: '😌' },
    { id: 'Neutral', label: 'Neutral', emoji: '😐' },
    { id: 'Sad', label: 'Sad', emoji: '😔' },
    { id: 'Stressed', label: 'Stressed', emoji: '😫' },
  ];

  // Dynamic Year & Month Lists from actual diary entries
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
    { label: 'All', val: 'All' },
    { label: 'Jan', val: '01' },
    { label: 'Feb', val: '02' },
    { label: 'Mar', val: '03' },
    { label: 'Apr', val: '04' },
    { label: 'May', val: '05' },
    { label: 'Jun', val: '06' },
    { label: 'Jul', val: '07' },
    { label: 'Aug', val: '08' },
    { label: 'Sep', val: '09' },
    { label: 'Oct', val: '10' },
    { label: 'Nov', val: '11' },
    { label: 'Dec', val: '12' },
  ];

  const filteredEntries = useMemo(() => {
    return diaryEntries.filter((entry) => {
      if (!entry.date) return true;
      const [y, m] = entry.date.split('-');
      if (selectedYear !== 'All' && y !== selectedYear) return false;
      if (selectedMonth !== 'All' && m !== selectedMonth) return false;
      return true;
    });
  }, [diaryEntries, selectedYear, selectedMonth]);

  const handleSave = () => {
    const cleanContent = formatMultiLineText(content);
    if (!cleanContent) {
      Alert.alert('Empty Reflection', 'Please write a few thoughts before saving.');
      return;
    }
    const newEntry = {
      id: 'd_' + Date.now(),
      date,
      formattedDate,
      title: title ? title.trim() : 'Daily Reflection',
      mood,
      content: cleanContent,
    };
    onSaveEntry(newEntry);
    setTitle('');
    setContent('');
    setShowSavedList(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete && onDeleteEntry) {
      onDeleteEntry(entryToDelete.id);
    }
    setEntryToDelete(null);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
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
            {showSavedList ? 'Write Entry' : 'Past Diary'}
          </Text>

        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {!showSavedList ? (
          <View style={styles.editorContainer}>
            {/* Date Card */}
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
              placeholder="e.g., Grateful for family, Achieved workout goal..."
              placeholderTextColor={theme.colors.textMuted}
              maxLength={20}
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
                maxLength={500}
                numberOfLines={10}
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
                    key={m.val}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedMonth === m.val ? theme.colors.primary : theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedMonth(m.val)}
                  >
                    <Text style={{ color: selectedMonth === m.val ? '#FFFFFF' : theme.colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Past Entries List */}
            {filteredEntries.length === 0 ? (
              <View style={styles.noEntriesBox}>
                <Text style={[styles.noEntriesText, { color: theme.colors.textMuted }]}>
                  No reflections found for the selected filter.
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
                  <View style={styles.entryHeader}>
                    <View style={styles.entryTitleRow}>
                      <Text style={styles.entryMoodEmoji}>
                        {moods.find((m) => m.id === entry.mood)?.emoji || '📝'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.entryTitleText, { color: theme.colors.textPrimary }]}>
                          {entry.title}
                        </Text>
                        <Text style={[styles.entryDateText, { color: theme.colors.textMuted }]}>
                          {entry.formattedDate || entry.date}
                        </Text>
                      </View>
                    </View>

                    {onDeleteEntry && (
                      <TouchableOpacity
                        onPress={() => setEntryToDelete(entry)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Icon name="trash" size={18} color={theme.colors.danger || '#EF4444'} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={[styles.entryBodyText, { color: theme.colors.textSecondary }]}>
                    {entry.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Styled Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={!!entryToDelete}
        title="Delete Journal Entry?"
        itemTitle={entryToDelete ? entryToDelete.title : ''}
        itemType="Diary Entry"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: '800',
  },
  historyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    paddingTop: 4,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateTextLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  todayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
  },
  titleInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    outlineStyle: 'none',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moodPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    width: '18%',
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  textEditorCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  editorArea: {
    padding: 14,
    fontSize: 14,
    height: 210,
    textAlignVertical: 'top',
    lineHeight: 20,
    outlineStyle: 'none',
  },
  saveBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
  noEntriesBox: {
    padding: 30,
    alignItems: 'center',
  },
  noEntriesText: {
    fontSize: 14,
  },
  entryCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryMoodEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  entryTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryDateText: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    marginLeft: 8,
  },
  entryBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
