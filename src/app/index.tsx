import { Icon, type IconName } from "@/components/general/Icon";
import { Text, useThemeColor } from "@/components/general/Themed";
import { RecentCard } from "@/components/home/RecentCard";
import { ToolTile } from "@/components/home/ToolTile";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tool = {
  label: string;
  icon: IconName;
  accent: string;
};

const TOOLS: Tool[][] = [
  [
    { label: "Crop", icon: { ios: "crop", android: "crop" }, accent: "#4F8CFF" },
    { label: "Adjust", icon: { ios: "slider.horizontal.3", android: "tune" }, accent: "#22C55E" },
    { label: "Filters", icon: { ios: "camera.filters", android: "filter_vintage" }, accent: "#F59E0B" },
  ],
  [
    { label: "Text", icon: { ios: "textformat", android: "text_fields" }, accent: "#EC4899" },
    { label: "Draw", icon: { ios: "pencil.tip", android: "draw" }, accent: "#8B5CF6" },
    { label: "Enhance", icon: { ios: "wand.and.stars", android: "auto_fix_high" }, accent: "#06B6D4" },
  ],
];

const RECENT_EDITS = [
  { id: "1", title: "Mountain Sunrise", subtitle: "Edited 2h ago", uri: "https://picsum.photos/id/1018/400/500" },
  { id: "2", title: "City Lights", subtitle: "Edited yesterday", uri: "https://picsum.photos/id/1067/400/500" },
  { id: "3", title: "Ocean Calm", subtitle: "Edited 3 days ago", uri: "https://picsum.photos/id/1015/400/500" },
  { id: "4", title: "Forest Trail", subtitle: "Edited last week", uri: "https://picsum.photos/id/1043/400/500" },
];

export default function Index() {
  const text = useThemeColor({}, "text");
  const mutedText = useThemeColor({}, "mutedText");
  const card = useThemeColor({}, "card");
  const border = useThemeColor({}, "border");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, { color: mutedText }]}>Photo Studio</Text>
            <Text style={styles.title}>What will you{"\n"}create today?</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: card, borderColor: border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Icon name={{ ios: "gearshape", android: "settings" }} color={text} size={20} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Icon name={{ ios: "sparkles", android: "auto_awesome" }} color="#fff" size={14} />
            <Text style={styles.heroBadgeText}>New project</Text>
          </View>
          <Text style={styles.heroTitle}>Start editing</Text>
          <Text style={styles.heroSubtitle}>
            Pick a photo to crop, tune colors, add filters and more.
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Icon name={{ ios: "photo.on.rectangle", android: "photo_library" }} color="#1a1a2e" size={18} />
              <Text style={styles.primaryButtonText}>Open Gallery</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Take photo"
              style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Icon name={{ ios: "camera", android: "photo_camera" }} color="#fff" size={20} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick tools</Text>
          <View style={styles.grid}>
            {TOOLS.map((row, i) => (
              <View key={i} style={styles.gridRow}>
                {row.map((tool) => (
                  <ToolTile key={tool.label} {...tool} />
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent edits</Text>
            <Pressable accessibilityRole="button" style={styles.seeAll}>
              <Text style={[styles.seeAllText, { color: mutedText }]}>See all</Text>
              <Icon name={{ ios: "chevron.right", android: "chevron_right" }} color={mutedText} size={14} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
            style={styles.recentScroll}
          >
            {RECENT_EDITS.map((item) => (
              <RecentCard key={item.id} title={item.title} subtitle={item.subtitle} uri={item.uri} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    padding: 22,
    gap: 10,
    borderRadius: 28,
    borderCurve: "continuous",
    overflow: "hidden",
    experimental_backgroundImage:
      "linear-gradient(135deg, #6D5DFC 0%, #B44CF0 55%, #FF6B9A 100%)",
    boxShadow: "0 12px 32px rgba(109, 93, 252, 0.35)",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    lineHeight: 21,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "#fff",
  },
  primaryButtonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  recentScroll: {
    marginHorizontal: -20,
  },
  recentList: {
    paddingHorizontal: 20,
    gap: 14,
  },
});
