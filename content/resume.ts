import type { Education, Role, SkillGroup } from '@/lib/content/types';

/** Experience, skills and education for the About page. Newest first. */
export const experience: Role[] = [
  {
    company: { en: 'PITON Technology' },
    url: 'https://piton.com.tr',
    title: { en: 'Front-end developer', tr: 'Front-end geliştirici' },
    location: { en: 'Eskişehir, Türkiye' },
    type: 'full-time',
    start: '2023-01',
    summary: {
      en: 'Front-end architecture and refactoring for two production platforms, ITS and GIS.',
      tr: 'İki canlı platformun (ITS ve GIS) front-end mimarisi ve yeniden yapılandırılması.',
    },
    highlights: {
      en: [
        'Refactored the front-end architecture of two production platforms (ITS and GIS) with modern React rendering patterns and Next.js dynamic imports: page load times down by up to 70%, Time to Interactive down 40%, Core Web Vitals scores up 25%',
        'Standardized the front-end around clean architecture principles and a reusable component library, reducing production bugs by 80% and hotfixes by 30%',
        'Resolved recurring rendering bottlenecks and cross-browser inconsistencies, cutting front-end incidents by roughly 45% while keeping delivery 100% on time',
        'Mentored 5+ junior developers and interns, and introduced a structured code review process that raised PR acceptance rates by roughly 35%',
        'Worked with UX/UI and product teams on accessibility and performance, contributing to a 20% increase in user satisfaction scores',
        'Evaluated and introduced new front-end tools, shortening development cycles by roughly 15%',
      ],
      tr: [
        'İki canlı platformun (ITS ve GIS) front-end mimarisini modern React render desenleri ve Next.js dinamik import’larıyla yeniden yapılandırdım: sayfa yükleme süreleri %70’e varan oranda, Time to Interactive %40 azaldı; Core Web Vitals skorları %25 arttı',
        'Front-end’i clean architecture ilkeleri ve yeniden kullanılabilir bir bileşen kütüphanesi etrafında standartlaştırdım; canlıdaki hataları %80, hotfix’leri %30 azalttım',
        'Tekrarlayan render darboğazlarını ve tarayıcılar arası tutarsızlıkları giderdim; front-end kaynaklı olayları yaklaşık %45 azaltırken teslimatların tamamını zamanında yaptım',
        '5’ten fazla junior geliştirici ve stajyere mentorluk yaptım; PR kabul oranını yaklaşık %35 artıran yapılandırılmış bir kod inceleme süreci başlattım',
        'UX/UI ve ürün ekipleriyle erişilebilirlik ve performans üzerinde çalıştım; kullanıcı memnuniyeti puanlarındaki %20’lik artışa katkı sağladım',
        'Yeni front-end araçlarını değerlendirip ekibe kazandırdım; geliştirme döngülerini yaklaşık %15 kısalttım',
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
      en: 'Responsive websites for 7+ independent clients, built and maintained.',
      tr: '7’den fazla bağımsız müşteri için responsive web siteleri; geliştirme ve bakım.',
    },
    highlights: {
      en: [
        'Built and maintained responsive websites for 7+ independent clients, using usability feedback to improve navigation and layout',
        'Worked directly with clients through multiple revision cycles, refining layout, accessibility and interactive elements',
        'Implemented SEO best practices across markup, performance and content structure',
        'Optimized code and asset delivery to reduce page load times and improve stability',
        'Integrated third-party APIs and services to extend functionality and automate client workflows',
      ],
      tr: [
        '7’den fazla bağımsız müşteri için responsive web siteleri geliştirip bakımını üstlendim; kullanılabilirlik geri bildirimleriyle gezinmeyi ve yerleşimi iyileştirdim',
        'Müşterilerle birden çok revizyon turunda doğrudan çalışarak yerleşimi, erişilebilirliği ve etkileşimli öğeleri geliştirdim',
        'İşaretleme, performans ve içerik yapısında SEO’ya uygun pratikleri uyguladım',
        'Kod ve dosya teslimini optimize ederek sayfa yükleme sürelerini kısalttım, kararlılığı artırdım',
        'Üçüncü taraf API’ler ve servislerle işlevselliği genişlettim, müşteri iş akışlarını otomatikleştirdim',
      ],
    },
    stack: ['React', 'jQuery', 'Bootstrap', 'MongoDB', 'Node.js', 'Figma'],
  },
  {
    company: { en: 'HarmonyERP' },
    title: {
      en: 'Software developer intern',
      tr: 'Yazılım geliştirme stajyeri',
    },
    location: { en: 'Sakarya, Türkiye' },
    type: 'internship',
    start: '2021-08',
    end: '2021-09',
    summary: {
      en: 'Two months on an Android application, in a five-person engineering team.',
      tr: 'Beş kişilik bir mühendislik ekibinde, bir Android uygulaması üzerinde iki ay.',
    },
    highlights: {
      en: [
        'Built 2 production-ready features in Kotlin for an Android application, shipped as part of a demo release',
        'Implemented authentication and data-handling flows with Firebase, taking part in daily stand-ups and code reviews',
        'Worked with stakeholders to clarify requirements for new mobile features',
        'Debugged and resolved defects throughout the development cycle',
      ],
      tr: [
        'Bir Android uygulaması için Kotlin ile canlıya hazır 2 özellik geliştirdim; bir demo sürümüyle birlikte yayınlandı',
        'Firebase ile kimlik doğrulama ve veri işleme akışlarını geliştirdim; günlük stand-up’lara ve kod incelemelerine katıldım',
        'Paydaşlarla yeni mobil özelliklerin gereksinimlerini netleştirdim',
        'Geliştirme süreci boyunca hataları ayıklayıp giderdim',
      ],
    },
    stack: ['Kotlin', 'Android', 'Firebase', 'Git'],
  },
];

export const skills: SkillGroup[] = [
  {
    name: { en: 'Programming languages', tr: 'Programlama dilleri' },
    items: { en: ['JavaScript', 'TypeScript', 'HTML', 'CSS'] },
  },
  {
    name: { en: 'Frameworks & libraries', tr: 'Framework ve kütüphaneler' },
    items: {
      en: [
        'React',
        'Next.js',
        'Svelte',
        'SvelteKit',
        'Solid.js',
        'SolidStart',
        'Node.js',
      ],
    },
  },
  {
    name: { en: 'Tools & practices', tr: 'Araçlar ve pratikler' },
    items: {
      en: [
        'Git',
        'API integration',
        'Unit testing',
        'Agile',
        'Clean architecture',
        'Responsive design',
        'Performance optimization',
        'Debugging',
        'UX/UI collaboration',
      ],
      tr: [
        'Git',
        'API entegrasyonu',
        'Birim testi',
        'Agile',
        'Clean architecture',
        'Responsive tasarım',
        'Performans optimizasyonu',
        'Hata ayıklama',
        'UX/UI iş birliği',
      ],
    },
  },
];

export const education: Education[] = [
  {
    school: {
      en: 'Süleyman Demirel University',
      tr: 'Süleyman Demirel Üniversitesi',
    },
    degree: { en: 'B.Sc.', tr: 'Lisans' },
    field: { en: 'Computer Engineering', tr: 'Bilgisayar Mühendisliği' },
    location: { en: 'Isparta, Türkiye' },
    start: '2018-09',
    end: '2022-10',
    gpa: { en: '3.28 / 4.00', tr: '3,28 / 4,00' },
    notes: {
      en: [
        'Graduated with an honor certificate',
        'Core team member of Google Developer Student Clubs',
        'Led technical workshops and coding sessions',
        'Took part in hackathons and coding competitions',
      ],
      tr: [
        'Onur belgesiyle mezun oldum',
        'Google Developer Student Clubs çekirdek ekibindeydim',
        'Teknik atölyeler ve kodlama oturumları yürüttüm',
        'Hackathon’lara ve kodlama yarışmalarına katıldım',
      ],
    },
  },
];
