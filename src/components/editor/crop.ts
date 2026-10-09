import { FlipType, ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export type ImageSize = { width: number; height: number };

/** Crop rectangle in normalized (0–1) coordinates relative to the image. */
export type CropRect = { x: number; y: number; width: number; height: number };

export type CropAspectId = 'free' | 'original' | '1:1' | '4:5' | '16:9' | '9:16';

export const CROP_ASPECTS: { id: CropAspectId; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: 'original', label: 'Original' },
  { id: '1:1', label: '1:1' },
  { id: '4:5', label: '4:5' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
];

const ASPECT_VALUES: Record<Exclude<CropAspectId, 'free' | 'original'>, number> = {
  '1:1': 1,
  '4:5': 4 / 5,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
};

/** Width / height in image pixels, or null when unconstrained. */
export function aspectRatioFor(id: CropAspectId, image: ImageSize): number | null {
  if (id === 'free') return null;
  if (id === 'original') return image.width / image.height;
  return ASPECT_VALUES[id];
}

/** Largest centered rect matching the aspect ratio. */
export function initialCropRect(aspect: number | null, image: ImageSize): CropRect {
  if (aspect === null) return { x: 0, y: 0, width: 1, height: 1 };

  const normalizedAspect = (aspect * image.height) / image.width;
  const width = normalizedAspect <= 1 ? normalizedAspect : 1;
  const height = normalizedAspect <= 1 ? 1 : 1 / normalizedAspect;
  return { x: (1 - width) / 2, y: (1 - height) / 2, width, height };
}

export type ManipulatedImage = { uri: string } & ImageSize;

async function render(context: ReturnType<typeof ImageManipulator.manipulate>) {
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 1 });
  image.release();
  context.release();
  return { uri: result.uri, width: result.width, height: result.height };
}

export function cropImage(uri: string, image: ImageSize, rect: CropRect): Promise<ManipulatedImage> {
  const originX = Math.round(rect.x * image.width);
  const originY = Math.round(rect.y * image.height);
  const width = Math.min(Math.round(rect.width * image.width), image.width - originX);
  const height = Math.min(Math.round(rect.height * image.height), image.height - originY);

  return render(ImageManipulator.manipulate(uri).crop({ originX, originY, width, height }));
}

export function rotateImage(uri: string, degrees: number): Promise<ManipulatedImage> {
  return render(ImageManipulator.manipulate(uri).rotate(degrees));
}

export function flipImage(uri: string): Promise<ManipulatedImage> {
  return render(ImageManipulator.manipulate(uri).flip(FlipType.Horizontal));
}
