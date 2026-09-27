'use client';

import { usePathname } from 'next/navigation';
import { stripLocale } from '@/i18n/config';

/** The requested path as a shell path, for the 404 page's fake error. */
export function CurrentPath() {
  return <>~{stripLocale(usePathname())}</>;
}
