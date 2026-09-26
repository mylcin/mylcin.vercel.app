import { isLocale, localeMeta, locales } from '@/i18n/config';
import { format } from '@/i18n/format';
import type { ThemePreference } from '@/lib/theme';
import { Cmd, ErrorText, Line, Muted } from '../output';
import { fail, type Command } from './types';

const THEMES: ThemePreference[] = ['light', 'dark', 'system'];

function Choices({
  command,
  values,
  current,
}: {
  command: string;
  values: { value: string; label: string }[];
  current: string;
}) {
  return (
    <Line className="text-muted">
      {values.map((choice, i) => (
        <span key={choice.value}>
          {i > 0 && ' · '}
          {choice.value === current ? (
            <span className="text-fg">{choice.label}</span>
          ) : (
            <Cmd run={`${command} ${choice.value}`}>{choice.label}</Cmd>
          )}
        </span>
      ))}
    </Line>
  );
}

export const lang: Command = {
  name: 'lang',
  aliases: ['language', 'dil'],
  usage: `lang [${locales.join(' | ')}]`,
  completer: { kind: 'values', values: [...locales] },
  run(ctx, { args }) {
    const { t, locale } = ctx;
    const target = args[0]?.toLowerCase();
    const choices = locales.map(l => ({
      value: l,
      label: localeMeta[l].label,
    }));

    if (!target) {
      return (
        <>
          <Line>
            {format(t.console.out.language, {
              language: localeMeta[locale].label,
            })}
          </Line>
          <Choices command="lang" values={choices} current={locale} />
        </>
      );
    }
    if (!isLocale(target)) {
      return fail(
        <ErrorText>
          {format(t.console.out.invalidValue, {
            command: 'lang',
            value: target,
            expected: locales.join(', '),
          })}
        </ErrorText>
      );
    }
    if (target === locale)
      return format(t.console.out.language, {
        language: localeMeta[locale].label,
      });
    ctx.switchLocale(target);
    return (
      <Muted>
        {format(t.console.out.switchingLanguage, {
          language: t.languageNames[target],
        })}
      </Muted>
    );
  },
};

export const theme: Command = {
  name: 'theme',
  usage: 'theme [light | dark | system]',
  completer: { kind: 'values', values: THEMES },
  run(ctx, { args }) {
    const { t } = ctx;
    const names = t.console.out.themeNames;
    const target = args[0]?.toLowerCase() as ThemePreference | undefined;
    const choices = THEMES.map(value => ({ value, label: names[value] }));

    if (!target) {
      return (
        <>
          <Line>
            {format(t.console.out.theme, {
              theme: names[ctx.theme.preference],
            })}
          </Line>
          <Choices
            command="theme"
            values={choices}
            current={ctx.theme.preference}
          />
        </>
      );
    }
    if (!THEMES.includes(target)) {
      return fail(
        <ErrorText>
          {format(t.console.out.invalidValue, {
            command: 'theme',
            value: target,
            expected: THEMES.join(', '),
          })}
        </ErrorText>
      );
    }
    ctx.setTheme(target);
    return format(t.console.out.theme, { theme: names[target] });
  },
};

export const email: Command = {
  name: 'email',
  aliases: ['mail', 'contact'],
  async run(ctx) {
    const address = ctx.index.profile.email;
    const copied = await ctx.copy(address);
    return format(
      copied ? ctx.t.console.out.copied : ctx.t.console.out.copyFailed,
      { text: address }
    );
  },
};

export const clear: Command = {
  name: 'clear',
  aliases: ['cls'],
  run(ctx) {
    ctx.clear();
    return null;
  },
};

export const exit: Command = {
  name: 'exit',
  aliases: ['quit', 'q', ':q', ':wq', 'logout'],
  run(ctx) {
    ctx.close();
    return null;
  },
};
