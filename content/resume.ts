import type {
  Certificate,
  Education,
  Role,
  SkillGroup,
} from '@/lib/content/types';

/** Newest first. */
export const experience: Role[] = [
  {
    company: { en: 'PITON Technology' },
    url: 'https://piton.com.tr',
    title: { en: 'Front-end developer', tr: 'Front-end geliştirici' },
    location: { en: 'Eskişehir, Türkiye' },
    type: 'full-time',
    start: '2023-01',
    summary: {
      en: 'Front-end for real-time dashboards and GIS-based location tracking.',
      tr: 'Gerçek zamanlı paneller ve GIS tabanlı konum takibi için front-end.',
    },
    highlights: {
      en: [
        'Designed and built multiple real-time dashboards serving 10K+ users',
        'Reduced page load time by 70% through optimization',
        'Integrated GIS for location tracking',
        'Mentored 5 junior developers',
        'Implemented a CI/CD pipeline that cut deployment time by 80%',
      ],
      tr: [
        '10 binden fazla kullanıcıya hizmet veren birden çok gerçek zamanlı panel tasarlayıp geliştirdim',
        'Optimizasyonlarla sayfa yükleme süresini %70 azalttım',
        'Konum takibi için GIS entegrasyonu yaptım',
        '5 junior geliştiriciye mentorluk yaptım',
        'Dağıtım süresini %80 kısaltan bir CI/CD hattı kurdum',
      ],
    },
    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Material UI',
      'Chakra UI',
      'Zustand',
      'React Query',
    ],
  },
  {
    company: { en: 'Freelance', tr: 'Serbest' },
    title: { en: 'Front-end web developer', tr: 'Front-end web geliştirici' },
    location: { en: 'Isparta, Türkiye' },
    type: 'contract',
    start: '2021-12',
    end: '2023-01',
    summary: {
      en: 'Websites and front-end work for small clients.',
      tr: 'Küçük müşteriler için web siteleri ve front-end işleri.',
    },
    highlights: {
      en: [
        'Designed and developed websites for 7 clients',
        'Reviewed and gave feedback across multiple projects',
        'Optimized and improved the performance of legacy applications',
      ],
      tr: [
        '7 müşteri için web sitesi tasarlayıp geliştirdim',
        'Birçok projede kod incelemesi yapıp geri bildirim verdim',
        'Eski uygulamaları optimize edip performanslarını iyileştirdim',
      ],
    },
    stack: ['React', 'jQuery', 'Bootstrap', 'MongoDB', 'Node.js', 'Figma'],
  },
  {
    company: { en: 'harmonyERP' },
    title: { en: 'Software developer', tr: 'Yazılım geliştirici' },
    location: { en: 'Sakarya, Türkiye' },
    type: 'internship',
    start: '2021-07',
    end: '2021-08',
    summary: {
      en: 'Two-month internship, building small projects for local clients.',
      tr: 'Yerel müşteriler için küçük projeler geliştirdiğim iki aylık staj.',
    },
    highlights: {
      en: [
        'Developed 2 projects for local clients',
        'Picked up new technologies on the job',
        'Learned to work as part of a team',
      ],
      tr: [
        'Yerel müşteriler için 2 proje geliştirdim',
        'İş başında yeni teknolojiler öğrendim',
        'Bir ekibin parçası olarak çalışmayı öğrendim',
      ],
    },
    stack: ['HTML', 'CSS', 'JavaScript', 'Kotlin', 'Firebase', 'Git'],
  },
];

export const skills: SkillGroup[] = [
  {
    name: { en: 'Front-end' },
    items: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Material UI',
      'Chakra UI',
      'Framer Motion',
      'Redux',
      'Zustand',
      'React Query',
    ],
  },
  {
    name: { en: 'Back-end' },
    items: [
      'Node.js',
      'Express.js',
      'MongoDB',
      'Mongoose',
      'GraphQL',
      'REST',
      'Prisma',
      'TypeORM',
      'Sequelize',
    ],
  },
  {
    name: { en: 'Tools & DevOps', tr: 'Araçlar ve DevOps' },
    items: [
      'Docker',
      'Git',
      'GitHub',
      'Vercel',
      'Linux',
      'Jenkins',
      'Figma',
      'Vite',
      'Vitest',
      'Postman',
      'Antigravity',
    ],
  },
];

export const education: Education[] = [
  {
    school: 'Süleyman Demirel University',
    degree: { en: 'Bachelor’s degree', tr: 'Lisans' },
    field: { en: 'Computer Engineering', tr: 'Bilgisayar Mühendisliği' },
    location: { en: 'Isparta, Türkiye' },
    start: '2018-09',
    end: '2022-10',
    gpa: '3.28 / 4.0',
    notes: {
      en: [
        'Graduated with an honor certificate',
        'Core team member of Google Developer Student Clubs',
        'Led technical workshops and coding sessions',
        'Took part in hackathons and coding competitions',
      ],
      tr: [
        'Onur belgesiyle mezun oldum',
        'Google Developer Student Clubs çekirdek ekip üyesiydim',
        'Teknik atölyeler ve kodlama oturumları düzenledim',
        'Hackathon’lara ve kodlama yarışmalarına katıldım',
      ],
    },
  },
];

/** Newest first. */
export const certificates: Certificate[] = [
  {
    name: 'Mastering TypeScript — 2022 Edition',
    issuer: 'Udemy',
    date: '2022-12',
    credentialId: 'UC-3df504fe-988b-40d6-b5e5-934ee862a796',
    url: 'https://www.udemy.com/certificate/UC-3df504fe-988b-40d6-b5e5-934ee862a796/',
  },
  {
    name: 'Next.js 15 & React — The Complete Guide',
    issuer: 'Udemy',
    date: '2022-12',
    credentialId: 'UC-5e64a055-7dd6-42a7-8b27-eb5165ea4e03',
    url: 'https://www.udemy.com/certificate/UC-5e64a055-7dd6-42a7-8b27-eb5165ea4e03/',
  },
  {
    name: 'Front-End Developer Bootcamp (with React)',
    issuer: 'techcareer.net',
    date: '2022-11',
    credentialId: '61686239515503',
    url: 'https://verified.sertifier.com/tr/verify/61686239515503/',
  },
];
