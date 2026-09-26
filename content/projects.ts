import type { Project } from '@/lib/content/types';

/**
 * Listed in this order everywhere. Only `slug`, `title`, `tagline`, `category`,
 * `status` and `stack` are required — the detail page renders whichever of the
 * optional sections exist, so a project can start small and grow a story later.
 */
export const projects: Project[] = [
  {
    slug: 'terminal-portfolio',
    title: { en: 'Terminal Portfolio' },
    tagline: {
      en: 'This site: a personal website with a shell built in.',
      tr: 'Bu site: içinde bir komut satırı olan kişisel web sitesi.',
    },
    category: 'web',
    status: 'live',
    year: 2025,
    featured: true,
    summary: {
      en: 'A personal website that reads like a manual page and doubles as a command line. Press ⌘K — or the console button — and the same content becomes explorable with ls, cd and cat.',
      tr: 'Bir kılavuz sayfası gibi okunan ve aynı zamanda komut satırı olan kişisel bir web sitesi. ⌘K’ye — ya da konsol düğmesine — bas; aynı içerik ls, cd ve cat ile gezilebilir hâle gelsin.',
    },
    why: {
      en: 'A portfolio is usually a page you scroll once. I wanted one that is also fun to poke at: the same content, readable as a document or explorable from a prompt.',
      tr: 'Portfolyolar genelde bir kez kaydırılıp geçilen sayfalardır. Ben kurcalaması da keyifli bir tane istedim: aynı içerik, ister bir belge gibi okunabiliyor ister komut satırından gezilebiliyor.',
    },
    role: {
      en: 'All of it — design, content model, front-end and the shell.',
      tr: 'Hepsi — tasarım, içerik modeli, front-end ve kabuk.',
    },
    decisions: [
      {
        title: {
          en: 'The console mirrors the URL',
          tr: 'Konsol URL’yi yansıtıyor',
        },
        body: {
          en: 'The prompt’s working directory is the current route. ls, cd and cat move through the real site structure, so the shell is an alternate interface rather than a separate app.',
          tr: 'İstemdeki çalışma dizini mevcut sayfanın yolu. ls, cd ve cat gerçek site yapısında dolaşıyor; yani kabuk ayrı bir uygulama değil, aynı sitenin başka bir arayüzü.',
        },
      },
      {
        title: {
          en: 'Content is data, not components',
          tr: 'İçerik bileşen değil, veri',
        },
        body: {
          en: 'Projects, experience and copy live in typed files; posts are MDX compiled on the server. Adding a project or a language never touches UI code.',
          tr: 'Projeler, deneyim ve metinler tipli dosyalarda; yazılar sunucuda derlenen MDX. Yeni bir proje ya da dil eklemek arayüz koduna dokunmayı gerektirmiyor.',
        },
      },
      {
        title: {
          en: 'Two languages, one set of components',
          tr: 'İki dil, tek bileşen seti',
        },
        body: {
          en: 'Locale-prefixed routes, dictionaries where a missing translation is a type error, and per-post translations that fall back to the original instead of a 404.',
          tr: 'Dil önekli yollar, eksik çevirinin tip hatası sayıldığı sözlükler ve çevirisi olmayan yazılarda 404 yerine aslına dönen bir yapı.',
        },
      },
      {
        title: {
          en: 'No animation library',
          tr: 'Animasyon kütüphanesi yok',
        },
        body: {
          en: 'Every transition is CSS or the View Transitions API, each one marks a state change, and all of them step aside for prefers-reduced-motion.',
          tr: 'Her geçiş CSS ya da View Transitions API ile yapılıyor, her biri bir durum değişikliğini işaret ediyor ve hepsi prefers-reduced-motion ile devre dışı kalıyor.',
        },
      },
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'MDX', 'Vercel'],
    links: {
      live: 'https://mylcin.vercel.app',
      source: 'https://github.com/mylcin/terminal-portfolio',
    },
  },
  {
    slug: 'weather-cli',
    title: { en: 'Weather CLI' },
    tagline: {
      en: 'Weather forecasts in the terminal, drawn in ASCII.',
      tr: 'Terminalde, ASCII ile çizilmiş hava durumu.',
    },
    category: 'cli',
    status: 'in-progress',
    featured: true,
    summary: {
      en: 'A command-line tool that fetches weather data and renders it with ASCII art and color-coded output. It supports multiple cities and forecasts.',
      tr: 'Hava durumu verisini çekip ASCII çizimler ve renk kodlu çıktılarla gösteren bir komut satırı aracı. Birden çok şehri ve tahminleri destekliyor.',
    },
    highlights: {
      en: ['ASCII art visualization', 'Supports 100+ cities worldwide'],
      tr: [
        'ASCII çizimlerle görselleştirme',
        'Dünya genelinde 100’den fazla şehir desteği',
      ],
    },
    stack: ['Node.js', 'TypeScript', 'Commander.js', 'Chalk'],
  },
  {
    slug: 'react-form-builder',
    title: { en: 'React Form Builder' },
    tagline: {
      en: 'A drag-and-drop form builder library for React.',
      tr: 'React için sürükle-bırak form oluşturma kütüphanesi.',
    },
    category: 'library',
    status: 'in-progress',
    summary: {
      en: 'An open-source library for building complex forms through a drag-and-drop interface, with validation, conditional logic and export built in.',
      tr: 'Karmaşık formları sürükle-bırak arayüzüyle oluşturmaya yarayan açık kaynak bir kütüphane; doğrulama, koşullu mantık ve dışa aktarma hazır geliyor.',
    },
    highlights: {
      en: [
        'Full TypeScript support',
        'Comprehensive documentation',
        'Currently in beta',
      ],
      tr: [
        'Tam TypeScript desteği',
        'Kapsamlı dokümantasyon',
        'Şu an beta aşamasında',
      ],
    },
    stack: ['React', 'TypeScript', 'React DnD', 'Zod'],
  },
];
