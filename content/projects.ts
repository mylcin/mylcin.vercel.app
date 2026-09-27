import type { Project } from '@/lib/content/types';

/**
 * Listed in this order everywhere. Only `slug`, `title`, `tagline`, `category`,
 * `status` and `stack` are required — the detail page renders whichever of the
 * optional sections exist, so a project can start small and grow a story later.
 */
export const projects: Project[] = [
  {
    slug: 'mylcin-vercel-app',
    title: { en: 'mylcin.vercel.app' },
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
      source: 'https://github.com/mylcin/mylcin.vercel.app',
    },
  },
  {
    slug: 'skycast',
    title: { en: 'skycast' },
    tagline: {
      en: 'Weather in the terminal: ASCII art, color-coded temperatures, forecasts and comparisons.',
      tr: 'Terminalde hava durumu: ASCII çizimler, renk kodlu sıcaklıklar, tahminler ve karşılaştırmalar.',
    },
    category: 'cli',
    status: 'live',
    year: 2026,
    featured: true,
    summary: {
      en: 'A command-line weather app for any place on Earth. “skycast Istanbul” shows the current weather with ASCII art; forecast, hourly and compare add up to 16 days, hourly sparklines and cities side by side. No API key: the data comes from Open-Meteo.',
      tr: 'Dünyanın her yeri için bir komut satırı hava durumu uygulaması. “skycast Istanbul” anlık durumu ASCII çizimle gösteriyor; forecast, hourly ve compare ile 16 güne kadar tahmin, saatlik sparkline grafikler ve yan yana şehirler geliyor. API anahtarı gerekmiyor: veri Open-Meteo’dan.',
    },
    why: {
      en: 'Most weather CLIs are a curl one-liner or a thin API wrapper. I wanted one built like a product: output that stays readable at 30 columns and in a pipe, errors that say what to do next, and a test suite that proves it.',
      tr: 'Çoğu hava durumu CLI’ı tek satırlık bir curl ya da ince bir API sarmalayıcı. Ben ürün gibi yapılmış bir tane istedim: 30 sütunda da pipe’ta da okunabilen çıktı, ne yapılacağını söyleyen hata mesajları ve bunu kanıtlayan bir test paketi.',
    },
    role: {
      en: 'All of it — design, code, tests, CI and the npm release.',
      tr: 'Hepsi — tasarım, kod, testler, CI ve npm yayını.',
    },
    highlights: {
      en: [
        'Any place on Earth; asks only when a name is truly ambiguous',
        'English and Turkish, metric and imperial, picked from the system locale',
        'Versioned --json output and meaningful exit codes for scripts',
        'Works offline from a cache, with a clear warning',
        'Shell completion for bash, zsh and fish',
        'One bundled file with zero runtime dependencies',
      ],
      tr: [
        'Dünyanın her yeri; yalnızca ad gerçekten belirsizse soruyor',
        'Sistem diline göre seçilen İngilizce ve Türkçe, metrik ve imperial birimler',
        'Betikler için sürümlü --json çıktısı ve anlamlı çıkış kodları',
        'Önbellekten çevrimdışı çalışma, açık bir uyarıyla',
        'bash, zsh ve fish için kabuk tamamlama',
        'Çalışma zamanı bağımlılığı olmayan tek bir paket dosyası',
      ],
    },
    decisions: [
      {
        title: {
          en: 'Providers behind an interface',
          tr: 'Sağlayıcılar bir arayüzün arkasında',
        },
        body: {
          en: 'API responses are validated with Zod and mapped to domain models at the edge. Commands and renderers never see Open-Meteo, so another weather API is one new provider away.',
          tr: 'API yanıtları sınırda Zod ile doğrulanıp alan modellerine dönüştürülüyor. Komutlar ve görünümler Open-Meteo’yu hiç görmüyor; başka bir hava durumu API’si tek bir yeni sağlayıcı uzaklıkta.',
        },
      },
      {
        title: {
          en: 'Layouts that degrade, not overflow',
          tr: 'Taşmayan, kademeli daralan görünümler',
        },
        body: {
          en: 'Tables drop their least important columns first and every view is tested down to 30 columns. Colors fall back from truecolor to 256 and 16, and disappear in pipes or with NO_COLOR.',
          tr: 'Tablolar önce en önemsiz sütunlarını bırakıyor ve her görünüm 30 sütuna kadar test ediliyor. Renkler truecolor’dan 256 ve 16 renge düşüyor; pipe’ta ya da NO_COLOR ile tamamen kayboluyor.',
        },
      },
      {
        title: {
          en: 'Tested against real responses',
          tr: 'Gerçek yanıtlarla test',
        },
        body: {
          en: 'Over 400 tests run on recorded API responses: snapshot views, a layout sweep from 30 to 160 columns and end-to-end runs of the built CLI, on Linux, macOS and Windows with Node 20, 22 and 24.',
          tr: '400’ü aşkın test kaydedilmiş gerçek API yanıtları üzerinde çalışıyor: görünüm snapshot’ları, 30’dan 160 sütuna genişlik taraması ve derlenmiş CLI’ın uçtan uca çalıştırılması; Linux, macOS ve Windows’ta Node 20, 22 ve 24 ile.',
        },
      },
    ],
    stack: [
      'Node.js',
      'TypeScript',
      'Commander.js',
      'Zod',
      'Vitest',
      'Open-Meteo',
    ],
    links: {
      package: 'https://www.npmjs.com/package/skycast',
      source: 'https://github.com/mylcin/skycast',
    },
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
