import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkCodeImport from "remark-code-import";


const config: Config = {
  title: 'EagleDocs',
  tagline: 'אתר התיעוד הרשמי של Desert Eagles',
  favicon: 'img/logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://deserteagles6104.com',
  baseUrl: '/docs/',
  trailingSlash: true,
  noIndex: true,

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'he',
    locales: ['he'],
    localeConfigs: {
      he: {
        label: 'עברית',
        direction: 'rtl',
        htmlLang: 'he',
      },
    },
  },

  customFields: {
    github: {
      owner: "Desert-Eagles-6104",
      repo: "robot2026",
      branch: "main",
      // path inside the repo where your Java sources live:
      srcRoot: "src/main/java/",
    },
  },

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css",
      type: "text/css",
    },
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        docsRouteBasePath: ['training', 'lib'],
        indexBlog: false,
        hashed: true,
        language: ['he', 'en'],
        indexPages: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'lib',
        path: 'docs/lib',
        routeBasePath: 'lib',
        sidebarPath: './sidebars/lib.ts',
        remarkPlugins: [remarkCodeImport, remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs/training',
          routeBasePath: 'training',
          sidebarPath: './sidebars/training.ts',
          remarkPlugins: [remarkCodeImport, remarkMath],
          rehypePlugins: [rehypeKatex],
        },

        blog: false,

        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'EagleDocs',
      logo: {
        alt: 'הלוגו של EagleDocs',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/control-playground/',
          position: 'left',
          label: 'מעבדת בקרה',
        },
        {
          to: '/training/getting-started/',
          position: 'left',
          label: 'מדריכים והכשרות',
          activeBaseRegex: '^/training/',
        },
        {
          to: '/lib/',
          position: 'left',
          label: 'ספריית DELib',
          activeBaseRegex: '^/lib/',
        },
        {
          to: '/javadoc/',
          label: 'Javadoc',
          position: 'left',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        {
          href: 'https://github.com/Desert-Eagles-6104/EagleDocs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'תיעוד',
          items: [
            {
              label: 'מדריכים',
              to: '/docs/training/getting-started/',
            },
          ],
        },
        {
          title: 'קישורים נוספים',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Desert-Eagles-6104/EagleDocs',
            },
          ],
        },
      ],
      copyright: `כל הזכויות שמורות © ${new Date().getFullYear()} Desert Eagles 6104. נבנה באמצעות Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash',  'yaml', 'json', 'latex'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
