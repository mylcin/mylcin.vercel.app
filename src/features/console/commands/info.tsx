import { localeMeta } from '@/i18n/config';
import { format, formatDate, monthsBetween, plural } from '@/i18n/format';
import { searchable } from '../engine/suggest';
import {
  Block,
  Cmd,
  ErrorText,
  Gap,
  Line,
  Muted,
  Rows,
  Strong,
} from '../output';
import { fail, type Command, type CommandContext } from './types';

function summaryOf(ctx: CommandContext, name: string) {
  const summaries = ctx.t.console.commands as Record<string, string>;
  return summaries[name]
    ? format(summaries[name], { city: ctx.index.profile.city })
    : '';
}

function Usage({ ctx, command }: { ctx: CommandContext; command: Command }) {
  return (
    <>
      <Line>
        <Strong>{command.name}</Strong> — {summaryOf(ctx, command.name)}
      </Line>
      <Line className="text-muted">
        {format(ctx.t.console.out.usage, {
          usage: command.usage ?? command.name,
        })}
      </Line>
      {command.aliases?.length ? (
        <Line className="text-muted">≈ {command.aliases.join(', ')}</Line>
      ) : null}
    </>
  );
}

export const help: Command = {
  name: 'help',
  aliases: ['?', 'h'],
  usage: 'help [command]',
  run(ctx, { args }) {
    const visible = ctx.commands.filter(c => !c.hidden);
    if (args[0]) {
      const command = visible.find(
        c => c.name === args[0] || c.aliases?.includes(args[0])
      );
      if (!command) {
        return fail(
          <ErrorText>
            {format(ctx.t.console.out.noManual, { page: args[0] })}
          </ErrorText>
        );
      }
      return <Usage ctx={ctx} command={command} />;
    }
    return (
      <>
        <Line className="text-muted">{ctx.t.console.out.helpTitle}</Line>
        <Rows
          className="mt-1"
          rows={visible.map(command => [
            // Commands that need an argument are typed in, not run.
            command.usage?.includes('<') ? (
              <Cmd key="name" fill={`${command.name} `}>
                {command.name}
              </Cmd>
            ) : (
              <Cmd key="name" run={command.name} />
            ),
            <span key="summary">{summaryOf(ctx, command.name)}</span>,
          ])}
        />
        <Line className="mt-[1lh] text-muted">
          {ctx.t.console.out.helpFooter}
        </Line>
      </>
    );
  },
};

function careerDuration(ctx: CommandContext) {
  const months = monthsBetween(ctx.index.profile.careerStart, new Date());
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return {
    version: `${years}.${rest}`,
    text: [
      years ? plural(ctx.locale, years, ctx.t.about.years) : '',
      rest ? plural(ctx.locale, rest, ctx.t.about.months) : '',
    ]
      .filter(Boolean)
      .join(' '),
    since: formatDate(ctx.index.profile.careerStart, ctx.locale, 'monthYear'),
  };
}

function Synopsis({ ctx }: { ctx: CommandContext }) {
  const { handle, synopsis } = ctx.index.profile;
  return (
    <Line>
      <Strong>{handle}</Strong>{' '}
      {synopsis.flags.map(flag => `[--${flag.name}]`).join(' ')} &lt;
      {synopsis.argument}&gt;
    </Line>
  );
}

function Options({ ctx }: { ctx: CommandContext }) {
  return (
    <Rows
      rows={ctx.index.profile.synopsis.flags.map(flag => [
        <Strong key="flag">--{flag.name}</Strong>,
        <span key="description">{flag.description}</span>,
      ])}
    />
  );
}

export const mustafa: Command = {
  name: 'mustafa',
  usage: 'mustafa [--help] [--version] <idea>',
  run(ctx, { args, flags, rest }) {
    const { t, index } = ctx;
    if (flags.has('version') || flags.has('v')) {
      const { version, since } = careerDuration(ctx);
      return format(t.console.out.mustafaVersion, { version, since });
    }
    if (args.length) {
      const idea = rest
        .replace(/^(--?\S+\s+)*/, '')
        .replace(/^["']|["']$/g, '');
      const [before, after] = t.console.out.mustafaIdea
        .replace('{idea}', idea)
        .split('{email}');
      return (
        <Line>
          {before}
          <Cmd run="email">{index.profile.email}</Cmd>
          {after}
        </Line>
      );
    }
    return (
      <>
        <Synopsis ctx={ctx} />
        <Gap />
        <Line>{index.profile.synopsis.summary}</Line>
        <Gap />
        <Line className="text-muted">{t.console.out.options}</Line>
        <Options ctx={ctx} />
        <Gap />
        <Line className="text-muted">
          {t.console.out.mustafaSeeAlso}:{' '}
          <Cmd run="man mustafa">man mustafa</Cmd>,{' '}
          <Cmd run="cd ~/work">cd work</Cmd>
        </Line>
      </>
    );
  },
};

export const man: Command = {
  name: 'man',
  usage: 'man <page>',
  completer: { kind: 'values', values: [] }, // filled in by the registry
  run(ctx, { args }) {
    const page = args[0];
    const { t, index } = ctx;
    if (!page) return t.console.out.whatManual;

    if (
      page === index.profile.handle ||
      searchable(page) === searchable(index.profile.name.split(' ')[0])
    ) {
      const sections = t.home.sections;
      return (
        <>
          <Line className="flex justify-between text-muted">
            <span>{index.profile.handle.toUpperCase()}(1)</span>
            <span className="hidden sm:inline">{t.home.runningHead}</span>
            <span>{index.profile.handle.toUpperCase()}(1)</span>
          </Line>
          <Gap />
          <Block title={sections.name}>
            {index.profile.name} — {index.profile.headline}
          </Block>
          <Block title={sections.synopsis}>
            <Synopsis ctx={ctx} />
          </Block>
          <Block title={sections.description}>
            {index.profile.intro.map(paragraph => (
              <p key={paragraph} className="mb-[1lh] last:mb-0">
                {paragraph}
              </p>
            ))}
          </Block>
          <Block title={t.console.out.options}>
            <Options ctx={ctx} />
          </Block>
          <Block title={sections.seeAlso}>
            <Cmd run="ls ~/work">work(7)</Cmd>,{' '}
            <Cmd run="ls ~/blog">blog(5)</Cmd>,{' '}
            <Cmd run="cat ~/about/contact.md">contact(1)</Cmd>
          </Block>
          <Block title={sections.bugs}>
            {index.profile.bugs.map(bug => (
              <Line key={bug}>{bug}</Line>
            ))}
          </Block>
        </>
      );
    }

    const command = ctx.commands.find(
      c => !c.hidden && (c.name === page || c.aliases?.includes(page))
    );
    if (!command)
      return fail(
        <ErrorText>{format(t.console.out.noManual, { page })}</ErrorText>
      );
    return <Usage ctx={ctx} command={command} />;
  },
};

export const whoami: Command = {
  name: 'whoami',
  run(ctx) {
    const [before, after] = ctx.t.console.out.whoami.split('man mustafa');
    return (
      <Line>
        {before}
        <Cmd run="man mustafa">man {ctx.index.profile.handle}</Cmd>
        {after}
      </Line>
    );
  },
};

const MONOGRAM = String.raw` __  __  __   __
|  \/  | \ \ / /
| |\/| |  \ V /
| |  | |   | |
|_|  |_|   |_|  `;

export const neofetch: Command = {
  name: 'neofetch',
  aliases: ['fastfetch'],
  run(ctx) {
    const { t, index, locale } = ctx;
    const labels = t.console.out.neofetch;
    const { text, since } = careerDuration(ctx);
    const title = `${index.profile.handle}@${searchable(index.profile.city)}`;
    const theme = ctx.theme.resolved
      ? t.console.out.themeNames[ctx.theme.resolved]
      : '—';
    const rows: [string, string][] = [
      [labels.os, labels.osValue],
      [labels.host, index.profile.employer ?? '—'],
      [labels.uptime, `${text} (${since})`],
      [labels.location, `${index.profile.city}, ${index.profile.country}`],
      [labels.role, index.profile.role],
      [labels.stack, index.profile.stack.join(', ')],
      [labels.languages, labels.languagesValue],
      [labels.hobbies, labels.hobbiesValue],
      [labels.theme, `${theme} · ${localeMeta[locale].label}`],
    ];
    const swatches = [
      'bg-fg',
      'bg-muted',
      'bg-accent',
      'bg-ok',
      'bg-warn',
      'bg-err',
    ];

    return (
      <div className="flex flex-col gap-x-8 gap-y-3 sm:flex-row">
        <pre aria-hidden="true" className="text-accent-ink">
          {MONOGRAM}
        </pre>
        <div>
          <Line>
            <Strong>{title}</Strong>
          </Line>
          <div aria-hidden="true" className="text-faint">
            {'─'.repeat(title.length)}
          </div>
          <Rows
            rows={rows.map(([label, value]) => [
              <Strong key="l">{label}</Strong>,
              <span key="v">{value}</span>,
            ])}
          />
          <div aria-hidden="true" className="mt-2 flex">
            {swatches.map(swatch => (
              <span key={swatch} className={`h-3 w-6 ${swatch}`} />
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const history: Command = {
  name: 'history',
  run(ctx) {
    if (!ctx.history.length)
      return <Muted>{ctx.t.console.out.noHistory}</Muted>;
    return (
      <Rows
        rows={ctx.history.map((entry, i) => [
          <Muted key="n">{String(i + 1).padStart(3, ' ')}</Muted>,
          <Cmd key="c" run={entry}>
            {entry}
          </Cmd>,
        ])}
      />
    );
  },
};

export const date: Command = {
  name: 'date',
  run(ctx) {
    return new Intl.DateTimeFormat(localeMeta[ctx.locale].intl, {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: ctx.index.profile.timeZone,
    }).format(new Date());
  },
};

export const echo: Command = {
  name: 'echo',
  usage: 'echo <text>',
  run: (_ctx, { rest }) => rest.replace(/^(["'])(.*)\1$/, '$2'),
};
