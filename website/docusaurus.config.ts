import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';
import type { Options as BlogOptions } from '@docusaurus/plugin-content-blog';
import type { Options as PageOptions } from '@docusaurus/plugin-content-pages';

import tailwindPlugin from './plugins/tailwind-config.cjs';

const config: Config = {
  title: 'Spice.ai OSS',
  tagline:
    'A portable SQL query and AI compute engine, written in Rust, for data-grounded apps and agents.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://spiceai.org',
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
          routeBasePath: '/docs',
          path: 'docs',
          sidebarPath: 'sidebars.ts',
          docItemComponent: '@theme/ApiItem',
          editUrl: 'https://github.com/spiceai/docs/tree/trunk/website/',
        },
        blog: {
          path: 'blog',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: ({ locale, blogDirPath, blogPath }) => {
            return `https://github.com/spiceai/docs/edit/trunk/website/${blogDirPath}/${blogPath}`;
          },
          remarkPlugins: [],
          postsPerPage: 5,
          feedOptions: {
            type: 'all',
            description:
              'Keep up to date with upcoming Spice.ai OSS releases and articles by following our feed!',
            copyright: `Copyright © 2025 Spice AI, Inc.`,
            xslt: true,
          },
          blogTitle: 'Spice.ai OSS blog',
          blogDescription:
            'Read blog posts about Spice.ai OSS from the team and community',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All Posts',
        } satisfies BlogOptions,
        pages: {
          remarkPlugins: [],
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        } satisfies PageOptions,
        theme: {
          customCss: ['./src/css/custom.css', './src/css/openapi.css', './src/css/preflight.css'],
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
        '<a href="https://github.com/spiceai/spiceai/releases/tag/v1.0.0">Spice.ai OSS v1.0-stable</a> is now available! 🚀',
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
          docId: 'index',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          position: 'left',
          sidebarId: 'api',
          label: 'API',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        { to: 'cookbook', label: 'Cookbook', position: 'left' },
        {
          label: 'X',
          href: 'https://x.com/spice_ai',
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
              to: '/docs/getting-started',
            },
            {
              label: 'API',
              to: '/docs/api',
            },
            {
              label: 'CLI',
              to: '/docs/cli',
            },
            {
              label: 'SDKs',
              to: '/docs/sdks',
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
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.gruvboxMaterialDark,
      additionalLanguages: ['bash', 'json', 'csharp'],
    },
    algolia: {
      appId: '0SP8I8JTL8',
      apiKey: '72f66fe334ccd3c7db696a123d68735c',
      indexName: 'spiceai',
      contextualSearch: false,
    },
  } satisfies Preset.ThemeConfig,

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: "true",
      },
    },
    {
      tagName: 'link',
      attributes: {
        href:
          'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap',
        rel: 'stylesheet',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
    },
  ],

  plugins: [
    tailwindPlugin,
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
            from: '/query-federation',
            to: '/docs/features/query-federation',
          },
          {
            from: '/federated-queries',
            to: '/docs/features/query-federation',
          },
          {
            from: '/data-ingestion',
            to: '/docs/features/data-ingestion',
          },
          {
            from: '/data-acceleration',
            to: '/docs/features/data-acceleration',
          },
          {
            from: '/monitoring',
            to: '/docs/features/observability',
          },
        ],
      },
    ],
  ],
};

export default config;
