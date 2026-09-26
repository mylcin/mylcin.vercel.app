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

/** Clickable name: directories `cd`, files `cat`. */
function Entry({ node, cwd }: { node: FsNode; cwd: string }) {
  const target = relativePath(cwd, node.path);
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
    if (node.kind === 'file') return <Entry node={node} cwd={ctx.cwd} />;
    if (!node.children.length) return <Muted>{ctx.t.console.out.empty}</Muted>;

    if (!long) {
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {node.children.map(child => (
            <Entry key={child.path} node={child} cwd={ctx.cwd} />
          ))}
        </div>
      );
    }
    return (
      <Rows
        rows={node.children.map(child => [
          <Entry key="name" node={child} cwd={ctx.cwd} />,
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
      if (!ctx.previousCwd) return null;
      const previous = lookup(ctx.root, ctx.previousCwd);
      if (previous?.kind === 'dir') ctx.cd(previous.path, previous.href);
      return <Muted>{displayPath(ctx.previousCwd)}</Muted>;
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
    return <FileView ctx={ctx} file={node} />;
  },
};

function OpenHint({ ctx, file }: { ctx: CommandContext; file: FileNode }) {
  const path = relativePath(ctx.cwd, file.path);
  const [before, after] = ctx.t.console.out.readMore.split('{path}');
  return (
    <Line className="mt-[1lh] text-muted">
      {before}
      <Cmd run={`open ${path}`}>{path}</Cmd>
      {after}
    </Line>
  );
}

function FileView({ ctx, file }: { ctx: CommandContext; file: FileNode }) {
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
            → <Cmd run="man mustafa">man {index.profile.handle}</Cmd>
          </Line>
        </>
      );

    case 'resume':
      return (
        <Line>
          <ErrorText>
            {format(t.console.out.binaryFile, { file: file.name })}
          </ErrorText>{' '}
          <Cmd run={`open ${relativePath(ctx.cwd, file.path)}`}>open</Cmd>
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
          <OpenHint ctx={ctx} file={file} />
        </>
      );
    }

    case 'post': {
      const post = index.posts.find(p => p.slug === content.slug)!;
      const sameLanguage = post.lang === content.lang;
      return (
        <>
          <Line>
            <Strong>
              {sameLanguage
                ? post.title
                : (post.titles[content.lang] ?? post.title)}
            </Strong>
          </Line>
          <Line className="text-muted">
            {formatDate(post.date, locale, 'long')} ·{' '}
            {plural(locale, post.readingMinutes, t.blog.readingTime)} · #
            {post.tags.join(' #')}
          </Line>
          <Gap />
          <p>{sameLanguage ? post.description : post.excerpt}</p>
          {sameLanguage && post.excerpt && (
            <>
              <Gap />
              <p className="text-muted">{post.excerpt}</p>
            </>
          )}
          <OpenHint ctx={ctx} file={file} />
        </>
      );
    }

    case 'about':
      return <AboutFile ctx={ctx} section={content.section} file={file} />;
  }
}

function AboutFile({
  ctx,
  section,
  file,
}: {
  ctx: CommandContext;
  section: 'experience' | 'skills' | 'education' | 'certificates' | 'contact';
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
          <OpenHint ctx={ctx} file={file} />
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
    case 'certificates':
      return (
        <Rows
          rows={about.certificates.map(cert => [
            <Muted key="date">{monthYear(cert.date)}</Muted>,
            cert.url ? (
              <Ext key="name" href={cert.url}>
                {cert.name}
              </Ext>
            ) : (
              <span key="name">{cert.name}</span>
            ),
            <Muted key="issuer">{cert.issuer}</Muted>,
          ])}
        />
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
