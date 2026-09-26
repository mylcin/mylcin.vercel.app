import { format, formatDate, plural } from '@/i18n/format';
import {
  displayPath,
  lookup,
  relativePath,
  resolvePath,
  type FileNode,
  type FsNode,
} from '../engine/fs';
import { searchable } from '../engine/suggest';
import { Cmd, ErrorText, Ext, Gap, Line, Muted, Rows, Strong } from '../output';
import { fail, type Command, type CommandContext } from './types';

function notFound(ctx: CommandContext, command: string, path: string) {
  return fail(
    <ErrorText>
      {format(ctx.t.console.out.noSuchPath, { command, path })}
    </ErrorText>
  );
}

/**
 * Clickable name: directories `cd`, files `cat`. The command uses an absolute
 * path so it still works after the working directory has moved on.
 */
function Entry({ node }: { node: FsNode }) {
  const target = displayPath(node.path);
  return node.kind === 'dir' ? (
    <Cmd run={`cd ${target}`} className="font-semibold text-fg">
      {node.name}/
    </Cmd>
  ) : (
    <Cmd run={`cat ${target}`} className="text-muted">
      {node.name}
    </Cmd>
  );
}

export const ls: Command = {
  name: 'ls',
  aliases: ['ll', 'dir'],
  usage: 'ls [-l] [path]',
  completer: { kind: 'path' },
  run(ctx, { name, args, flags }) {
    const long = flags.has('l') || name === 'll';
    const path = resolvePath(ctx.cwd, args[0] ?? '.');
    const node = lookup(ctx.root, path);
    if (!node) return notFound(ctx, 'ls', args[0]);
    if (node.kind === 'file') return <Entry node={node} />;
    if (!node.children.length) return <Muted>{ctx.t.console.out.empty}</Muted>;

    if (!long) {
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {node.children.map(child => (
            <Entry key={child.path} node={child} />
          ))}
        </div>
      );
    }
    return (
      <Rows
        rows={node.children.map(child => [
          <Entry key="name" node={child} />,
          <Muted key="meta">{child.meta ?? ''}</Muted>,
          <span key="title">{child.title ?? ''}</span>,
        ])}
      />
    );
  },
};

export const cd: Command = {
  name: 'cd',
  usage: 'cd [path]',
  completer: { kind: 'path', only: 'dir' },
  run(ctx, { args }) {
    const input = args[0] ?? '~';
    if (input === '-') {
      const target = ctx.previousCwd;
      const previous = target ? lookup(ctx.root, target) : null;
      if (previous?.kind !== 'dir') {
        return fail(<ErrorText>{ctx.t.console.out.oldpwdNotSet}</ErrorText>);
      }
      ctx.cd(previous.path, previous.href);
      return <Muted>{displayPath(previous.path)}</Muted>;
    }
    const node = lookup(ctx.root, resolvePath(ctx.cwd, input));
    if (!node) return notFound(ctx, 'cd', input);
    if (node.kind !== 'dir') {
      return fail(
        <ErrorText>
          {format(ctx.t.console.out.notADirectory, {
            command: 'cd',
            path: input,
          })}
        </ErrorText>
      );
    }
    ctx.cd(node.path, node.href);
    return null;
  },
};

export const pwd: Command = {
  name: 'pwd',
  run: ctx => displayPath(ctx.cwd),
};

export const open: Command = {
  name: 'open',
  needsArgument: true,
  aliases: ['xdg-open'],
  usage: 'open <path | github | linkedin | instagram | email>',
  completer: { kind: 'path' },
  run(ctx, { args }) {
    const target = args[0];
    if (!target) {
      return fail(
        <>
          <Line>
            <ErrorText>
              {format(ctx.t.console.out.missingOperand, { command: 'open' })}
            </ErrorText>
          </Line>
          <Muted>
            {format(ctx.t.console.out.usage, { usage: open.usage! })}
          </Muted>
        </>
      );
    }

    const social = ctx.index.profile.socials.find(
      s => s.id === target.toLowerCase()
    );
    if (social) {
      ctx.openExternal(social.href);
      return (
        <Muted>
          {format(ctx.t.console.out.opening, { target: social.label })}
        </Muted>
      );
    }
    if (target === 'email' || target === 'mail') {
      ctx.openExternal(`mailto:${ctx.index.profile.email}`);
      return (
        <Muted>
          {format(ctx.t.console.out.opening, {
            target: ctx.index.profile.email,
          })}
        </Muted>
      );
    }

    const node = lookup(ctx.root, resolvePath(ctx.cwd, target));
    if (!node) return notFound(ctx, 'open', target);
    if (node.kind === 'dir') {
      ctx.cd(node.path, node.href);
      return null;
    }
    if (/^https?:|\.pdf$/.test(node.href)) {
      ctx.openExternal(node.href);
      return (
        <Muted>
          {format(ctx.t.console.out.opening, { target: node.name })}
        </Muted>
      );
    }
    ctx.navigate(node.href, node.locale);
    return null;
  },
};

export const cat: Command = {
  name: 'cat',
  needsArgument: true,
  aliases: ['less', 'more', 'bat'],
  usage: 'cat <file>',
  completer: { kind: 'path' },
  run(ctx, { args }) {
    const input = args[0];
    if (!input) {
      return fail(
        <ErrorText>
          {format(ctx.t.console.out.missingOperand, { command: 'cat' })}
        </ErrorText>
      );
    }
    const node = lookup(ctx.root, resolvePath(ctx.cwd, input));
    if (!node) return notFound(ctx, 'cat', input);
    if (node.kind === 'dir') {
      return fail(
        <ErrorText>
          {format(ctx.t.console.out.isADirectory, {
            command: 'cat',
            path: input,
          })}
        </ErrorText>
      );
    }
    // cwd is read now: output renders later, after a chained `cd` may have run.
    return <FileView ctx={ctx} file={node} cwd={ctx.cwd} />;
  },
};

function OpenHint({
  ctx,
  file,
  cwd,
}: {
  ctx: CommandContext;
  file: FileNode;
  cwd: string;
}) {
  const [before, after] = ctx.t.console.out.readMore.split('{path}');
  return (
    <Line className="mt-[1lh] text-muted">
      {before}
      <Cmd run={`open ${displayPath(file.path)}`}>
        {relativePath(cwd, file.path)}
      </Cmd>
      {after}
    </Line>
  );
}

function FileView({
  ctx,
  file,
  cwd,
}: {
  ctx: CommandContext;
  file: FileNode;
  cwd: string;
}) {
  const { t, locale, index } = ctx;
  const { content } = file;

  switch (content.type) {
    case 'readme':
      return (
        <>
          <Line>
            <Strong>{index.profile.name}</Strong> — {index.profile.headline}
          </Line>
          <Gap />
          {index.profile.intro.map(paragraph => (
            <p key={paragraph} className="mb-[1lh] last:mb-0">
              {paragraph}
            </p>
          ))}
          <Line className="mt-[1lh] text-muted">
            →{' '}
            <Cmd run={`man ${index.profile.handle}`}>
              man {index.profile.handle}
            </Cmd>
          </Line>
        </>
      );

    case 'resume':
      return (
        <Line>
          <ErrorText>
            {format(t.console.out.binaryFile, { file: file.name })}
          </ErrorText>{' '}
          <Cmd run={`open ${displayPath(file.path)}`}>open</Cmd>
        </Line>
      );

    case 'project': {
      const project = index.projects.find(p => p.slug === content.slug)!;
      const meta = [
        t.work.category[project.category],
        project.year,
        t.work.status[project.status],
      ]
        .filter(Boolean)
        .join(' · ');
      return (
        <>
          <Line>
            <Strong>{project.title}</Strong> — {project.tagline}
          </Line>
          <Line className="text-muted">{meta}</Line>
          {project.summary && (
            <>
              <Gap />
              <p>{project.summary}</p>
            </>
          )}
          <Gap />
          <Line>
            <Muted>{t.work.fields.stack}:</Muted> {project.stack.join(', ')}
          </Line>
          {project.links.live && (
            <Line>
              <Muted>{t.work.links.live}:</Muted>{' '}
              <Ext href={project.links.live}>{project.links.live}</Ext>
            </Line>
          )}
          {project.links.source && (
            <Line>
              <Muted>{t.work.links.source}:</Muted>{' '}
              <Ext href={project.links.source}>{project.links.source}</Ext>
            </Line>
          )}
          <OpenHint ctx={ctx} file={file} cwd={cwd} />
        </>
      );
    }

    case 'post': {
      const post = index.posts.find(p => p.slug === content.slug)!;
      // The file's own translation, not whichever one this page shows.
      const text = post.variants[content.lang] ?? post;
      return (
        <>
          <div lang={content.lang}>
            <Line>
              <Strong>{text.title}</Strong>
            </Line>
          </div>
          <Line className="text-muted">
            {formatDate(post.date, locale, 'long')} ·{' '}
            {plural(locale, text.readingMinutes, t.blog.readingTime)} · #
            {post.tags.join(' #')}
          </Line>
          <Gap />
          <div lang={content.lang}>
            <p>{text.description}</p>
            {text.excerpt && (
              <>
                <Gap />
                <p className="text-muted">{text.excerpt}</p>
              </>
            )}
          </div>
          <OpenHint ctx={ctx} file={file} cwd={cwd} />
        </>
      );
    }

    case 'about':
      return (
        <AboutFile ctx={ctx} section={content.section} file={file} cwd={cwd} />
      );
  }
}

function AboutFile({
  ctx,
  section,
  file,
  cwd,
}: {
  ctx: CommandContext;
  cwd: string;
  section: 'experience' | 'skills' | 'education' | 'contact';
  file: FileNode;
}) {
  const { t, locale, index } = ctx;
  const { about, profile } = index;
  const monthYear = (value: string) => formatDate(value, locale, 'monthYear');

  switch (section) {
    case 'experience':
      return (
        <>
          {about.experience.map(role => (
            <div
              key={`${role.company}-${role.start}`}
              className="mb-[1lh] last:mb-0"
            >
              <Line>
                <Muted>
                  {monthYear(role.start)} –{' '}
                  {role.end ? monthYear(role.end) : t.about.present}
                </Muted>
              </Line>
              <Line>
                <Strong>{role.title}</Strong> · {role.company}
              </Line>
              <Line className="text-muted">{role.summary}</Line>
            </div>
          ))}
          <OpenHint ctx={ctx} file={file} cwd={cwd} />
        </>
      );
    case 'skills':
      return (
        <Rows
          rows={about.skills.map(group => [
            <Strong key="name">{group.name}</Strong>,
            <span key="items">{group.items.join(', ')}</span>,
          ])}
        />
      );
    case 'education':
      return (
        <>
          {about.education.map(entry => (
            <div key={entry.school}>
              <Line>
                <Strong>{entry.school}</Strong>
              </Line>
              <Line>
                {entry.degree}, {entry.field}
              </Line>
              <Line className="text-muted">
                {monthYear(entry.start)} – {monthYear(entry.end)}
                {entry.gpa && ` · ${format(t.about.gpa, { value: entry.gpa })}`}
              </Line>
            </div>
          ))}
        </>
      );
    case 'contact':
      return (
        <>
          <Line>
            <Muted>email</Muted> <Cmd run="email">{profile.email}</Cmd>
          </Line>
          {profile.socials.map(social => (
            <Line key={social.id}>
              <Muted>{social.id}</Muted>{' '}
              <Ext href={social.href}>{social.handle}</Ext>
            </Line>
          ))}
          <Line>
            <Muted>resume</Muted> <Cmd run="open ~/resume.pdf">resume.pdf</Cmd>
          </Line>
        </>
      );
  }
}

export const grep: Command = {
  name: 'grep',
  needsArgument: true,
  aliases: ['search', 'find'],
  usage: 'grep <text>',
  run(ctx, { args, rest }) {
    const query = (args.length ? args.join(' ') : rest).trim();
    if (!query) {
      return fail(
        <ErrorText>
          {format(ctx.t.console.out.missingOperand, { command: 'grep' })}
        </ErrorText>
      );
    }
    const needle = searchable(query);
    const matches = [
      ...ctx.index.projects
        .filter(p =>
          searchable(
            [p.title, p.tagline, p.summary ?? '', ...p.stack].join(' ')
          ).includes(needle)
        )
        .map(p => ({ path: `/work/${p.slug}`, title: p.title })),
      ...ctx.index.posts
        .filter(p =>
          searchable([p.title, p.description, ...p.tags].join(' ')).includes(
            needle
          )
        )
        .map(p => ({ path: `/blog/${p.slug}`, title: p.title })),
    ];

    if (!matches.length)
      return <Muted>{format(ctx.t.console.out.grepNoMatch, { query })}</Muted>;
    return (
      <>
        <Rows
          rows={matches.map(match => [
            <Cmd key="path" run={`cd ${displayPath(match.path)}`}>
              {displayPath(match.path)}/
            </Cmd>,
            <span key="title">{match.title}</span>,
          ])}
        />
        <Line className="mt-[1lh] text-muted">
          {plural(ctx.locale, matches.length, ctx.t.console.out.grepMatches)}
        </Line>
      </>
    );
  },
};
