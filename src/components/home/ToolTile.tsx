import { Icon, type IconName } from '@/components/general/Icon';
import { Text, useThemeColor } from '@/components/general/Themed';
import { Pressable, StyleSheet, View } from 'react-native';

type ToolTileProps = {
  label: string;
  icon: IconName;
  accent: string;
  onPress?: () => void;
};

export function ToolTile({ label, icon, accent, onPress }: ToolTileProps) {
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: card, borderColor: border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <Icon name={icon} color={accent} size={22} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
