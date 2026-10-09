import { Canvas, ImageShader, Rect, Shader, type SkImage } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import { adjustEffect, adjustUniforms, type Adjustments } from './adjust';
import type { Frame } from './CropOverlay';

type AdjustPreviewProps = {
  image: SkImage;
  frame: Frame;
  values: Adjustments;
};

export function AdjustPreview({ image, frame, values }: AdjustPreviewProps) {
  const rect = { x: 0, y: 0, width: frame.width, height: frame.height };

  return (
    <View style={[styles.clip, frame]} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect {...rect}>
          <Shader source={adjustEffect} uniforms={adjustUniforms(values)}>
            <ImageShader image={image} fit="fill" rect={rect} />
          </Shader>
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
