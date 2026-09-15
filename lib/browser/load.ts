// Chargement d'un fichier image dans le navigateur. Rien ne quitte l'appareil.
import { sniffJpeg, toGrey, type ExifSniff, type GreyImage } from "@/lib/engine";

/** Au-delà, l'image est réduite (photos de téléphone) ; le ré-échantillonnage moyenne les gris, documenté dans /limites. */
export const MAX_DIMENSION = 2000;

export interface LoadedImage {
  grey: GreyImage;
  bitmap: ImageBitmap;
  exif: ExifSniff;
  fileName: string;
  originalWidth: number;
  originalHeight: number;
  downscaled: boolean;
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const exif = sniffJpeg(bytes);
  const source = await createImageBitmap(new Blob([bytes], { type: file.type || "image/*" }));
  const scale = Math.min(1, MAX_DIMENSION / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas 2d indisponible");
  ctx.drawImage(source, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const grey = toGrey(data, width, height);
  const bitmap = scale < 1 ? await createImageBitmap(canvas) : source;
  if (scale < 1) source.close();
  return { grey, bitmap, exif, fileName: file.name, originalWidth: source.width, originalHeight: source.height, downscaled: scale < 1 };
}

/** Bitmap affichable à partir de l'image de gris (après masquage). */
export async function bitmapFromGrey(img: GreyImage): Promise<ImageBitmap> {
  const rgba = new Uint8ClampedArray(img.width * img.height * 4);
  for (let i = 0; i < img.grey.length; i++) {
    const v = img.grey[i];
    rgba[i * 4] = v; rgba[i * 4 + 1] = v; rgba[i * 4 + 2] = v; rgba[i * 4 + 3] = 255;
  }
  return createImageBitmap(new ImageData(rgba, img.width, img.height));
}
