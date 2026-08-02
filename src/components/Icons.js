import { StyleSheet, Text, View } from 'react-native';

export const Icon = ({ name, size = 22, color = '#6366F1', style }) => {
  // Calendar Icon: Red top header, White body, Black date text
  if (name === 'calendar') {
    const s = Math.max(22, size);
    return (
      <View style={[styles.container, { width: s, height: s }, style]}>
        <View
          style={{
            width: s,
            height: s,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.12)',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            elevation: 2,
          }}
        >
          {/* Top Red Header */}
          <View style={{ height: '36%', backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '55%' }}>
              <View style={{ width: 2, height: 3, borderRadius: 1, backgroundColor: '#FFFFFF' }} />
              <View style={{ width: 2, height: 3, borderRadius: 1, backgroundColor: '#FFFFFF' }} />
            </View>
          </View>
          {/* Bottom White Body with Black Date Text */}
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: s * 0.42, fontWeight: '900', color: '#111827', marginTop: -1 }}>
              31
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Premium User Icon: Colorful badge background with crisp white silhouette
  if (name === 'user') {
    const s = Math.max(22, size);
    const headSize = Math.round(s * 0.36);
    const shoulderW = Math.round(s * 0.76);
    const shoulderH = Math.round(s * 0.36);

    return (
      <View style={[styles.container, { width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
        <View
          style={{
            width: s,
            height: s,
            borderRadius: s / 2,
            backgroundColor: color || '#6366F1',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Head Circle */}
          <View
            style={{
              width: headSize,
              height: headSize,
              borderRadius: headSize / 2,
              backgroundColor: '#FFFFFF',
              marginBottom: 1.5,
            }}
          />
          {/* Shoulder Arch */}
          <View
            style={{
              width: shoulderW,
              height: shoulderH,
              borderTopLeftRadius: shoulderW / 2,
              borderTopRightRadius: shoulderW / 2,
              backgroundColor: '#FFFFFF',
            }}
          />
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
    note: '📝',
    volumeOff: '🔕',
    music: '🎶',
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
    eyeOff: '👁️‍🗨️',
    whatsapp: '💬',
    instagram: '📸',
    linkedin: '💼',
    github: '💻',
    shield: '🛡️',
    sun: '☀️',
    moon: '🌙',
  };

  if (name === 'eye') {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <View
          style={{
            width: size,
            height: size * 0.58,
            borderRadius: size * 0.29,
            borderWidth: 1.8,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: size * 0.32,
              height: size * 0.32,
              borderRadius: size * 0.16,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'eyeOff') {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <View
          style={{
            width: size,
            height: size * 0.58,
            borderRadius: size * 0.29,
            borderWidth: 1.8,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: size * 0.12,
              backgroundColor: color,
              opacity: 0.4,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: size * 1.35,
              height: 2,
              backgroundColor: color,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      </View>
    );
  }

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
