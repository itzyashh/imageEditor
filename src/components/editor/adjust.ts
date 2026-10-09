import type { IconName } from '@/components/general/Icon';
import {
  FilterMode,
  ImageFormat,
  MipmapMode,
  Skia,
  TileMode,
  type SkImage,
} from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import type { ManipulatedImage } from './crop';

export type AdjustmentId = 'brightness' | 'contrast' | 'saturation' | 'warmth' | 'sharpen';

export type Adjustments = Record<AdjustmentId, number>;

export const ADJUSTMENTS: { id: AdjustmentId; label: string; icon: IconName; min: number }[] = [
  { id: 'brightness', label: 'Brightness', icon: { ios: 'sun.max', android: 'light_mode' }, min: -100 },
  { id: 'contrast', label: 'Contrast', icon: { ios: 'circle.lefthalf.filled', android: 'contrast' }, min: -100 },
  { id: 'saturation', label: 'Saturation', icon: { ios: 'drop', android: 'water_drop' }, min: -100 },
  { id: 'warmth', label: 'Warmth', icon: { ios: 'thermometer.medium', android: 'thermostat' }, min: -100 },
  { id: 'sharpen', label: 'Sharpen', icon: { ios: 'triangle', android: 'details' }, min: 0 },
];

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  sharpen: 0,
};

export function hasAdjustments(values: Adjustments) {
  return Object.values(values).some((v) => v !== 0);
}

export const adjustEffect = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float warmth;
uniform float sharpen;

half4 main(float2 xy) {
  half4 color = image.eval(xy);
  if (sharpen > 0.0) {
    half4 neighbors = image.eval(xy + float2(1.0, 0.0)) + image.eval(xy - float2(1.0, 0.0))
      + image.eval(xy + float2(0.0, 1.0)) + image.eval(xy - float2(0.0, 1.0));
    color += (color * 4.0 - neighbors) * sharpen;
  }
  half alpha = clamp(color.a, 0.0, 1.0);
  half3 rgb = color.rgb / max(alpha, 0.0001);

  rgb += brightness;
  rgb = (rgb - 0.5) * (1.0 + contrast) + 0.5;
  half luma = dot(rgb, half3(0.2126, 0.7152, 0.0722));
  rgb = mix(half3(luma), rgb, 1.0 + saturation);
  rgb += half3(warmth, warmth * 0.3, -warmth);

  return half4(clamp(rgb, 0.0, 1.0) * alpha, alpha);
}
`)!;

/** Maps slider values (-100…100) to shader uniforms. */
export function adjustUniforms(values: Adjustments) {
  return {
    brightness: (values.brightness / 100) * 0.35,
    contrast: values.contrast / 100,
    saturation: values.saturation / 100,
    warmth: (values.warmth / 100) * 0.12,
    sharpen: (values.sharpen / 100) * 1.2,
  };
}

export function exportAdjustedImage(image: SkImage, values: Adjustments): ManipulatedImage {
  const width = image.width();
  const height = image.height();
  const surface = Skia.Surface.MakeOffscreen(width, height) ?? Skia.Surface.Make(width, height);
  if (!surface) throw new Error('Could not create a drawing surface');

  const paint = Skia.Paint();
  const shader = adjustEffect.makeShaderWithChildren(
    Object.values(adjustUniforms(values)),
    [image.makeShaderOptions(TileMode.Clamp, TileMode.Clamp, FilterMode.Linear, MipmapMode.None)],
  );
  paint.setShader(shader);
  surface.getCanvas().drawRect(Skia.XYWHRect(0, 0, width, height), paint);
  surface.flush();

  const base64 = surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 100);
  const file = new File(Paths.cache, `adjust-${Date.now()}.jpg`);
  file.write(base64, { encoding: 'base64' });
  return { uri: file.uri, width, height };
}
