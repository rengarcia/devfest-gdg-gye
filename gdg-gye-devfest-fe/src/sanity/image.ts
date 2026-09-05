import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { sanityClient } from './client';

const builder = createImageUrlBuilder(sanityClient);

/** Sanity CDN URL builder, e.g. `urlFor(image).width(480).auto('format').url()`. */
export const urlFor = (source: SanityImageSource) => builder.image(source);
