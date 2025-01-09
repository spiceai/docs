import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';

const config: Config = {
  title: 'Spice.ai OSS',
  tagline:
    'A portable SQL query and AI compute engine, written in Rust, for data-grounded apps and agents.',
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
          routeBasePath: '/',
          sidebarPath: 'sidebars.ts',
          docItemComponent: '@theme/ApiItem',
          editUrl: 'https://github.com/spiceai/docs/tree/trunk/spiceaidocs/',
        },
        theme: {
          customCss: ['./src/css/custom.css', './src/css/openapi.css'],
        },
        gtag: {
          trackingID: 'G-SST0X6NS37',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],
  themes: ['docusaurus-theme-openapi-docs'],
  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    announcementBar: {
      content:
        '<a href="https://github.com/spiceai/spiceai/releases/tag/v1.0.0-rc.4">Spice.ai OSS v1.0.0-rc.4</a> is now available! 🚀',
      backgroundColor: 'var(--announcement-bar-bg)',
      textColor: 'var(--announcement-bar-text)',
      isCloseable: true,
    },
    navbar: {
      title: 'Spice.ai OSS',
      logo: {
        alt: 'Spice.ai OSS logo',
        src: 'img/logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          type: 'doc',
          position: 'left',
          docId: 'getting-started/index',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          position: 'left',
          sidebarId: 'api',
          label: 'API',
        },
        {
          href: 'https://github.com/spiceai/cookbook#spiceai-oss-cookbook',
          position: 'left',
          label: 'Cookbook',
        },
        {
          label: 'Blog',
          href: 'https://blog.spiceai.org',
          position: 'right',
        },
        {
          label: 'Discord',
          href: 'https://discord.gg/kZnTfneP5u',
          position: 'right',
        },
        {
          label: 'YouTube',
          href: 'https://www.youtube.com/@spiceai',
          position: 'right',
        },
        {
          href: 'https://github.com/spiceai/spiceai',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
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
            {
              label: 'API',
              to: '/api',
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
              label: 'X',
              href: 'https://x.com/spice_ai',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/@spiceai',
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
      copyright: `Copyright © 2025 Spice AI, Inc.`,
    },
    languageTabs: [
      {
        highlight: 'bash',
        language: 'curl',
        logoClass: 'curl',
      },
    ],
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
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          spice: {
            proxy: 'http://localhost:8090',

            specPath: 'public/openapi.json',
            outputDir: 'docs/api/HTTP',
            sidebarOptions: {
              groupPathsBy: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
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
