import { Text, useThemeColor } from '@/components/general/Themed';
import { useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';

type ValueSliderProps = {
  value: number;
  min?: number;
  max?: number;
  accent: string;
  onChange: (value: number) => void;
};

export function ValueSlider({ value, min = -100, max = 100, accent, onChange }: ValueSliderProps) {
  const [width, setWidth] = useState(0);
  const border = useThemeColor({}, 'border');
  const mutedText = useThemeColor({}, 'mutedText');

  const ratio = (value - min) / (max - min);
  const zeroRatio = (0 - min) / (max - min);

  const updateFromTouch = (event: GestureResponderEvent) => {
    if (!width) return;
    const x = Math.min(Math.max(event.nativeEvent.locationX, 0), width);
    onChange(Math.round(min + (x / width) * (max - min)));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color: value === 0 ? mutedText : accent }]}>
        {value > 0 ? `+${value}` : value}
      </Text>
      <View
        style={styles.touchArea}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={updateFromTouch}
        onResponderMove={updateFromTouch}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: value }}
      >
        <View pointerEvents="none" style={[styles.track, { backgroundColor: border }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: accent,
                left: `${Math.min(ratio, zeroRatio) * 100}%`,
                width: `${Math.abs(ratio - zeroRatio) * 100}%`,
              },
            ]}
          />
          <View style={[styles.zeroMark, { left: `${zeroRatio * 100}%`, backgroundColor: mutedText }]} />
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: ratio * width - 12, borderColor: accent }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  touchArea: {
    alignSelf: 'stretch',
    height: 32,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  zeroMark: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 12,
    marginLeft: -1,
    borderRadius: 1,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
  },
});
