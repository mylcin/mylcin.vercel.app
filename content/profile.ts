import type { Profile } from '@/lib/content/types';

export const profile: Profile = {
  name: 'Mustafa Yalçın',
  handle: 'mustafa',
  role: { en: 'Front-end developer', tr: 'Front-end geliştirici' },
  email: 'mustafa00yalcin@gmail.com',
  location: {
    city: 'Eskişehir',
    country: { en: 'Türkiye' },
    timeZone: 'Europe/Istanbul',
  },

  headline: {
    en: 'builds interfaces where simplicity and usability come first.',
    tr: 'sadeliğin ve kullanılabilirliğin önce geldiği arayüzler geliştirir.',
  },

  intro: {
    en: [
      'Front-end developer at PITON Technology in Eskişehir. Most days that means real-time dashboards and map-heavy (GIS) interfaces, built with React, Next.js and TypeScript — with the occasional detour into Node.js.',
      'Before that: freelance work, a Computer Engineering degree, and a good number of workshops with the Google Developer Student Club.',
    ],
    tr: [
      'Eskişehir’de, PITON Technology’de front-end geliştiriciyim. Çoğu gün bu; React, Next.js ve TypeScript ile gerçek zamanlı paneller ve harita ağırlıklı (GIS) arayüzler demek — arada bir de Node.js’e uğramak.',
      'Öncesinde: serbest çalışma, bir Bilgisayar Mühendisliği diploması ve Google Developer Student Club ile epeyce atölye.',
    ],
  },

  about: {
    en: [
      'I’m Mustafa, a front-end developer based in Eskişehir, Türkiye. I work at PITON Technology, where I build real-time dashboards and GIS-based location tracking interfaces.',
      'I studied Computer Engineering at Süleyman Demirel University and was on the core team of the Google Developer Student Club there. I freelanced for about a year before joining PITON in 2023.',
      'I build interfaces where simplicity and usability come first. Most of my work revolves around React, Next.js and TypeScript, with Node.js when a project needs a backend.',
      'I balance screen time with… well, different screen time: books and video games.',
    ],
    tr: [
      'Ben Mustafa; Eskişehir’de yaşayan bir front-end geliştiriciyim. PITON Technology’de gerçek zamanlı paneller ve GIS tabanlı konum takip arayüzleri geliştiriyorum.',
      'Süleyman Demirel Üniversitesi’nde Bilgisayar Mühendisliği okudum ve oradaki Google Developer Student Club’ın çekirdek ekibindeydim. 2023’te PITON’a katılmadan önce yaklaşık bir yıl serbest çalıştım.',
      'Sadeliğin ve kullanılabilirliğin önce geldiği arayüzler geliştiriyorum. İşlerimin çoğu React, Next.js ve TypeScript etrafında dönüyor; bir projenin backend’e ihtiyacı olduğunda da Node.js devreye giriyor.',
      'Ekran süremi… başka bir ekran süresiyle dengeliyorum: kitaplar ve video oyunları.',
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
      tr: 'Bir fikri, sadeliğin ve kullanılabilirliğin önce geldiği bir arayüze dönüştürür.',
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

  resume: { href: '/resume.pdf' },
  sourceUrl: 'https://github.com/mylcin/terminal-portfolio',
};
