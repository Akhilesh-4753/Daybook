import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { DiaryDetailModal } from '../components/DiaryDetailModal';
import { Icon } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';

export const DiaryScreen = ({ diaryEntries = [], onSaveEntry, onUpdateEntry, onDeleteEntry }) => {
  const { theme } = useTheme();

  const [mood, setMood] = useState('Happy');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState(['No Tag']);
  const [contentError, setContentError] = useState('');
  const [showSavedList, setShowSavedList] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [selectedEntryDetail, setSelectedEntryDetail] = useState(null);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedEntryDetail) {
        setSelectedEntryDetail(null);
        return true;
      }
      if (entryToEdit) {
        setEntryToEdit(null);
        setContent('');
        setSelectedTags(['No Tag']);
        setMood('Happy');
        return true;
      }
      if (showSavedList) {
        setShowSavedList(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedEntryDetail, entryToEdit, showSavedList]);

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

  const tags = [
    { id: 'No Tag', label: 'No Tag', emoji: '🏷️' },
    { id: 'Food', label: 'Food', emoji: '🍽️' },
    { id: 'Learning', label: 'Learning', emoji: '📚' },
    { id: 'Entertainment', label: 'Entertainment', emoji: '🎬' },
    { id: 'Meeting', label: 'Meeting', emoji: '🤝' },
    { id: 'Travel', label: 'Travel', emoji: '✈️' },
    { id: 'Office', label: 'Office', emoji: '🏢' },
    { id: 'Shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'Event', label: 'Event', emoji: '🎉' },
    { id: 'Health', label: 'Health', emoji: '💪' },
  ];

  const formatIsoDateTime = (isoString) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const datePart = d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      return `${datePart} • ${timePart}`;
    } catch {
      return '';
    }
  };

  // Format entry date as: Created: Wednesday, Aug 5, 2026 • 05:15 PM or Modified: Thursday, Aug 6, 2026 • 09:30 AM
  const formatEntryDateTime = (entry) => {
    if (entry.modifiedAt) {
      const formatted = formatIsoDateTime(entry.modifiedAt);
      if (formatted) return `Modified: ${formatted}`;
    }
    if (entry.createdAt) {
      const formatted = formatIsoDateTime(entry.createdAt);
      if (formatted) return `Created: ${formatted}`;
    }

    try {
      const d = entry.date ? new Date(entry.date + 'T12:00:00') : new Date();
      const datePart = d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
      });
      const timePart = entry.time || '';
      const formatted = timePart ? `${datePart} • ${timePart}` : datePart;
      return `Created: ${formatted}`;
    } catch {
      return `Created: ${entry.formattedDate || entry.date || ''}`;
    }
  };

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

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      if (tagId === 'No Tag') return ['No Tag'];
      const withoutNoTag = prev.filter((t) => t !== 'No Tag');
      if (withoutNoTag.includes(tagId)) {
        const next = withoutNoTag.filter((t) => t !== tagId);
        return next.length === 0 ? ['No Tag'] : next;
      }
      return [...withoutNoTag, tagId];
    });
  };

  const handleStartEdit = (entry) => {
    setEntryToEdit(entry);
    setContent(entry.content ? entry.content.replace(/^•\s*/gm, '') : '');
    setMood(entry.mood || 'Happy');
    const existingTags = entry.tags && entry.tags.length > 0
      ? entry.tags
      : entry.tag
        ? [entry.tag]
        : ['No Tag'];
    setSelectedTags(existingTags);
    setContentError('');
    setShowSavedList(false);
  };

  const handleSave = () => {
    const cleanContent = content.trim();
    if (!cleanContent) {
      setContentError('Please write something before saving.');
      return;
    }
    const now = new Date();
    const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const firstTag = selectedTags.find((t) => t !== 'No Tag') || 'No Tag';

    if (entryToEdit) {
      const updatedEntry = {
        ...entryToEdit,
        mood,
        tags: selectedTags,
        content: cleanContent,
        title: firstTag !== 'No Tag' ? firstTag : (entryToEdit.title || 'Daily Reflection'),
        modifiedAt: new Date().toISOString(),
      };
      if (onUpdateEntry) {
        onUpdateEntry(updatedEntry);
      } else if (onSaveEntry) {
        onSaveEntry(updatedEntry);
      }
      setEntryToEdit(null);
    } else {
      const newEntry = {
        id: 'd_' + Date.now(),
        date,
        formattedDate,
        time: timePart,
        title: firstTag !== 'No Tag' ? firstTag : 'Daily Reflection',
        mood,
        tags: selectedTags,
        content: cleanContent,
        createdAt: new Date().toISOString(),
        modifiedAt: null,
      };
      onSaveEntry(newEntry);
    }

    setContent('');
    setSelectedTags(['No Tag']);
    setMood('Happy');
    setContentError('');
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
            {showSavedList ? 'Write Diary' : 'Past Diary'}
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
            {entryToEdit && (
              <View style={[styles.editingBanner, { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: theme.colors.primary }]}>
                <Text style={[styles.editingBannerText, { color: theme.colors.primary }]}>
                  ✏️ Editing Diary Entry
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEntryToEdit(null);
                    setContent('');
                    setSelectedTags(['No Tag']);
                    setMood('Happy');
                  }}
                >
                  <Text style={styles.cancelEditBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
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

            {/* Diary Input — TOP */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Daily Memories &amp; Thoughts
            </Text>
            <View
              style={[
                styles.textEditorCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: contentError ? '#EF4444' : theme.colors.border,
                  borderWidth: contentError ? 2 : 1,
                },
              ]}
            >
              <TextInput
                style={[styles.editorArea, { color: theme.colors.textPrimary }]}
                placeholder="Write about your daily highlights, achievements, learnings, or thoughts..."
                placeholderTextColor={theme.colors.textMuted}
                multiline={true}
                maxLength={1000}
                numberOfLines={10}
                value={content}
                autoCorrect={false}
                autoCapitalize="sentences"
                spellCheck={false}
                autoComplete="off"
                dataDetectorTypes="none"
                textContentType="none"
                importantForAutofill="no"
                onChangeText={(text) => {
                  // Ensure no bullet dots or unwanted symbols are added on newline
                  const cleaned = text.replace(/[•\u2022]/g, '');
                  setContent(cleaned);
                  if (cleaned.trim() && contentError) setContentError('');
                }}
              />
            </View>
            {contentError ? (
              <Text style={styles.validationError}>⚠️ {contentError}</Text>
            ) : null}

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

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tags (select multiple)</Text>
            <View style={styles.tagsGrid}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor:
                        selectedTags.includes(tag.id)
                          ? 'rgba(99, 102, 241, 0.18)'
                          : theme.colors.card,
                      borderColor:
                        selectedTags.includes(tag.id) ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  <Text
                    style={[
                      styles.tagLabel,
                      {
                        color:
                          selectedTags.includes(tag.id)
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {entryToEdit ? 'Update Diary Entry' : 'Save Diary Entry'}
              </Text>
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
              filteredEntries.map((entry) => {
                const moodObj = moods.find((m) => m.id === entry.mood);
                // Support both old single tag and new multi-tag format
                const entryTags = entry.tags && entry.tags.length > 0
                  ? entry.tags
                  : entry.tag
                    ? [entry.tag]
                    : ['No Tag'];
                const tagObjs = entryTags.map((tid) => tags.find((t) => t.id === tid) || tags[0]);
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[
                      styles.entryCard,
                      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    ]}
                    onPress={() => setSelectedEntryDetail(entry)}
                    activeOpacity={0.88}
                  >
                    {/* Header Row: Date & Time + Edit/Delete Actions */}
                    <View style={styles.entryHeaderRow}>
                      <Text style={[styles.entryDateTime, { color: theme.colors.textMuted }]}>
                        {formatEntryDateTime(entry)}
                      </Text>
                      <View style={styles.entryActionsRow}>
                        <TouchableOpacity
                          style={[styles.entryActionBtn, { backgroundColor: 'rgba(99,102,241,0.12)', borderColor: theme.colors.primary }]}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            handleStartEdit(entry);
                          }}
                          activeOpacity={0.75}
                        >
                          <Icon name="edit" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                        {onDeleteEntry && (
                          <TouchableOpacity
                            style={[styles.entryActionBtn, { backgroundColor: 'rgba(239,68,68,0.10)', borderColor: '#EF4444' }]}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              setEntryToDelete(entry);
                            }}
                            activeOpacity={0.75}
                          >
                            <Icon name="trash" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Main Row: Mood Circle + Diary Content */}
                    <View style={styles.entryTopRow}>
                      {/* Mood circle */}
                      <View style={[styles.entryMoodCircle, { backgroundColor: 'rgba(99,102,241,0.10)', borderColor: theme.colors.primary }]}>
                        <Text style={styles.entryMoodEmoji}>
                          {moodObj?.emoji || '📝'}
                        </Text>
                        <Text style={[styles.entryMoodName, { color: theme.colors.primary }]}>
                          {moodObj?.label || 'Mood'}
                        </Text>
                      </View>

                      {/* Diary text */}
                      <Text style={[styles.entryBodyText, { color: theme.colors.textSecondary }]} numberOfLines={5}>
                        {entry.content ? entry.content.replace(/^•\s*/gm, '') : ''}
                      </Text>
                    </View>

                    {/* Footer Row: Tag Chips */}
                    <View style={styles.entryTagsRow}>
                      {tagObjs.map((tagObj) => (
                        <View
                          key={tagObj.id}
                          style={[styles.entryTagChip, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: theme.colors.primary }]}
                        >
                          <Text style={styles.entryTagEmoji}>{tagObj.emoji}</Text>
                          <Text style={[styles.entryTagLabel, { color: theme.colors.primary }]}>{tagObj.label}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })
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

      {/* Full Diary Detail View Modal */}
      <DiaryDetailModal
        visible={!!selectedEntryDetail}
        entry={selectedEntryDetail}
        onClose={() => setSelectedEntryDetail(null)}
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
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  validationError: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 2,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  tagEmoji: {
    fontSize: 14,
  },
  tagLabel: {
    fontSize: 11,
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
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  entryMoodCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  entryMoodEmoji: {
    fontSize: 22,
  },
  entryMoodName: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  entryBodyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    paddingTop: 2,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 6,
  },
  entryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  entryActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryDateTime: {
    fontSize: 11,
    fontWeight: '700',
  },
  entryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  entryTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  entryTagEmoji: {
    fontSize: 13,
  },
  entryTagLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  editingBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cancelEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '600',
  },
});
