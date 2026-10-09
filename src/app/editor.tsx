import {
    DEFAULT_ADJUSTMENTS,
    exportAdjustedImage,
    hasAdjustments,
    type Adjustments,
} from '@/components/editor/adjust'
import { AdjustPreview } from '@/components/editor/AdjustPreview'
import { CropOverlay, type Frame } from '@/components/editor/CropOverlay'
import {
    aspectRatioFor,
    cropImage,
    flipImage,
    initialCropRect,
    rotateImage,
    type CropAspectId,
    type CropRect,
    type ImageSize,
    type ManipulatedImage,
} from '@/components/editor/crop'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { ToolPanel } from '@/components/editor/ToolPanel'
import { EDITOR_TOOLS, type EditorToolId } from '@/components/editor/tools'
import { Icon } from '@/components/general/Icon'
import { Text, useThemeColor } from '@/components/general/Themed'
import { useImage } from '@shopify/react-native-skia'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const FULL_RECT: CropRect = { x: 0, y: 0, width: 1, height: 1 }

const Editor = () => {

    const {uri} = useLocalSearchParams<{uri : string}>()
    const [activeTool, setActiveTool] = useState<EditorToolId | null>('crop')
    const [history, setHistory] = useState<string[]>([uri])
    const [imageSize, setImageSize] = useState<ImageSize | null>(null)
    const [canvasSize, setCanvasSize] = useState<ImageSize | null>(null)
    const [aspect, setAspect] = useState<CropAspectId>('free')
    const [busy, setBusy] = useState(false)
    const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS)
    const cropRect = useSharedValue<CropRect>(FULL_RECT)

    const text = useThemeColor({}, 'text')
    const mutedText = useThemeColor({}, 'mutedText')
    const card = useThemeColor({}, 'card')
    const border = useThemeColor({}, 'border')

    const currentUri = history[history.length - 1]
    const canUndo = history.length > 1
    const tool = EDITOR_TOOLS.find((t) => t.id === activeTool)
    const isCropping = activeTool === 'crop'
    const isAdjusted = hasAdjustments(adjustments)
    const skImage = useImage(currentUri)

    const frame = getImageFrame(canvasSize, imageSize)
    const aspectRatio = imageSize ? aspectRatioFor(aspect, imageSize) : null
    const normalizedAspect =
        aspectRatio !== null && imageSize ? (aspectRatio * imageSize.height) / imageSize.width : null

    const onSelectTool = async (id: EditorToolId) => {
        if (busy) return
        if (activeTool === 'adjust' && id !== 'adjust' && isAdjusted) {
            await onApplyAdjustments()
        }
        setActiveTool((current) => (current === id ? null : id))
    }

    const resetCrop = (nextAspect: CropAspectId, size: ImageSize | null) => {
        if (!size) return
        cropRect.set(initialCropRect(aspectRatioFor(nextAspect, size), size))
    }

    const onImageLoad = (size: ImageSize) => {
        setImageSize(size)
        resetCrop(aspect, size)
    }

    const runManipulation = async (task: () => Promise<ManipulatedImage>) => {
        setBusy(true)
        try {
            const result = await task()
            setHistory((prev) => [...prev, result.uri])
            setAdjustments(DEFAULT_ADJUSTMENTS)
            onImageLoad({ width: result.width, height: result.height })
        } catch (error) {
            Alert.alert('Something went wrong', error instanceof Error ? error.message : String(error))
        } finally {
            setBusy(false)
        }
    }

    const onApplyCrop = () => {
        if (!imageSize) return
        const rect = cropRect.get()
        const isFullImage = rect.x <= 0 && rect.y <= 0 && rect.width >= 1 && rect.height >= 1
        if (isFullImage) return
        runManipulation(() => cropImage(currentUri, imageSize, rect))
    }

    const onApplyAdjustments = async () => {
        if (!skImage || !isAdjusted) return
        const image = skImage
        await runManipulation(async () => exportAdjustedImage(image, adjustments))
    }

    const onUndo = () => {
        setImageSize(null)
        setAdjustments(DEFAULT_ADJUSTMENTS)
        setHistory((prev) => prev.slice(0, -1))
    }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
            <View style={styles.topBarGroup}>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    style={[styles.iconButton, { backgroundColor: card }]}
                >
                    <Icon name={{ ios: 'chevron.left', android: 'chevron_left' }} color={text} size={18} />
                </Pressable>
                <Pressable
                    onPress={onUndo}
                    disabled={!canUndo || busy}
                    accessibilityRole="button"
                    accessibilityLabel="Undo"
                    style={[styles.iconButton, { backgroundColor: card, opacity: canUndo ? 1 : 0.4 }]}
                >
                    <Icon
                        name={{ ios: 'arrow.uturn.backward', android: 'undo' }}
                        color={canUndo ? text : mutedText}
                        size={16}
                    />
                </Pressable>
            </View>
            <Text style={styles.title}>{tool?.label ?? 'Edit'}</Text>
            <View style={[styles.topBarGroup, styles.topBarRight]}>
                <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.8 : 1 }]}
                >
                    <Text style={styles.saveText}>Save</Text>
                </Pressable>
            </View>
        </View>

        <View
            style={styles.canvas}
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout
                setCanvasSize({ width, height })
            }}
        >
            <Image
                source={{uri: currentUri}}
                style={frame ? [styles.positioned, frame, !isCropping && styles.rounded] : styles.fill}
                contentFit="fill"
                onLoad={(e) => onImageLoad({ width: e.source.width, height: e.source.height })}
                />
            {isAdjusted && frame && skImage && (
                <AdjustPreview image={skImage} frame={frame} values={adjustments} />
            )}
            {isCropping && frame && (
                <CropOverlay
                    key={currentUri}
                    frame={frame}
                    rect={cropRect}
                    normalizedAspect={normalizedAspect}
                />
            )}
        </View>

        <View style={[styles.bottom, { borderColor: border }]}>
            {tool && (
                <View style={styles.panel}>
                    <ToolPanel
                        key={tool.id}
                        tool={tool}
                        uri={currentUri}
                        crop={{
                            aspect,
                            busy,
                            onAspectChange: (id) => {
                                setAspect(id)
                                resetCrop(id, imageSize)
                            },
                            onRotate: () => runManipulation(() => rotateImage(currentUri, 90)),
                            onFlip: () => runManipulation(() => flipImage(currentUri)),
                            onReset: () => resetCrop(aspect, imageSize),
                            onApply: onApplyCrop,
                        }}
                        adjust={{
                            values: adjustments,
                            busy,
                            onChange: (id, value) =>
                                setAdjustments((prev) => ({ ...prev, [id]: value })),
                            onReset: () => setAdjustments(DEFAULT_ADJUSTMENTS),
                            onApply: onApplyAdjustments,
                        }}
                    />
                </View>
            )}
            <EditorToolbar activeTool={activeTool} onSelect={onSelectTool} />
        </View>
    </SafeAreaView>
  )
}

function getImageFrame(canvas: ImageSize | null, image: ImageSize | null): Frame | null {
    if (!canvas || !image || !image.width || !image.height) return null
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
    const width = image.width * scale
    const height = image.height * scale
    return {
        left: (canvas.width - width) / 2,
        top: (canvas.height - height) / 2,
        width,
        height,
    }
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
    topBarGroup: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    topBarRight: {
        justifyContent: 'flex-end',
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
        margin: 24,
    },
    fill: {
        flex: 1,
    },
    positioned: {
        position: 'absolute',
    },
    rounded: {
        borderRadius: 12,
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
