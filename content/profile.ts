import type { Profile } from '@/lib/content/types';

export const profile: Profile = {
  name: 'Mustafa Yalçın',
  /**
   * Shown in running heads (MUSTAFA(1)) and the console prompt, and used as
   * the console command that prints the synopsis (`mustafa --help`).
   */
  handle: 'mustafa',
  role: {
    en: 'Front-end software developer',
    tr: 'Front-end yazılım geliştirici',
  },
  email: 'mustafa00yalcin@gmail.com',
  location: {
    city: 'Eskişehir',
    country: { en: 'Türkiye' },
    timeZone: 'Europe/Istanbul',
  },

  description: {
    en: 'Front-end software developer in Eskişehir. Interfaces where simplicity and usability come first — plus notes on the web platform.',
    tr: 'Eskişehir’de front-end yazılım geliştirici. Sadeliği ve kullanılabilirliği ön planda tutan arayüzler — bir de web platformu üzerine notlar.',
  },

  headline: {
    en: 'builds interfaces where simplicity and usability come first.',
    tr: 'sadeliği ve kullanılabilirliği ön planda tutan arayüzler geliştirir.',
  },

  intro: {
    en: [
      'Front-end developer at PITON Technology in Eskişehir, where I lead front-end refactoring work on two production platforms, ITS and GIS. Most of it is React and Next.js, with performance and maintainable architecture as the recurring themes.',
      'I also mentor junior developers through code review and work closely with product and design. Before PITON: about a year of freelance work, and a Computer Engineering degree from Süleyman Demirel University.',
    ],
    tr: [
      'Eskişehir’deki PITON Technology’de front-end geliştiriciyim; iki canlı platformda (ITS ve GIS) front-end’i yeniden yapılandırma çalışmalarını yürütüyorum. İşimin çoğu React ve Next.js; performans ve sürdürülebilir mimari hep gündemde.',
      'Junior geliştiricilere kod incelemeleriyle mentorluk yapıyor, ürün ve tasarım ekipleriyle yakın çalışıyorum. PITON’dan önce yaklaşık bir yıl serbest çalıştım; Süleyman Demirel Üniversitesi’nde Bilgisayar Mühendisliği okudum.',
    ],
  },

  about: {
    en: [
      'I’m Mustafa, a front-end developer based in Eskişehir, Türkiye, with five years of building React and Next.js applications.',
      'At PITON Technology I lead front-end refactoring work. On two production platforms, ITS and GIS, that meant new rendering patterns and a shared component library, with measurable gains in load times, bug rates and release stability.',
      'I studied Computer Engineering at Süleyman Demirel University, where I was on the core team of the Google Developer Student Club and led technical workshops. I freelanced for about a year before joining PITON in 2023.',
      'I build interfaces where simplicity and usability come first. I balance screen time with… well, different screen time: books and video games.',
    ],
    tr: [
      'Ben Mustafa; Eskişehir’de yaşayan, beş yıldır React ve Next.js ile uygulama geliştiren bir front-end geliştiriciyim.',
      'PITON Technology’de front-end’i yeniden yapılandırma çalışmalarını yürütüyorum. İki canlı platformda (ITS ve GIS) bu; yeni render desenleri ve ortak bir bileşen kütüphanesi demekti. Sonuçlar da yükleme sürelerine, hata oranlarına ve sürüm kararlılığına ölçülebilir biçimde yansıdı.',
      'Süleyman Demirel Üniversitesi’nde Bilgisayar Mühendisliği okudum; orada Google Developer Student Clubs çekirdek ekibindeydim ve teknik atölyeler yürüttüm. 2023’te PITON’a katılmadan önce yaklaşık bir yıl serbest çalıştım.',
      'Sadeliği ve kullanılabilirliği ön planda tutan arayüzler geliştiriyorum. Ekran süremi… başka bir ekran süresiyle dengeliyorum: kitaplar ve video oyunları.',
    ],
  },

  synopsis: {
    flags: [
      {
        name: 'react',
        description: {
          en: 'component-driven interfaces',
          tr: 'bileşen tabanlı arayüzler',
        },
      },
      {
        name: 'next.js',
        description: {
          en: 'App Router, server components',
          tr: 'App Router, server component’ler',
        },
      },
      {
        name: 'typescript',
        description: { en: 'types all the way down', tr: 'baştan sona tipler' },
      },
      {
        name: 'gis',
        description: {
          en: 'maps, layers and location tracking',
          tr: 'haritalar, katmanlar ve konum takibi',
        },
      },
    ],
    argument: { en: 'idea', tr: 'fikir' },
    summary: {
      en: 'Turns an idea into an interface where simplicity and usability come first.',
      tr: 'Bir fikri, sadeliği ve kullanılabilirliği ön planda tutan bir arayüze dönüştürür.',
    },
  },

  bugs: {
    en: [
      'Reads the whole security advisory, not just the headline.',
      'Balances screen time with different screen time — books and video games.',
    ],
    tr: [
      'Güvenlik bültenlerini başlıkla yetinmeyip sonuna kadar okur.',
      'Ekran süresini başka bir ekran süresiyle dengeler: kitaplar ve video oyunları.',
    ],
  },

  languages: {
    en: 'Turkish (native), English, German',
    tr: 'Türkçe (ana dil), İngilizce, Almanca',
  },
  hobbies: { en: 'books, video games', tr: 'kitaplar, video oyunları' },

  socials: [
    {
      id: 'github',
      label: 'GitHub',
      handle: '@mylcin',
      href: 'https://github.com/mylcin',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      handle: 'mustfylcin',
      href: 'https://linkedin.com/in/mustfylcin',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@mustfylcin',
      href: 'https://instagram.com/mustfylcin',
    },
  ],
};
