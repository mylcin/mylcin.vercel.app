import {
  localeParams,
  ogAlt,
  ogContentType,
  ogSize,
  sectionOgImage,
} from '@/lib/og';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;
export const dynamicParams = false;
export const generateStaticParams = localeParams;

export default sectionOgImage('about');
