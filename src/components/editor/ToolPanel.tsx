import { Icon, type IconName } from '@/components/general/Icon';
import { Text, useThemeColor } from '@/components/general/Themed';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { EditorTool } from './tools';
import { ValueSlider } from './ValueSlider';

type Option = {
  id: string;
  label: string;
  icon?: IconName;
};

const CROP_RATIOS: Option[] = [
  { id: 'free', label: 'Free' },
  { id: 'original', label: 'Original' },
  { id: '1:1', label: '1:1', icon: { ios: 'square', android: 'crop_square' } },
  { id: '4:5', label: '4:5' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
];

const ADJUSTMENTS: Option[] = [
  { id: 'brightness', label: 'Brightness', icon: { ios: 'sun.max', android: 'light_mode' } },
  { id: 'contrast', label: 'Contrast', icon: { ios: 'circle.lefthalf.filled', android: 'contrast' } },
  { id: 'saturation', label: 'Saturation', icon: { ios: 'drop', android: 'water_drop' } },
  { id: 'warmth', label: 'Warmth', icon: { ios: 'thermometer.medium', android: 'thermostat' } },
  { id: 'sharpen', label: 'Sharpen', icon: { ios: 'triangle', android: 'details' } },
];

const FILTERS: (Option & { tint: string })[] = [
  { id: 'original', label: 'Original', tint: 'transparent' },
  { id: 'vivid', label: 'Vivid', tint: 'rgba(255, 80, 120, 0.25)' },
  { id: 'warm', label: 'Warm', tint: 'rgba(255, 160, 50, 0.3)' },
  { id: 'cool', label: 'Cool', tint: 'rgba(60, 140, 255, 0.3)' },
  { id: 'fade', label: 'Fade', tint: 'rgba(255, 255, 255, 0.35)' },
  { id: 'noir', label: 'Noir', tint: 'rgba(0, 0, 0, 0.45)' },
];

const TEXT_OPTIONS: Option[] = [
  { id: 'add', label: 'Add text', icon: { ios: 'plus', android: 'add' } },
  { id: 'font', label: 'Font', icon: { ios: 'textformat.size', android: 'font_download' } },
  { id: 'color', label: 'Color', icon: { ios: 'paintpalette', android: 'format_color_text' } },
];

const BRUSHES: Option[] = [
  { id: 'pen', label: 'Pen', icon: { ios: 'pencil.tip', android: 'brush' } },
  { id: 'marker', label: 'Marker', icon: { ios: 'highlighter', android: 'ink_marker' } },
  { id: 'eraser', label: 'Eraser', icon: { ios: 'eraser', android: 'ink_eraser' } },
];

const ENHANCE_OPTIONS: Option[] = [
  { id: 'auto', label: 'Auto', icon: { ios: 'wand.and.stars', android: 'auto_fix_high' } },
  { id: 'hdr', label: 'HDR', icon: { ios: 'camera.aperture', android: 'hdr_on' } },
  { id: 'portrait', label: 'Portrait', icon: { ios: 'person.crop.square', android: 'portrait' } },
];

const SWATCHES = ['#ffffff', '#000000', '#FF4D6D', '#FFB703', '#22C55E', '#4F8CFF', '#8B5CF6'];

type ToolPanelProps = {
  tool: EditorTool;
  uri: string;
};

export function ToolPanel({ tool, uri }: ToolPanelProps) {
  switch (tool.id) {
    case 'crop':
      return <CropPanel accent={tool.accent} />;
    case 'adjust':
      return <AdjustPanel accent={tool.accent} />;
    case 'filters':
      return <FiltersPanel accent={tool.accent} uri={uri} />;
    case 'text':
      return <ChipsPanel options={TEXT_OPTIONS} accent={tool.accent} withSwatches />;
    case 'draw':
      return <ChipsPanel options={BRUSHES} accent={tool.accent} withSwatches />;
    case 'enhance':
      return <ChipsPanel options={ENHANCE_OPTIONS} accent={tool.accent} />;
  }
}

function CropPanel({ accent }: { accent: string }) {
  const text = useThemeColor({}, 'text');
  const card = useThemeColor({}, 'card');

  return (
    <View style={styles.row}>
      <ChipsRow options={CROP_RATIOS} accent={accent} style={styles.flex} />
      <View style={styles.cropActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rotate"
          style={[styles.roundButton, { backgroundColor: card }]}
        >
          <Icon name={{ ios: 'rotate.right', android: 'rotate_right' }} color={text} size={18} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Flip"
          style={[styles.roundButton, { backgroundColor: card }]}
        >
          <Icon name={{ ios: 'arrow.left.and.right.righttriangle.left.righttriangle.right', android: 'flip' }} color={text} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function AdjustPanel({ accent }: { accent: string }) {
  const [activeId, setActiveId] = useState(ADJUSTMENTS[0].id);
  const [values, setValues] = useState<Record<string, number>>({});

  return (
    <View style={styles.column}>
      <View style={styles.sliderWrap}>
        <ValueSlider
          value={values[activeId] ?? 0}
          accent={accent}
          onChange={(v) => setValues((prev) => ({ ...prev, [activeId]: v }))}
        />
      </View>
      <ChipsRow
        options={ADJUSTMENTS}
        accent={accent}
        activeId={activeId}
        onSelect={setActiveId}
        modified={(id) => (values[id] ?? 0) !== 0}
      />
    </View>
  );
}

function FiltersPanel({ accent, uri }: { accent: string; uri: string }) {
  const [activeId, setActiveId] = useState('original');
  const mutedText = useThemeColor({}, 'mutedText');
  const text = useThemeColor({}, 'text');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {FILTERS.map((filter) => {
        const isActive = filter.id === activeId;
        return (
          <Pressable
            key={filter.id}
            onPress={() => setActiveId(filter.id)}
            accessibilityRole="button"
            accessibilityLabel={`${filter.label} filter`}
            accessibilityState={{ selected: isActive }}
            style={styles.filterItem}
          >
            <View style={[styles.filterThumb, { borderColor: isActive ? accent : 'transparent' }]}>
              <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: filter.tint }]} />
            </View>
            <Text style={[styles.filterLabel, { color: isActive ? text : mutedText }]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ChipsPanel({
  options,
  accent,
  withSwatches,
}: {
  options: Option[];
  accent: string;
  withSwatches?: boolean;
}) {
  const [color, setColor] = useState(SWATCHES[0]);
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.column}>
      <ChipsRow options={options} accent={accent} />
      {withSwatches && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatches}>
          {SWATCHES.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => setColor(swatch)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${swatch}`}
              accessibilityState={{ selected: swatch === color }}
              style={[
                styles.swatchRing,
                { borderColor: swatch === color ? accent : 'transparent' },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: swatch, borderColor: border }]} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function ChipsRow({
  options,
  accent,
  activeId,
  onSelect,
  modified,
  style,
}: {
  options: Option[];
  accent: string;
  activeId?: string;
  onSelect?: (id: string) => void;
  modified?: (id: string) => boolean;
  style?: object;
}) {
  const [localActive, setLocalActive] = useState(options[0].id);
  const selected = activeId ?? localActive;
  const text = useThemeColor({}, 'text');
  const card = useThemeColor({}, 'card');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
      style={style}
    >
      {options.map((option) => {
        const isActive = option.id === selected;
        return (
          <Pressable
            key={option.id}
            onPress={() => (onSelect ? onSelect(option.id) : setLocalActive(option.id))}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: isActive ? accent : card, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {option.icon && <Icon name={option.icon} color={isActive ? '#fff' : text} size={16} />}
            <Text style={[styles.chipLabel, { color: isActive ? '#fff' : text }]}>{option.label}</Text>
            {modified?.(option.id) && (
              <View style={[styles.dot, { backgroundColor: isActive ? '#fff' : accent }]} />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    gap: 12,
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cropActions: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
    paddingLeft: 8,
  },
  roundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderWrap: {
    paddingHorizontal: 28,
  },
  filterItem: {
    alignItems: 'center',
    gap: 6,
  },
  filterThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  swatches: {
    paddingHorizontal: 16,
    gap: 6,
  },
  swatchRing: {
    padding: 3,
    borderRadius: 18,
    borderWidth: 2,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
