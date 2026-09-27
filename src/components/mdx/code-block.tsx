import { CopyButton } from '@/components/ui/copy-button';
import { CheckIcon, CopyIcon } from '@/components/ui/icons';
import { getT } from '@/i18n/server';

/** `<pre>` from rehype-pretty-code, with a header showing language + copy. */
export async function CodeBlock(props: React.ComponentProps<'pre'>) {
  const { locale, t } = await getT();
  const language = (props as Record<string, unknown>)['data-language'] as
    string | undefined;
  const raw = (props as Record<string, unknown>)['data-raw'] as
    string | undefined;

  return (
    <div className="code-block overflow-hidden rounded-md border border-line bg-raised">
      <div
        lang={locale}
        className="flex h-9 items-center justify-between border-b border-line pr-1 pl-3 font-mono text-xs text-muted"
      >
        <span>{language && language !== 'plaintext' ? language : ''}</span>
        {raw && (
          <CopyButton
            text={raw.trimEnd()}
            label={t.blog.copyCode}
            copiedLabel={t.controls.copied}
            className="group inline-flex h-7 items-center gap-1.5 rounded-sm px-2 transition-colors duration-(--dur-fast) hover:bg-bg hover:text-fg"
            idle={
              <>
                <CopyIcon className="size-3.5" />
                <span className="lowercase">{t.controls.copy}</span>
              </>
            }
            done={
              <>
                <CheckIcon className="size-3.5 text-accent-ink" />
                <span className="text-accent-ink lowercase">
                  {t.controls.copied}
                </span>
              </>
            }
          />
        )}
      </div>
      <pre {...props} />
    </div>
  );
}
