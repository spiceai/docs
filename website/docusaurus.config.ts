import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs'
import type { Options as BlogOptions } from '@docusaurus/plugin-content-blog'
import type { Options as PageOptions } from '@docusaurus/plugin-content-pages'

import tailwindPlugin from './plugins/tailwind-config.cjs'
import * as fs from 'fs'
import * as path from 'path'

// Load versions from versions.json if it exists (generated at build time)
const versionsPath = path.join(__dirname, 'versions.json')
const versions: string[] = fs.existsSync(versionsPath)
  ? JSON.parse(fs.readFileSync(versionsPath, 'utf-8'))
  : []

// Build version configuration dynamically
// Highest version (e.g., 1.11.x) is "next" (unreleased) at /docs/next
// Second highest version (e.g., 1.10.x) is "latest" at /docs (default)
// Previous versions are at /docs/v1.9, etc.
// Maintenance policy: latest + 1 previous minor versions are maintained
const hasVersions = versions.length > 0

// Extract the minor version number from versions to determine ordering and maintenance status
const getMinorVersion = (v: string): number => {
  const match = v.match(/^1\.(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

// Sort versions by minor version descending
const sortedVersions = [...versions].sort((a, b) => getMinorVersion(b) - getMinorVersion(a))

// Highest version is "next" (unreleased), second highest is "latest"
const nextVersion = sortedVersions[0] || null
const latestVersion = sortedVersions[1] || null
const latestMinor = latestVersion ? getMinorVersion(latestVersion) : 0

const docsVersionConfig = hasVersions
  ? {
      lastVersion: latestVersion!, // The stable release is the default
      onlyIncludeVersions: versions, // Exclude 'current' (trunk) from the dropdown
      versions: {
        ...Object.fromEntries(
          versions.map((version) => {
            const minor = getMinorVersion(version)
            const isNext = version === nextVersion
            const isLatest = version === latestVersion
            // Versions within latest - 1 are maintained (no banner)
            const isMaintained = minor >= latestMinor - 1

            if (isNext) {
              return [
                version,
                {
                  label: `Next (v${version.replace('.x', '')})`,
                  path: 'next',
                  banner: 'unreleased' as const
                }
              ]
            }

            return [
              version,
              {
                label: isLatest
                  ? `Latest (v${version.replace('.x', '')})`
                  : `v${version.replace('.x', '')}`,
                path: isLatest ? '' : `v${version.replace('.x', '')}`,
                banner: isMaintained ? ('none' as const) : ('unmaintained' as const)
              }
            ]
          })
        )
      }
    }
  : {
      // No versions generated - use current docs only (for local dev)
      lastVersion: 'current',
      versions: {
        current: {
          label: 'Latest',
          path: '',
          banner: 'none' as const
        }
      },
      onlyIncludeVersions: ['current']
    }

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

  onBrokenAnchors: 'throw',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true // required
    },
    experimental_faster: true
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
          editUrl: ({ versionDocsDirPath, docPath }) => {
            return `https://github.com/spiceai/docs/edit/trunk/website/${versionDocsDirPath}/${docPath}`
          },
          ...docsVersionConfig
        },
        blog: {
          path: 'blog',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          onUntruncatedBlogPosts: 'ignore',
          editUrl: ({ locale, blogDirPath, blogPath }) => {
            return `https://github.com/spiceai/docs/edit/trunk/website/${blogDirPath}/${blogPath}`
          },
          remarkPlugins: [],
          postsPerPage: 5,
          feedOptions: {
            type: 'all',
            description:
              'Keep up to date with upcoming Spice.ai OSS releases and articles by following our feed!',
            copyright: `Copyright © 2021-2026 Spice AI, Inc.`,
            xslt: true
          },
          blogTitle: 'Spice.ai OSS blog',
          blogDescription: 'Read blog posts about Spice.ai OSS from the team and community',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All Posts'
        } satisfies BlogOptions,
        pages: {
          remarkPlugins: [],
          showLastUpdateAuthor: true,
          showLastUpdateTime: true
        } satisfies PageOptions,
        theme: {
          customCss: ['./src/css/custom.css', './src/css/openapi.css', './src/css/preflight.css']
        },
        gtag: {
          trackingID: 'G-SST0X6NS37',
          anonymizeIP: true
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml'
        }
      } satisfies Preset.Options
    ]
  ],
  themes: ['docusaurus-theme-openapi-docs'],
  themeConfig: {
    // SEO metadata configuration
    metadata: [
      {
        name: 'keywords',
        content:
          'spice, spice.ai, sql query engine, ai compute engine, data federation, data acceleration, rag, retrieval augmented generation, arrow flight, datafusion, duckdb, rust, llm, openai compatible, mcp server'
      },
      { name: 'author', content: 'Spice AI, Inc.' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Spice.ai OSS' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Spice.ai - SQL Query and AI Compute Engine' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@spice_ai' },
      { name: 'twitter:creator', content: '@spice_ai' }
    ],
    announcementBar: {
      content: '<a href="/releases/v1.10.4">Spice.ai OSS v1.10.4</a> is now available! ⚡',
      backgroundColor: 'var(--announcement-bar-bg)',
      textColor: 'var(--announcement-bar-text)',
      isCloseable: true
    },
    navbar: {
      title: 'Spice.ai OSS',
      logo: {
        alt: 'Spice.ai OSS logo',
        src: 'img/logo.svg'
      },
      hideOnScroll: true,
      items: [
        {
          type: 'doc',
          position: 'left',
          docId: 'index',
          label: 'Docs'
        },
        {
          type: 'docSidebar',
          position: 'left',
          sidebarId: 'api',
          label: 'API'
        },
        { to: 'releases', label: 'Releases', position: 'left' },
        {
          label: 'Blog',
          href: 'https://spice.ai/blog',
          position: 'left'
        },
        { to: 'cookbook', label: 'Cookbook', position: 'left' },
        { to: 'docs/reference/sql', label: 'SQL Reference', position: 'left' },
        // Version dropdown is only shown when versions exist
        ...(hasVersions
          ? [
              {
                type: 'docsVersionDropdown' as const,
                position: 'right' as const,
                dropdownActiveClassDisabled: true
              }
            ]
          : []),
        {
          label: 'Try Spice Cloud',
          href: 'https://spice.ai/login',
          position: 'right'
        },
        {
          label: 'X',
          href: 'https://x.com/spice_ai',
          position: 'right'
        },
        {
          label: 'Slack',
          href: 'https://spiceai.org/slack',
          position: 'right'
        },
        {
          label: 'YouTube',
          href: 'https://www.youtube.com/@spiceai',
          position: 'right'
        },
        {
          href: 'https://github.com/spiceai/spiceai',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started'
            },
            {
              label: 'API',
              to: '/docs/api'
            },
            {
              label: 'CLI',
              to: '/docs/cli'
            },
            {
              label: 'SDKs',
              to: '/docs/sdks'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Reddit',
              href: 'https://reddit.com/r/spiceai'
            },
            {
              label: 'Slack',
              href: 'https://spiceai.org/slack'
            },
            {
              label: 'X',
              href: 'https://x.com/spice_ai'
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/@spiceai'
            }
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://spice.ai/blog'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/spiceai/spiceai'
            }
          ]
        }
      ],
      copyright: `Copyright © 2025 Spice AI, Inc.`
    },
    languageTabs: [
      {
        highlight: 'bash',
        language: 'curl',
        logoClass: 'curl'
      }
    ],
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.gruvboxMaterialDark,
      additionalLanguages: ['bash', 'json', 'csharp']
    },
    algolia: {
      appId: '0SP8I8JTL8',
      apiKey: '72f66fe334ccd3c7db696a123d68735c',
      indexName: 'spiceai',
      contextualSearch: false
    }
  } satisfies Preset.ThemeConfig,

  headTags: [
    // Structured data for SEO (JSON-LD)
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json'
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Spice.ai OSS',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Linux, macOS, Windows',
        description:
          'A portable SQL query and AI compute engine, written in Rust, for data-grounded apps and agents.',
        url: 'https://spiceai.org',
        downloadUrl: 'https://github.com/spiceai/spiceai/releases',
        softwareVersion: '1.10.0',
        author: {
          '@type': 'Organization',
          name: 'Spice AI, Inc.',
          url: 'https://spice.ai'
        },
        license: 'https://github.com/spiceai/spiceai/blob/trunk/LICENSE',
        programmingLanguage: 'Rust',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      })
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json'
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Spice AI, Inc.',
        url: 'https://spice.ai',
        logo: 'https://spiceai.org/img/logo.svg',
        sameAs: [
          'https://github.com/spiceai',
          'https://x.com/spice_ai',
          'https://www.youtube.com/@spiceai',
          'https://www.linkedin.com/company/spiceai'
        ]
      })
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com'
      }
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'true'
      }
    },
    {
      tagName: 'link',
      attributes: {
        href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap',
        rel: 'stylesheet'
      }
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png'
      }
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png'
      }
    },
    {
      tagName: 'script',
      attributes: {
        type: 'text/javascript',
        id: 'hs-script-loader',
        async: 'true',
        defer: 'true',
        src: '//js.hs-scripts.com/46107967.js'
      }
    },
    // SEO: hreflang for language targeting
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        hreflang: 'en',
        href: 'https://spiceai.org'
      }
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        hreflang: 'x-default',
        href: 'https://spiceai.org'
      }
    }
  ],

  plugins: [
    tailwindPlugin,
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'releases',
        path: 'releases',
        routeBasePath: 'releases',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        onUntruncatedBlogPosts: 'ignore',
        editUrl: ({ locale, blogDirPath, blogPath }) => {
          return `https://github.com/spiceai/docs/edit/trunk/website/${blogDirPath}/${blogPath}`
        },
        remarkPlugins: [],
        postsPerPage: 10,
        feedOptions: {
          type: 'all',
          description: 'Keep up to date with Spice.ai OSS releases by following our feed!',
          copyright: `Copyright © 2025-2026 Spice AI, Inc.`,
          xslt: true
        },
        blogTitle: 'Spice.ai OSS Releases',
        blogDescription: 'Spice.ai OSS release notes and announcements',
        blogSidebarCount: 'ALL',
        blogSidebarTitle: 'All Releases'
      } satisfies BlogOptions
    ],
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
              groupPathsBy: 'tag'
            }
          } satisfies OpenApiPlugin.Options
        }
      }
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/blog',
            to: 'https://spice.ai/blog'
          },
          {
            from: '/blog/announcing-1.0-stable',
            to: 'https://spice.ai/blog/announcing-spice-ai-open-source-1-0-stable'
          },
          {
            from: '/blog/amazon-s3-vectors-with-spice',
            to: 'https://spice.ai/blog/getting-started-with-amazon-s3-vectors-and-spice'
          },
          {
            from: '/blog/releases/v1.10-0',
            to: '/releases/v1.10.0'
          },
          {
            from: '/query-federation',
            to: '/docs/features/query-federation'
          },
          // 2021 blog posts
          {
            from: '/blog/a-new-class-of-applications-that-learn-and-adapt',
            to: 'https://spice.ai/blog/a-new-class-of-applications-that-learn-and-adapt'
          },
          {
            from: '/blog/2021/a-new-class-of-applications-that-learn-and-adapt',
            to: 'https://spice.ai/blog/a-new-class-of-applications-that-learn-and-adapt'
          },
          {
            from: '/blog/ai-needs-ai-ready-data',
            to: 'https://spice.ai/blog/ai-needs-ai-ready-data'
          },
          {
            from: '/blog/2021/ai-needs-ai-ready-data',
            to: 'https://spice.ai/blog/ai-needs-ai-ready-data'
          },
          {
            from: '/blog/making-apps-that-learn-and-adapt',
            to: 'https://spice.ai/blog/making-apps-that-learn-and-adapt'
          },
          {
            from: '/blog/2021/making-apps-that-learn-and-adapt',
            to: 'https://spice.ai/blog/making-apps-that-learn-and-adapt'
          },
          {
            from: '/blog/q-learning-reward-is-all-you-need',
            to: 'https://spice.ai/blog/q-learning-reward-is-all-you-need'
          },
          {
            from: '/blog/spiceais-approach-to-time-series-ai',
            to: 'https://spice.ai/blog/spiceais-approach-to-time-series-ai'
          },
          {
            from: '/blog/2021/spiceais-approach-to-time-series-ai',
            to: 'https://spice.ai/blog/spiceais-approach-to-time-series-ai'
          },
          {
            from: '/blog/spicepods-from-zero-to-hero',
            to: 'https://spice.ai/blog/spicepods-from-zero-to-hero'
          },
          {
            from: '/blog/2021/spicepods-from-zero-to-hero',
            to: 'https://spice.ai/blog/spicepods-from-zero-to-hero'
          },
          {
            from: '/blog/teaching-apps-how-to-learn-with-spicepods',
            to: 'https://spice.ai/blog/teaching-apps-how-to-learn-with-spicepods'
          },
          // 2022 blog posts
          {
            from: '/blog/adding-soft-actor-critic',
            to: 'https://spice.ai/blog/adding-soft-actor-critic'
          },
          {
            from: '/blog/building-on-apache-arrow-and-flight',
            to: 'https://spice.ai/blog/building-on-apache-arrow-and-flight'
          },
          {
            from: '/blog/what-data-informs-ai-driven-decision-making',
            to: 'https://spice.ai/blog/what-data-informs-ai-driven-decision-making'
          },
          {
            from: '/blog/2022/what-data-informs-ai-driven-decision-making',
            to: 'https://spice.ai/blog/what-data-informs-ai-driven-decision-making'
          },
          // 2024 blog posts
          {
            from: '/blog/adding-spice',
            to: 'https://spice.ai/blog/adding-spice-the-next-generation-of-spice-ai-oss'
          },
          {
            from: '/blog/2024/adding-spice',
            to: 'https://spice.ai/blog/adding-spice--the-next-generation-of-spice-ai-oss'
          },
          {
            from: '/federated-queries',
            to: '/docs/features/query-federation'
          },
          {
            from: '/data-ingestion',
            to: '/docs/features/data-ingestion'
          },
          {
            from: '/data-acceleration',
            to: '/docs/features/data-acceleration'
          },
          {
            from: '/monitoring',
            to: '/docs/features/observability'
          }
        ]
      }
    ],
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'Spice.ai OSS',
        siteDescription:
          'A portable SQL query and AI compute engine, written in Rust, for data-grounded apps and agents.',
        depth: 2,
        logLevel: 1,
        content: {
          includeBlog: false,
          includePages: true,
          includeDocs: true,
          enableLlmsFullTxt: true,
          enableMarkdownFiles: false,
          excludeRoutes: ['/tags/**', '/search', '/api/HTTP/**']
        },
        optionalLinks: [
          {
            title: 'GitHub Repository',
            url: 'https://github.com/spiceai/spiceai',
            description: 'Spice.ai OSS source code and issue tracker'
          },
          {
            title: 'Cookbook',
            url: 'https://github.com/spiceai/cookbook',
            description: 'Ready-to-use recipes and examples for Spice.ai'
          },
          {
            title: 'Spice Cloud Platform',
            url: 'https://spice.ai',
            description: 'Managed cloud platform for Spice.ai'
          }
        ]
      }
    ]
  ]
}

export default config
