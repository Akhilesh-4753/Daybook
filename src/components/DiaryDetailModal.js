import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const DiaryDetailModal = ({ visible, entry, onClose }) => {
  const { theme } = useTheme();

  if (!visible || !entry) return null;

  const moods = [
    { id: 'Happy', label: 'Happy', emoji: '😊' },
    { id: 'Calm', label: 'Calm', emoji: '😌' },
    { id: 'Neutral', label: 'Neutral', emoji: '😐' },
    { id: 'Sad', label: 'Sad', emoji: '😔' },
    { id: 'Stressed', label: 'Stressed', emoji: '😫' },
  ];

  const tagsList = [
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

  const moodObj = moods.find((m) => m.id === entry.mood);
  const entryTags = entry.tags && entry.tags.length > 0
    ? entry.tags
    : entry.tag
    ? [entry.tag]
    : ['No Tag'];
  const tagObjs = entryTags.map((tid) => tagsList.find((t) => t.id === tid) || tagsList[0]);

  // Format date and time string e.g. Wednesday, Aug 5, 2026 • 05:15 PM
  const formatDateTime = () => {
    try {
      const d = entry.date ? new Date(entry.date + 'T12:00:00') : new Date();
      const datePart = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = entry.time || '';
      return timePart ? `${datePart} • ${timePart}` : datePart;
    } catch {
      return entry.formattedDate || entry.date || '';
    }
  };

  const cleanContent = entry.content ? entry.content.replace(/^•\s*/gm, '') : '';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop overlay tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Container */}
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
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerIcon}>📖</Text>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                Diary Reflection
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Icon name="close" size={16} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Info Banner: Mood & Date/Time */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.colors.surfaceVariant || 'rgba(99, 102, 241, 0.06)',
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Mood Circle */}
              <View style={styles.moodSection}>
                <View
                  style={[
                    styles.moodCircle,
                    {
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{moodObj?.emoji || '📝'}</Text>
                </View>
                <Text style={[styles.moodLabel, { color: theme.colors.primary }]}>
                  {moodObj?.label || 'Mood'}
                </Text>
              </View>

              {/* Date & Time */}
              <View style={styles.dateSection}>
                <Text style={[styles.dateLabelText, { color: theme.colors.textMuted }]}>
                  DATE & TIME
                </Text>
                <Text style={[styles.dateTimeValue, { color: theme.colors.textPrimary }]}>
                  {formatDateTime()}
                </Text>
              </View>
            </View>

            {/* Diary Full Text Content */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
              DIARY CONTENT
            </Text>
            <View
              style={[
                styles.contentBox,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.contentText, { color: theme.colors.textPrimary }]}>
                {cleanContent}
              </Text>
            </View>

            {/* Tags Section */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
              TAGS
            </Text>
            <View style={styles.tagsContainer}>
              {tagObjs.map((tag) => (
                <View
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  <Text style={[styles.tagLabel, { color: theme.colors.primary }]}>
                    {tag.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    gap: 16,
  },
  moodSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moodEmoji: {
    fontSize: 26,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateSection: {
    flex: 1,
    justifyContent: 'center',
  },
  dateLabelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  contentBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    minHeight: 100,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  tagEmoji: {
    fontSize: 14,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomCloseBtn: {
    height: 48,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
