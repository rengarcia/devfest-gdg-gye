import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { sanityClient } from './client';

const builder = createImageUrlBuilder(sanityClient);

/** Sanity CDN URL builder, e.g. `urlFor(image).width(480).auto('format').url()`. */
export const urlFor = (source: SanityImageSource) => builder.image(source);

/** What the helpers below read from an image field (the generated query types match it). */
export interface SanityImageField {
  asset?: { _ref: string } | null;
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null;
}

/** Attributes for an <img>: `width`/`height` are the intrinsic size, so the browser reserves the box
    before the file arrives (left out when it cannot be known); `srcset` lets it pick the smallest
    file for the rendered size. */
export interface ResponsiveImage {
  src: string;
  srcset?: string;
  width?: number;
  height?: number;
}

/** Size of the image the Studio crop leaves, read from the asset id (`image-<hash>-<w>x<h>-<ext>`). */
function croppedSize(image: SanityImageField): { width: number; height: number } | undefined {
  const m = /^image-[\da-f]+-(\d+)x(\d+)-\w+$/.exec(image.asset?._ref ?? '');
  if (!m) return undefined;
  const c = image.crop ?? {};
  return {
    width: Math.round(Number(m[1]) * (1 - (c.left ?? 0) - (c.right ?? 0))),
    height: Math.round(Number(m[2]) * (1 - (c.top ?? 0) - (c.bottom ?? 0))),
  };
}

/** srcset steps (px). */
const WIDTHS = [320, 480, 640, 800, 1000, 1200];

/**
 * Square crop honouring the hotspot, as AVIF/WebP (`auto=format`), up to `max` px wide. The srcset
 * stops at the source's own resolution: larger steps would only be upscaled copies of the same pixels.
 */
export function squareImage(image: SanityImageField, max: number): ResponsiveImage {
  const source = croppedSize(image);
  const limit = Math.min(max, source ? Math.min(source.width, source.height) : max);
  // Steps within 20% of the largest file would barely save bytes.
  const widths = [...WIDTHS.filter((w) => w <= limit * 0.8), limit];
  const at = (w: number) =>
    // The generated image type is structurally a SanityImageSource; the cast only bridges names.
    urlFor(image as SanityImageSource)
      .width(w)
      .height(w)
      .fit('crop')
      .auto('format')
      .url();
  return {
    src: at(limit),
    srcset: widths.length > 1 ? widths.map((w) => `${at(w)} ${w}w`).join(', ') : undefined,
    width: limit,
    height: limit,
  };
}

/** Whole image (logos) scaled down to fit `maxWidth`×`maxHeight`, never up, as AVIF/WebP. */
export function fittedImage(
  image: SanityImageField,
  maxWidth: number,
  maxHeight: number,
): ResponsiveImage {
  const src = urlFor(image as SanityImageSource)
    .width(maxWidth)
    .height(maxHeight)
    .fit('max')
    .auto('format')
    .url();
  const source = croppedSize(image);
  if (!source) return { src };
  const scale = Math.min(1, maxWidth / source.width, maxHeight / source.height);
  return {
    src,
    width: Math.round(source.width * scale),
    height: Math.round(source.height * scale),
  };
}
