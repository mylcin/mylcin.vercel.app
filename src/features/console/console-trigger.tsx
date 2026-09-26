'use client';

import { useSyncExternalStore } from 'react';
import { buttonClass } from '@/components/ui/button';
import { PromptIcon } from '@/components/ui/icons';
import { Kbd } from '@/components/ui/kbd';
import { useI18n } from '@/i18n/client';
import { useConsole } from './console-provider';

const noSubscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

export function ConsoleTrigger() {
  const shell = useConsole();
  const { t } = useI18n();
  const apple = useSyncExternalStore(noSubscribe, isApple, () => true);

  if (!shell) return null;

  return (
    <button
      type="button"
      onClick={() => shell.open()}
      onPointerEnter={shell.prefetch}
      onFocus={shell.prefetch}
      aria-label={t.controls.openConsole}
      aria-keyshortcuts="Meta+K Control+K"
      aria-haspopup="dialog"
      title={t.controls.openConsole}
      data-testid="console-trigger"
      className={buttonClass({
        variant: 'ghost',
        size: 'icon',
        className: 'md:w-auto md:gap-2 md:px-2',
      })}
    >
      <PromptIcon />
      <span aria-hidden="true" className="hidden items-center gap-0.5 md:flex">
        <Kbd>{apple ? '⌘' : 'Ctrl'}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}
