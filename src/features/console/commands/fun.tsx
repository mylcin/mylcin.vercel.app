import { format } from '@/i18n/format';
import { Cmd, ErrorText, Line, Muted } from '../output';
import { fail, type Command } from './types';

/** Kept in sync with the keys of ../ascii-art.ts (which loads on demand). */
export const ASCII_NAMES = [
  'rei',
  'asuka',
  'goku',
  'vegeta',
  'gojo',
  'frieren',
  'naruto',
  'guts',
  'ichigo',
  'pikachu',
];

export const ascii: Command = {
  name: 'ascii',
  usage: 'ascii [name]',
  completer: { kind: 'values', values: ASCII_NAMES },
  async run(ctx, { args }) {
    const name = args[0]?.toLowerCase();
    if (!name) {
      const [before] = ctx.t.console.out.asciiList.split('{names}');
      return (
        <Line className="text-muted">
          {before}
          {ASCII_NAMES.map((n, i) => (
            <span key={n}>
              {i > 0 && ', '}
              <Cmd run={`ascii ${n}`}>{n}</Cmd>
            </span>
          ))}
        </Line>
      );
    }
    const { default: art } = await import('../ascii-art');
    if (!art[name]) {
      return fail(
        <ErrorText>
          {format(ctx.t.console.out.invalidValue, {
            command: 'ascii',
            value: name,
            expected: 'ascii',
          })}
        </ErrorText>
      );
    }
    return (
      <pre
        aria-label={name}
        className="overflow-x-auto text-[0.5rem] leading-[1.15] sm:text-xs sm:leading-tight"
      >
        {art[name]}
      </pre>
    );
  },
};

// Hidden commands: not listed in help, not completed. Found by the curious.

export const sudo: Command = {
  name: 'sudo',
  hidden: true,
  run: ctx => fail(<ErrorText>{ctx.t.console.out.sudo}</ErrorText>),
};

export const rm: Command = {
  name: 'rm',
  aliases: ['rmdir', 'mv', 'chmod', 'chown', 'touch', 'mkdir'],
  hidden: true,
  run: ctx => fail(<ErrorText>{ctx.t.console.out.rm}</ErrorText>),
};

export const editor: Command = {
  name: 'vim',
  aliases: ['vi', 'nvim', 'nano', 'emacs', 'code'],
  hidden: true,
  run: (ctx, { name }) => (
    <Muted>{format(ctx.t.console.out.editor, { editor: name })}</Muted>
  ),
};

export const make: Command = {
  name: 'make',
  aliases: ['coffee', 'brew', 'tea', 'cay', 'çay'],
  hidden: true,
  run(ctx, { name, args }) {
    if (name === 'make' && args[0] !== 'coffee' && args[0] !== 'tea') {
      return fail(<ErrorText>{ctx.t.console.out.makeNoTarget}</ErrorText>);
    }
    return ctx.t.console.out.coffee;
  },
};

export const hello: Command = {
  name: 'hello',
  aliases: ['hi', 'hey', 'selam', 'merhaba', 'sa'],
  hidden: true,
  run: ctx => ctx.t.console.out.hello,
};
