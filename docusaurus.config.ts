import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkCodeImport from "remark-code-import";


// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

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
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',
  trailingSlash: true,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

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
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
        hashed: true,
        language: ['he', 'en'],
        indexPages: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkCodeImport, remarkMath],
          rehypePlugins: [rehypeKatex],
        },

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
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'מדריכים',
        },
        {
          to: "/javadoc/",
          label: "Javadoc",
          position: "left",
          target: "_blank",
          rel: "noopener noreferrer",
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
              to: '/docs/intro',
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
