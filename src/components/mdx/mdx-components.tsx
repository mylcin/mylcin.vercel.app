import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { ExternalLink } from '@/components/ui/external-link';
import { CodeBlock } from './code-block';

function Heading({
  as: Tag,
  id,
  children,
}: {
  as: 'h2' | 'h3';
  id?: string;
  children: React.ReactNode;
}) {
  if (!id) return <Tag>{children}</Tag>;
  return (
    <Tag id={id} className="group relative">
      <a href={`#${id}`} className="no-underline">
        <span
          aria-hidden="true"
          className="absolute top-0 -left-6 hidden font-mono text-[0.8em] text-faint opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100 md:block"
        >
          #
        </span>
        {children}
      </a>
    </Tag>
  );
}

/** How Markdown elements render in posts. Typography lives in `.prose`. */
export function mdxComponents(locale: string): MDXComponents {
  return {
    h1: props => <Heading as="h2" {...props} />,
    h2: props => <Heading as="h2" {...props} />,
    h3: props => <Heading as="h3" {...props} />,
    a: ({ href = '', children, ...props }) => {
      if (/^https?:\/\//.test(href)) {
        return (
          <ExternalLink href={href} className="link">
            {children}
          </ExternalLink>
        );
      }
      if (
        href.startsWith('/') &&
        !href.startsWith(`/${locale}`) &&
        !/\.\w+$/.test(href)
      ) {
        return (
          <Link href={`/${locale}${href}`} className="link" {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className="link" {...props}>
          {children}
        </a>
      );
    },
    figure: ({ children, ...props }) =>
      'data-rehype-pretty-code-figure' in props ? (
        <>{children}</>
      ) : (
        <figure {...props}>{children}</figure>
      ),
    pre: props => <CodeBlock {...props} />,
    table: props => (
      <div className="overflow-x-auto">
        <table {...props} />
      </div>
    ),
    img: ({ alt = '', ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element -- MDX images have unknown dimensions
      <img alt={alt} loading="lazy" decoding="async" {...props} />
    ),
  };
}
