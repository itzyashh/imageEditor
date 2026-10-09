import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { CropRect } from './crop';

const MIN_SIZE_PX = 48;
const HANDLE_SIZE = 44;
const DIM_COLOR = 'rgba(0, 0, 0, 0.55)';

/** Where the image is drawn inside the canvas, in points. */
export type Frame = { left: number; top: number; width: number; height: number };

type CropOverlayProps = {
  frame: Frame;
  rect: SharedValue<CropRect>;
  /** Aspect ratio of the crop box in normalized units (width / height), or null when free. */
  normalizedAspect: number | null;
};

type Corner = { id: string; dx: -1 | 1; dy: -1 | 1 };

const CORNERS: Corner[] = [
  { id: 'tl', dx: -1, dy: -1 },
  { id: 'tr', dx: 1, dy: -1 },
  { id: 'bl', dx: -1, dy: 1 },
  { id: 'br', dx: 1, dy: 1 },
];

export function CropOverlay({ frame, rect, normalizedAspect }: CropOverlayProps) {
  const start = useSharedValue<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const minW = MIN_SIZE_PX / frame.width;
  const minH = MIN_SIZE_PX / frame.height;

  const moveGesture = Gesture.Pan()
    .onStart(() => {
      start.set(rect.get());
    })
    .onUpdate((e) => {
      const s = start.get();
      rect.set({
        ...s,
        x: clamp(s.x + e.translationX / frame.width, 0, 1 - s.width),
        y: clamp(s.y + e.translationY / frame.height, 0, 1 - s.height),
      });
    });

  const cornerGesture = (corner: Corner) =>
    Gesture.Pan()
      .onStart(() => {
        start.set(rect.get());
      })
      .onUpdate((e) => {
        const s = start.get();
        const right = s.x + s.width;
        const bottom = s.y + s.height;
        const maxW = corner.dx < 0 ? right : 1 - s.x;
        const maxH = corner.dy < 0 ? bottom : 1 - s.y;

        let width = clamp(s.width + (corner.dx * e.translationX) / frame.width, minW, maxW);
        let height = clamp(s.height + (corner.dy * e.translationY) / frame.height, minH, maxH);

        if (normalizedAspect !== null) {
          height = width / normalizedAspect;
          if (height > maxH) {
            height = maxH;
            width = height * normalizedAspect;
          }
          if (height < minH) {
            height = minH;
            width = height * normalizedAspect;
          }
        }

        rect.set({
          x: corner.dx < 0 ? right - width : s.x,
          y: corner.dy < 0 ? bottom - height : s.y,
          width,
          height,
        });
      });

  const boxStyle = useAnimatedStyle(() => {
    const r = rect.get();
    return {
      left: r.x * frame.width,
      top: r.y * frame.height,
      width: r.width * frame.width,
      height: r.height * frame.height,
    };
  });

  const topDim = useAnimatedStyle(() => ({ height: rect.get().y * frame.height }));
  const bottomDim = useAnimatedStyle(() => {
    const r = rect.get();
    return { top: (r.y + r.height) * frame.height };
  });
  const leftDim = useAnimatedStyle(() => {
    const r = rect.get();
    return { top: r.y * frame.height, height: r.height * frame.height, width: r.x * frame.width };
  });
  const rightDim = useAnimatedStyle(() => {
    const r = rect.get();
    return {
      top: r.y * frame.height,
      height: r.height * frame.height,
      left: (r.x + r.width) * frame.width,
    };
  });

  return (
    <View style={[styles.container, frame]} pointerEvents="box-none">
      <Animated.View pointerEvents="none" style={[styles.dim, styles.dimTop, topDim]} />
      <Animated.View pointerEvents="none" style={[styles.dim, styles.dimBottom, bottomDim]} />
      <Animated.View pointerEvents="none" style={[styles.dim, styles.dimLeft, leftDim]} />
      <Animated.View pointerEvents="none" style={[styles.dim, styles.dimRight, rightDim]} />

      <GestureDetector gesture={moveGesture}>
        <Animated.View style={[styles.box, boxStyle]} accessibilityLabel="Crop area">
          <View pointerEvents="none" style={[styles.gridLine, styles.vLine, { left: '33.33%' }]} />
          <View pointerEvents="none" style={[styles.gridLine, styles.vLine, { left: '66.66%' }]} />
          <View pointerEvents="none" style={[styles.gridLine, styles.hLine, { top: '33.33%' }]} />
          <View pointerEvents="none" style={[styles.gridLine, styles.hLine, { top: '66.66%' }]} />
        </Animated.View>
      </GestureDetector>

      {CORNERS.map((corner) => (
        <CornerHandle
          key={corner.id}
          corner={corner}
          rect={rect}
          frame={frame}
          gesture={cornerGesture(corner)}
        />
      ))}
    </View>
  );
}

function CornerHandle({
  corner,
  rect,
  frame,
  gesture,
}: {
  corner: Corner;
  rect: SharedValue<CropRect>;
  frame: Frame;
  gesture: ReturnType<typeof Gesture.Pan>;
}) {
  const style = useAnimatedStyle(() => {
    const r = rect.get();
    const x = corner.dx < 0 ? r.x : r.x + r.width;
    const y = corner.dy < 0 ? r.y : r.y + r.height;
    return {
      left: x * frame.width - HANDLE_SIZE / 2,
      top: y * frame.height - HANDLE_SIZE / 2,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.handle, style]} accessibilityLabel="Resize crop area">
        <View
          pointerEvents="none"
          style={[
            styles.handleMark,
            corner.dx < 0 ? { left: HANDLE_SIZE / 2 - 3, borderLeftWidth: 3 } : { right: HANDLE_SIZE / 2 - 3, borderRightWidth: 3 },
            corner.dy < 0 ? { top: HANDLE_SIZE / 2 - 3, borderTopWidth: 3 } : { bottom: HANDLE_SIZE / 2 - 3, borderBottomWidth: 3 },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  dim: {
    position: 'absolute',
    backgroundColor: DIM_COLOR,
  },
  dimTop: {
    top: 0,
    left: 0,
    right: 0,
  },
  dimBottom: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  dimLeft: {
    left: 0,
  },
  dimRight: {
    right: 0,
  },
  box: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  vLine: {
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  hLine: {
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
  },
  handleMark: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#fff',
  },
});
