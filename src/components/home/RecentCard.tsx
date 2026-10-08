import { Text, useThemeColor } from '@/components/general/Themed';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

type RecentCardProps = {
  title: string;
  subtitle: string;
  uri: string;
  onPress?: () => void;
};

export function RecentCard({ title, subtitle, uri, onPress }: RecentCardProps) {
  const card = useThemeColor({}, 'card');
  const mutedText = useThemeColor({}, 'mutedText');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.imageWrap, { backgroundColor: card }]}>
        <Image source={{ uri }} style={styles.image} contentFit="cover" transition={200} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: mutedText }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    gap: 4,
  },
  imageWrap: {
    width: 150,
    height: 190,
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
});
