import { Icon } from '@/components/general/Icon';
import { Text, useThemeColor } from '@/components/general/Themed';
import { Pressable, StyleSheet, View } from 'react-native';
import { EDITOR_TOOLS, type EditorToolId } from './tools';

type EditorToolbarProps = {
  activeTool: EditorToolId | null;
  onSelect: (tool: EditorToolId) => void;
};

export function EditorToolbar({ activeTool, onSelect }: EditorToolbarProps) {
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  return (
    <View style={styles.list}>
      {EDITOR_TOOLS.map((tool) => {
        const isActive = tool.id === activeTool;
        return (
          <Pressable
            key={tool.id}
            onPress={() => onSelect(tool.id)}
            accessibilityRole="tab"
            accessibilityLabel={tool.label}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: isActive ? tool.accent : 'transparent' },
              ]}
            >
              <Icon name={tool.icon} color={isActive ? '#fff' : text} size={22} />
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? text : mutedText, fontWeight: isActive ? '700' : '500' },
              ]}
            >
              {tool.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
  },
});
