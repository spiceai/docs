import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Spice.ai OSS Docs',
  tagline:
    'A unified SQL query interface and portable runtime to locally materialize, accelerate, and query data tables sourced from any database, data warehouse, or data lake.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.spiceai.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'spiceai', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/spiceai/docs/tree/trunk/spiceaidocs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-SST0X6NS37',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    announcementBar: {
      content:
        '<a href="https://github.com/spiceai/spiceai/releases/tag/v0.20.0-beta">Spice.ai OSS v0.20.0-beta</a> is now available! 🚀',
      backgroundColor: 'var(--announcement-bar-bg)',
      textColor: 'var(--announcement-bar-text)',
      isCloseable: true,
    },
    navbar: {
      title: 'Spice.ai OSS Docs',
      logo: {
        alt: 'Spice.ai OSS logo',
        src: 'img/logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          type: 'doc',
          docId: 'getting-started/index',
          position: 'left',
          label: 'Getting Started',
        },
        {
          label: 'Blog',
          href: 'https://blog.spiceai.org',
          position: 'right',
        },
        {
          href: 'https://github.com/spiceai/spiceai',
          label: 'GitHub',
          position: 'right',
        },
        {
          label: 'Discord',
          href: 'https://discord.gg/kZnTfneP5u',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Reddit',
              href: 'https://reddit.com/r/spiceai',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/kZnTfneP5u',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/spice_ai',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://blog.spiceai.org',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/spiceai/spiceai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Spice AI, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'csharp'],
    },
    algolia: {
      appId: '0SP8I8JTL8',
      apiKey: '72f66fe334ccd3c7db696a123d68735c',
      indexName: 'spiceai',
      contextualSearch: false,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/federated-queries',
            to: '/features/federated-queries',
          },
          {
            from: '/data-ingestion',
            to: '/features/data-ingestion',
          },
          {
            from: '/data-acceleration',
            to: '/features/data-acceleration',
          },
        ],
      },
    ],
  ],
};

export default config;
