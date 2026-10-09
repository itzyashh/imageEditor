import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { ToolPanel } from '@/components/editor/ToolPanel'
import { EDITOR_TOOLS, type EditorToolId } from '@/components/editor/tools'
import { Icon } from '@/components/general/Icon'
import { Text, useThemeColor } from '@/components/general/Themed'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Editor = () => {

    const {uri} = useLocalSearchParams<{uri : string}>()
    const [activeTool, setActiveTool] = useState<EditorToolId | null>('adjust')

    const text = useThemeColor({}, 'text')
    const card = useThemeColor({}, 'card')
    const border = useThemeColor({}, 'border')

    const tool = EDITOR_TOOLS.find((t) => t.id === activeTool)

    const onSelectTool = (id: EditorToolId) => {
        setActiveTool((current) => (current === id ? null : id))
    }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
            <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={[styles.iconButton, { backgroundColor: card }]}
            >
                <Icon name={{ ios: 'chevron.left', android: 'chevron_left' }} color={text} size={18} />
            </Pressable>
            <Text style={styles.title}>{tool?.label ?? 'Edit'}</Text>
            <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.8 : 1 }]}
            >
                <Text style={styles.saveText}>Save</Text>
            </Pressable>
        </View>

        <View style={styles.canvas}>
            <Image
                source={{uri}}
                style={styles.image}
                contentFit="contain"
                />
        </View>

        <View style={[styles.bottom, { borderColor: border }]}>
            {tool && (
                <View style={styles.panel}>
                    <ToolPanel key={tool.id} tool={tool} uri={uri} />
                </View>
            )}
            <EditorToolbar activeTool={activeTool} onSelect={onSelectTool} />
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    iconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
    },
    saveButton: {
        height: 38,
        paddingHorizontal: 18,
        borderRadius: 19,
        justifyContent: 'center',
        experimental_backgroundImage: 'linear-gradient(135deg, #6D5DFC 0%, #B44CF0 100%)',
    },
    saveText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    canvas: {
        flex: 1,
        padding: 16,
    },
    image: {
        flex: 1,
        borderRadius: 20,
    },
    bottom: {
        paddingTop: 14,
        paddingBottom: 4,
        gap: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    panel: {
        minHeight: 64,
        justifyContent: 'center',
    },
})

export default Editor
