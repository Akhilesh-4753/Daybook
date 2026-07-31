import { StyleSheet, Text, View } from 'react-native';

export const Icon = ({ name, size = 22, color = '#6366F1' }) => {
  const iconMap = {
    home: '🏠',
    calendar: '📅',
    diary: '📖',
    reports: '📊',
    more: '⚙️',
    plus: '➕',
    check: '✓',
    bell: '🔔',
    droplet: '💧',
    dumbbell: '🏋️',
    book: '📚',
    sparkles: '🧘',
    ban: '🚫',
    fire: '🔥',
    filter: '🔍',
    clock: '⏰',
    heart: '❤️',
    star: '⭐',
    target: '🎯',
    chevronRight: '›',
    close: '✕',
    edit: '✏️',
    trash: '🗑️',
    user: '👤',
    lock: '🔒',
    cloud: '☁️',
    palette: '🎨',
    refresh: '🔄',
    backspace: '⌫',
    delete: '⌫',
    walking: '🚶',
    dog: '🐕',
    writing: '✍️',
    watching: '👁️',
    mirror: '🪞',
    email: '✉️',
    mail: '✉️',
    eye: '👁️',
    eyeOff: '🙈',
  };

  const symbol = iconMap[name] || '📌';

  return (
    <View style={[styles.container, { width: size + 4, height: size + 4 }]}>
      <Text style={[styles.iconText, { fontSize: size - 2, color }]}>{symbol}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
