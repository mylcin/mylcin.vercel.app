import { evaluate } from '@mdx-js/mdx';
import type { Element, ElementContent, Root } from 'hast';
import type { MDXComponents } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { createCssVariablesTheme } from 'shiki';

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

// Token colors come from CSS variables (see globals.css), so code blocks use
// the site palette and follow the theme without shipping two Shiki themes.
const codeTheme = createCssVariablesTheme({
  name: 'site',
  variablePrefix: '--code-',
  fontStyle: true,
});

const prettyCode: PrettyCodeOptions = {
  // A CSS-variables theme is a valid Shiki theme; the plugin's type is narrower.
  theme: codeTheme as PrettyCodeOptions['theme'],
  keepBackground: false,
  defaultLang: { block: 'plaintext' },
  transformers: [
    {
      // Keep the raw source on <pre> for the copy button.
      pre(node) {
        node.properties['data-raw'] = this.source;
      },
    },
  ],
};

function textOf(node: ElementContent | Element): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

/** Collects h2/h3 ids (added by rehype-slug) for the table of contents. */
function rehypeToc(toc: TocItem[]) {
  return () => (tree: Root) => {
    for (const node of tree.children) {
      if (node.type !== 'element') continue;
      if (node.tagName !== 'h2' && node.tagName !== 'h3') continue;
      const id = node.properties.id;
      if (typeof id !== 'string') continue;
      toc.push({
        id,
        text: textOf(node).trim(),
        depth: node.tagName === 'h2' ? 2 : 3,
      });
    }
  };
}

/** Compiles MDX on the server. Nothing MDX-related reaches the client bundle. */
export async function compileMdx(source: string) {
  const toc: TocItem[] = [];
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeToc(toc), [rehypePrettyCode, prettyCode]],
  });

  return {
    toc,
    Content: Content as (props: {
      components?: MDXComponents;
    }) => React.ReactNode,
  };
}
