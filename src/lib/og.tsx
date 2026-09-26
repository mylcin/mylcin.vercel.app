import { ImageResponse } from 'next/og';
import { SITE_URL } from './site';

/**
 * Open Graph cards in the site's man-page style. Fonts are fetched from Google
 * Fonts at build time, subset to the exact characters used; if that fails
 * (offline build), Satori's bundled font is used instead.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

// Hex equivalents of the light theme tokens (Satori doesn't read CSS variables).
const colors = {
  bg: '#faf9f5',
  fg: '#221e1a',
  muted: '#6c645c',
  line: '#e4e0d8',
  accent: '#e0572a',
};

async function loadFont(family: string, weight: number, text: string) {
  const query = `family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(`https://fonts.googleapis.com/css2?${query}`).then(
    r => r.text()
  );
  const url = css.match(
    /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
  )?.[1];
  if (!url) throw new Error(`No font file for ${family}`);
  return fetch(url).then(r => r.arrayBuffer());
}

export async function ogImage({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer: string;
}) {
  const head = 'MUSTAFA(1)';
  const serifText = `${title}${subtitle ?? ''}`;
  const monoText = `${head}${eyebrow}${footer}`;

  let fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 }[] = [];
  try {
    fonts = [
      {
        name: 'Newsreader',
        data: await loadFont('Newsreader', 500, serifText),
        weight: 500,
      },
      {
        name: 'JetBrains Mono',
        data: await loadFont('JetBrains Mono', 400, monoText),
        weight: 400,
      },
    ];
  } catch {
    fonts = [];
  }

  const titleSize = title.length > 60 ? 60 : title.length > 36 ? 72 : 88;
  const clampedSubtitle =
    subtitle && subtitle.length > 140
      ? `${subtitle.slice(0, 137).trimEnd()}…`
      : subtitle;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: colors.bg,
        color: colors.fg,
        padding: '56px 72px',
        fontFamily: 'JetBrains Mono',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 22,
          color: colors.muted,
        }}
      >
        <span>{head}</span>
        <span>{eyebrow}</span>
        <span>{head}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'Newsreader',
            fontSize: titleSize,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        {clampedSubtitle && (
          <div
            style={{
              marginTop: 28,
              fontFamily: 'Newsreader',
              fontSize: 34,
              lineHeight: 1.3,
              color: colors.muted,
              maxWidth: 980,
            }}
          >
            {clampedSubtitle}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `2px solid ${colors.line}`,
          paddingTop: 24,
          fontSize: 22,
          color: colors.muted,
        }}
      >
        <span>{footer}</span>
        <div style={{ width: 96, height: 10, background: colors.accent }} />
      </div>
    </div>,
    { ...ogSize, fonts }
  );
}

export const ogHost = SITE_URL.replace(/^https?:\/\//, '');
