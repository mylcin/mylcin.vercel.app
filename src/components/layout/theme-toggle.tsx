'use client';

import { buttonClass } from '@/components/ui/button';
import { MoonIcon, SunIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/client';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const { theme, setPreference } = useTheme();
  const label =
    theme === 'dark'
      ? t.controls.toLight
      : theme === 'light'
        ? t.controls.toDark
        : t.controls.theme;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setPreference(theme === 'dark' ? 'light' : 'dark')}
      data-testid="theme-toggle"
      data-theme-state={theme ?? undefined}
      className={buttonClass({ variant: 'ghost', size: 'icon', className })}
    >
      {/* Both icons render; CSS picks one, so there's no flash before hydration. */}
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}
