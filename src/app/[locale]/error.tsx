'use client';

import { buttonClass } from '@/components/ui/button';
import { useI18n } from '@/i18n/client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <div role="alert" className="section py-10 md:py-20">
      <p className="label">500</p>
      <div className="min-w-0">
        <h1 className="text-2xl font-normal tracking-[-0.015em]">
          {t.error.title}
        </h1>
        <pre className="mt-6 font-mono text-sm text-err">{t.error.command}</pre>
        <p className="mt-6 max-w-prose text-muted">{t.error.body}</p>
        <button
          type="button"
          onClick={reset}
          className={buttonClass({ variant: 'solid', className: 'mt-8' })}
        >
          {t.error.retry}
        </button>
      </div>
    </div>
  );
}
