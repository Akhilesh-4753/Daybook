import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import { Icon } from './Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH - 32;
const CONTAINER_HEIGHT = 420;
const DEFAULT_CROP_SIZE = Math.round(CONTAINER_WIDTH * 0.65); // Default 65%

export const ImageCropModal = ({ visible, imageUri, onClose, onCropDone }) => {
  const [rotation, setRotation] = useState(0);

  // Dynamic Crop Box Size state (min: 120px, max: CONTAINER_WIDTH - 20)
  const [cropSize, setCropSize] = useState(DEFAULT_CROP_SIZE);

  // Bounds for 4-direction movements
  const maxCropX = CONTAINER_WIDTH - cropSize;
  const maxCropY = CONTAINER_HEIGHT - cropSize;

  // Initial Crop position: Centered horizontally, Top vertically
  const [cropPos, setCropPos] = useState({
    x: Math.round((CONTAINER_WIDTH - DEFAULT_CROP_SIZE) / 2),
    y: 0,
  });

  const cropPosRef = useRef({ x: Math.round((CONTAINER_WIDTH - DEFAULT_CROP_SIZE) / 2), y: 0 });
  cropPosRef.current = cropPos;

  // Damped PanResponder (0.65 speed factor for smooth 4-way control)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const speedDamping = 0.65;
        let newX = cropPosRef.current.x + gestureState.dx * speedDamping;
        let newY = cropPosRef.current.y + gestureState.dy * speedDamping;

        const currentMaxX = CONTAINER_WIDTH - cropSize;
        const currentMaxY = CONTAINER_HEIGHT - cropSize;

        if (newX < 0) newX = 0;
        if (newX > currentMaxX) newX = currentMaxX;

        if (newY < 0) newY = 0;
        if (newY > currentMaxY) newY = currentMaxY;

        setCropPos({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDecreaseSize = () => {
    setCropSize((prev) => {
      const nextSize = Math.max(prev - 30, 120); // Shrink box down to 120px for tight face/head crop
      return nextSize;
    });
  };

  const handleIncreaseSize = () => {
    setCropSize((prev) => {
      const nextSize = Math.min(prev + 30, CONTAINER_WIDTH - 20); // Expand box up to image bounds
      return nextSize;
    });
  };

  const handleDone = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.Image) {
      try {
        const croppedBase64 = await cropImageCanvas(
          imageUri,
          cropPos.x,
          cropPos.y,
          cropSize,
          CONTAINER_WIDTH,
          CONTAINER_HEIGHT
        );
        onCropDone(croppedBase64);
        onClose();
        return;
      } catch (e) {
        console.warn('Canvas crop failed, fallback to original URI:', e);
      }
    }
    onCropDone(imageUri);
    onClose();
  };

  // Canvas Image Crop Function
  const cropImageCanvas = (uri, cX, cY, cSize, contW, contH) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const OUTPUT_SIZE = 400; // Crisp, high quality profile output
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext('2d');

        const scaleX = img.naturalWidth / contW;
        const scaleY = img.naturalHeight / contH;

        const sx = cX * scaleX;
        const sy = cY * scaleY;
        const sWidth = cSize * scaleX;
        const sHeight = cSize * scaleY;

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(croppedDataUrl);
      };
      img.onerror = () => resolve(uri);
      img.src = uri;
    });
  };

  if (!imageUri) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Crop Profile Picture</Text>
          <Text style={styles.headerSub}>Drag box to position • Use size buttons to shrink for head only</Text>
        </View>

        {/* Main Crop View Area */}
        <View style={styles.cropArea}>
          <View style={styles.imageContainer}>
            {/* Full Preview Image */}
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.fullImage,
                {
                  transform: [{ rotate: `${rotation}deg` }],
                },
              ]}
              resizeMode="contain"
            />

            {/* Draggable & Resizable Movable Crop Box */}
            <View
              {...panResponder.panHandlers}
              style={[
                styles.movableCropBox,
                {
                  width: cropSize,
                  height: cropSize,
                  top: cropPos.y,
                  left: cropPos.x,
                },
              ]}
            >
              {/* 3x3 Grid Lines */}
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>

              {/* Corner Brackets */}
              <View style={[styles.cornerBracket, styles.topLeft]} />
              <View style={[styles.cornerBracket, styles.topRight]} />
              <View style={[styles.cornerBracket, styles.bottomLeft]} />
              <View style={[styles.cornerBracket, styles.bottomRight]} />

              {/* Move Indicator Handle */}
              <View style={styles.moveHandlePill}>
                <Text style={styles.moveHandleText}>✥ Drag Any Direction</Text>
              </View>
            </View>
          </View>

          {/* Box Size Adjust Toolbar */}
          <View style={styles.sizeControlRow}>
            <Text style={styles.sizeLabel}>Border Box Size:</Text>
            <TouchableOpacity style={styles.sizeBtn} onPress={handleDecreaseSize} activeOpacity={0.7}>
              <Text style={styles.sizeBtnText}>➖ Smaller (Head Only)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sizeBtn} onPress={handleIncreaseSize} activeOpacity={0.7}>
              <Text style={styles.sizeBtnText}>➕ Larger</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clean WhatsApp Bottom Control Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rotateBtn} onPress={handleRotate} activeOpacity={0.8}>
            <Icon name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  cropArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  imageContainer: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  movableCropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  moveHandlePill: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  moveHandleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sizeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 10,
  },
  sizeLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  sizeBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sizeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  rotateBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#10B981',
    borderRadius: 14,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
