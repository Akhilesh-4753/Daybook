import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Icon = ({ name, size = 22, color = '#6366F1', style }) => {
  // Sleek Vector Spiral Desk Calendar Icon (No July 17 text)
  if (name === 'calendar') {
    const boxSize = Math.max(16, size);
    return (
      <View style={[styles.container, { width: boxSize, height: boxSize + 2 }, style]}>
        {/* Top Spiral Binder Rings */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: boxSize * 0.6, zIndex: 10, marginBottom: -3 }}>
          <View style={{ width: 2.5, height: 4, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: 2.5, height: 4, backgroundColor: color, borderRadius: 1 }} />
        </View>
        
        {/* Calendar Body */}
        <View
          style={{
            width: boxSize,
            height: boxSize,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: color,
            overflow: 'hidden',
          }}
        >
          {/* Header Bar */}
          <View style={{ height: '32%', backgroundColor: color }} />
          
          {/* Grid Cells */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 2,
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={{ width: 2.5, height: 2.5, borderRadius: 1, backgroundColor: color }} />
            <View style={{ width: 2.5, height: 2.5, borderRadius: 1, backgroundColor: color }} />
            <View style={{ width: 2.5, height: 2.5, borderRadius: 1, backgroundColor: color }} />
            <View style={{ width: 2.5, height: 2.5, borderRadius: 1, backgroundColor: color }} />
          </View>
        </View>
      </View>
    );
  }

  const iconMap = {
    home: '🏠',
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
    whatsapp: '💬',
    instagram: '📸',
    linkedin: '💼',
    github: '💻',
    shield: '🛡️',
  };

  const symbol = iconMap[name] || '📌';

  return (
    <View style={[styles.container, { width: size + 4, height: size + 4 }, style]}>
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
