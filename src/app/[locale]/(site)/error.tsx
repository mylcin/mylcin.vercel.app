'use client';

import { buttonClass } from '@/components/ui/button';
import { useI18n } from '@/i18n/client';

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useI18n();
  return (
    <div role="alert" className="section pb-10 md:pb-20">
      <p className="label">500</p>
      <div className="min-w-0">
        <h1 className="text-2xl font-normal">{t.error.title}</h1>
        <p className="mt-6 font-mono text-sm text-err">{t.error.command}</p>
        <p className="mt-6 max-w-measure text-muted">{t.error.body}</p>
        {/* retry() re-fetches as well as re-rendering; reset() would only re-render. */}
        <button
          type="button"
          onClick={() => retry()}
          className={buttonClass({ variant: 'solid', className: 'mt-8' })}
        >
          {t.error.retry}
        </button>
      </div>
    </div>
  );
}
