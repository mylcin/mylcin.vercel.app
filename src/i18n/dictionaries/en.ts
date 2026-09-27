import type { Plural } from '../format';

/**
 * Source of truth for UI copy. Other locales must match this shape exactly
 * (see `Dictionary` below), so a missing key is a type error, not a blank label.
 *
 * Conventions: `{name}` placeholders are filled by `format()`; objects with an
 * `other` key are plural forms for `plural()`. Content (bio, projects, posts)
 * lives in `/content`, not here.
 */
const en = {
  // Server-only (page metadata); not sent to the browser.
  meta: {
    workDescription:
      'Projects by {name}: what they are, why they exist, and what went into them.',
    blogDescription:
      'Notes on front-end work, security advisories read past the headline, and whatever I’m learning.',
    aboutDescription: 'Experience, skills, education and how to reach {name}.',
  },

  languageNames: { en: 'English', tr: 'Turkish' },

  nav: {
    skipToContent: 'Skip to content',
    work: 'Work',
    blog: 'Blog',
    about: 'About',
    primary: 'Primary',
    breadcrumbs: 'You are here',
    homeLink: '{name}, home page',
  },

  controls: {
    openConsole: 'Open console',
    language: 'Language',
    switchLanguage: 'Read in {language}',
    theme: 'Theme',
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    copy: 'Copy',
    copied: 'Copied',
    copyEmail: 'Copy email address',
    emailCopied: 'Email address copied',
    opensInNewTab: '(opens in a new tab)',
  },

  footer: {
    updated: 'Updated {date}',
    localTime: 'Local time in {city}',
    status: {
      asleep: 'probably asleep',
      working: 'probably at work',
      off: 'probably reading or gaming',
    },
  },

  home: {
    runningHead: 'Personal Manual',
    sections: {
      name: 'Name',
      synopsis: 'Synopsis',
      description: 'Description',
      work: 'Selected work',
      writing: 'Writing',
      seeAlso: 'See also',
      bugs: 'Bugs',
    },
    synopsisRun: 'run it',
    synopsisRunLabel: 'Run it in the console',
    allWork: 'All work',
    allPosts: 'All posts',
  },

  work: {
    title: 'Work',
    count: {
      one: '{count} project',
      other: '{count} projects',
    } satisfies Plural,
    intro:
      'Things I have built, am building, or keep meaning to finish. Each one has the short version and the longer story.',
    keyboardHint: '↑ ↓ to browse · ↵ to open',
    columns: { project: 'Project', status: 'Status' },
    fields: {
      summary: 'In short',
      why: 'Why it exists',
      highlights: 'Highlights',
      role: 'My part',
      decisions: 'Decisions',
      outcome: 'Outcome',
      stack: 'Stack',
      links: 'Links',
      status: 'Status',
    },
    links: {
      live: 'Live site',
      package: 'npm package',
      source: 'Source code',
      docs: 'Docs',
    },
    status: {
      live: 'Live',
      'in-progress': 'In progress',
      paused: 'Paused',
      archived: 'Archived',
    },
    category: {
      web: 'Web app',
      cli: 'CLI tool',
      library: 'Library',
      other: 'Other',
    },
    readCaseStudy: 'Read the full story',
    previous: 'Previous project',
    next: 'Next project',
    allWork: 'All work',
    pager: 'More projects',
    noDetails:
      'The long version of this one is still being written. The short version is above.',
    empty: 'Nothing here yet.',
  },

  blog: {
    title: 'Blog',
    count: { one: '{count} post', other: '{count} posts' } satisfies Plural,
    intro:
      'Notes on front-end work, security advisories read past the headline, and whatever I’m learning.',
    filterLabel: 'Filter by tag',
    allTags: 'All',
    clearFilter: 'Clear filter',
    filtered: {
      one: '{count} post tagged {tag}',
      other: '{count} posts tagged {tag}',
    } satisfies Plural,
    noMatches: 'No posts tagged {tag}.',
    empty: 'Nothing published yet.',
    readingTime: {
      one: '{count} min read',
      other: '{count} min read',
    } satisfies Plural,
    onlyIn: 'Only in {language}',
    updated: 'Updated {date}',
    toc: 'On this page',
    fallbackNotice:
      'No {current} translation yet — this is the {original} original.',
    availableIn: 'Read in {language}',
    writtenBy: 'Written by {name}',
    reply: 'Reply by email',
    replySubject: 'Re: {title}',
    newer: 'Newer',
    older: 'Older',
    related: 'Related',
    allPosts: 'All posts',
    pager: 'More posts',
    copyCode: 'Copy code',
  },

  about: {
    title: 'About',
    sections: {
      intro: 'Hello',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education',
      contact: 'Contact',
    },
    spokenLanguages: 'Spoken languages',
    present: 'Present',
    years: { one: '{count} yr', other: '{count} yrs' } satisfies Plural,
    months: { one: '{count} mo', other: '{count} mos' } satisfies Plural,
    employment: {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      contract: 'Freelance',
      internship: 'Internship',
    },
    gpa: 'GPA {value}',
  },

  notFound: {
    title: 'Page not found',
    command: 'cd: no such file or directory: {path}',
    body: 'The page moved, never existed, or I renamed it and forgot to leave a redirect.',
    home: 'Go to the home page',
    console: 'Look around in the console',
  },

  error: {
    title: 'Something broke',
    command: 'Segmentation fault (core dumped)',
    body: 'Not your fault. Try again — and if it keeps happening, let me know.',
    retry: 'Try again',
  },

  console: {
    title: 'Console',
    close: 'Close console',
    inputLabel: 'Command',
    placeholder: 'type a command, or try help',
    welcome: 'This is the same site, as a shell. Type a command, or pick one:',
    keys: '↑↓ history · tab complete · esc close',
    suggestions: 'Suggestions',
    quick: {
      home: 'Home',
      work: 'Work',
      blog: 'Blog',
      about: 'About',
      email: 'Copy email address',
      help: 'Everything else',
    },
    commands: {
      help: 'list commands, or explain one',
      ls: 'list what is in a directory',
      cd: 'go somewhere — this navigates the site',
      pwd: 'print where you are',
      cat: 'print a file',
      open: 'open a page, file or link',
      grep: 'search posts and projects',
      man: 'read the manual',
      mustafa: 'run the human',
      whoami: 'who are you, really',
      neofetch: 'system information, but for a person',
      email: 'copy my email address',
      lang: 'switch language',
      theme: 'switch theme',
      history: 'show what you typed',
      date: 'local time in {city}',
      echo: 'print text',
      clear: 'clear the screen',
      exit: 'close the console',
      ascii: 'a tiny ascii art gallery',
    },
    out: {
      notFound: 'command not found: {command}',
      didYouMean: 'did you mean {suggestion}?',
      helpHint: 'type help to see what I understand',
      noSuchPath: '{command}: no such file or directory: {path}',
      notADirectory: '{command}: not a directory: {path}',
      isADirectory: '{command}: {path}: is a directory',
      missingOperand: '{command}: missing operand',
      usage: 'usage: {usage}',
      invalidValue: '{command}: invalid value: {value} (expected {expected})',
      empty: '(empty)',
      copied: 'copied {text} to the clipboard',
      copyFailed: 'could not reach the clipboard — here it is: {text}',
      theme: 'theme: {theme}',
      themeNames: { light: 'light', dark: 'dark', system: 'system' },
      language: 'language: {language}',
      switchingLanguage: 'switching to {language}…',
      opening: 'opening {target}…',
      noHistory: 'no history yet',
      oldpwdNotSet: 'cd: OLDPWD not set',
      grepNoMatch: 'no matches for “{query}”',
      grepMatches: {
        one: '{count} match',
        other: '{count} matches',
      } satisfies Plural,
      helpTitle: 'commands',
      helpFooter: 'tab completes commands and paths. most output is clickable.',
      noManual: 'no manual entry for {page}',
      whatManual: 'What manual page do you want?',
      makeNoTarget:
        'make: *** No targets specified and no makefile found.  Stop.',
      whoami: 'a visitor. I’m {name}, and this is my site. Try: {command}',
      mustafaIdea: '“{idea}” sounds interesting. Tell me more: {email}',
      mustafaVersion: 'mustafa {version} — in production since {since}',
      mustafaSeeAlso: 'see also',
      options: 'options',
      readMore: 'open {path} for the rest',
      sudo: 'visitor is not in the sudoers file. This incident will be reported.',
      rm: 'nice try.',
      editor:
        'You are in {editor} now. Just kidding — you would never get out.',
      coffee: '418 I’m a teapot.',
      hello: 'hi! type help to see what I can do.',
      asciiList: 'available: {names}',
      neofetch: {
        os: 'os',
        osValue: 'Human (tr_TR)',
        host: 'host',
        uptime: 'uptime',
        location: 'location',
        role: 'role',
        stack: 'stack',
        languages: 'languages',
        hobbies: 'hobbies',
        theme: 'theme',
      },
    },
  },
};

// Literal strings become `string`, and plural objects become `Plural`, so a
// locale only has to provide the plural forms its language actually uses.
type Widen<T> = T extends string
  ? string
  : T extends { other: string }
    ? [Exclude<keyof T, Intl.LDMLPluralRule>] extends [never]
      ? Plural
      : { [K in keyof T]: Widen<T[K]> }
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;

export default en satisfies Dictionary;
