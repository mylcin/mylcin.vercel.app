'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localeMeta, locales, localizePath } from '@/i18n/config';
import { rememberLocale, useI18n } from '@/i18n/client';
import { format } from '@/i18n/format';
import { cx } from '@/lib/cx';

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();

  return (
    <ul
      aria-label={t.controls.language}
      className={cx('flex items-center font-mono text-xs', className)}
    >
      {locales.map((l, index) => (
        <li key={l} className="flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="px-0.5 text-faint">
              /
            </span>
          )}
          {l === locale ? (
            <span
              aria-current="true"
              className="px-1 py-2 text-fg"
              title={localeMeta[l].label}
            >
              {localeMeta[l].short}
            </span>
          ) : (
            <Link
              href={localizePath(pathname, l)}
              hrefLang={l}
              lang={l}
              onClick={() => rememberLocale(l)}
              aria-label={format(t.controls.switchLanguage, {
                language: localeMeta[l].label,
              })}
              className="px-1 py-2 text-muted transition-colors duration-(--dur-fast) hover:text-fg"
            >
              {localeMeta[l].short}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
