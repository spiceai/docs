import yaml from 'yaml'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'

import { GITHUB_BLOG_REPO } from 'lib/constants'

type FrontMatter = {
  date: string
  title: string
  type: string
  author: string
  categories: string[]
  tags: string[]
}

export type ProcessedFile = FrontMatter & {
  description: string
  link: string
}

type GitHubContent = {
  download_url: string
  name: string
}

async function fetchContents(path: string): Promise<GitHubContent[]> {
  try {
    const response = await fetch(`${GITHUB_BLOG_REPO}/contents/${path}`, { cache: 'force-cache' })

    if (!response.ok) {
      throw new Error('Failed to fetch releases')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching releases:', error)
    return []
  }
}

async function fetchPostContent(url: string) {
  try {
    const response = await fetch(url, { cache: 'force-cache' })
    if (!response.ok) {
      throw new Error(`Failed to fetch content from ${url}`)
    }

    const content = await response.text()
    return content
  } catch (error) {
    console.error('Error fetching post content:', error)
    return null
  }
}

function generateBlogLink(date: string, title: string) {
  const formattedDate = date.replace(/-/g, '/')
  const formattedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[(),]/g, '')

  return `https://blog.spiceai.org/posts/${formattedDate}/${formattedTitle}`
}

export async function getFormattedData(): Promise<ProcessedFile[]> {
  const releases = await fetchContents('content/posts/releases')

  const processedReleases = []

  for (const release of releases) {
    try {
      const content = await fetchPostContent(release.download_url)

      if (!content) {
        continue
      }

      const result = await remark()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkExtractFrontmatter, { yaml: yaml.parse })
        .process(content)

      const frontmatter = result.data as FrontMatter
      const markdownContent = String(result)

      // Extract content between '---\n' and '## Highlights'
      const descriptionPiece = markdownContent.match(/---\n([\s\S]*?)\n## Highlights/)
      const description = descriptionPiece ? descriptionPiece[1].trim() : ''

      // Extract the last part of the content after the second '---\n'
      const regex = /---\n([\s\S]*)/
      const lastMessageDescription = description.match(regex)
      const finalContent = lastMessageDescription ? lastMessageDescription[1].trim() : ''

      processedReleases.push({
        ...frontmatter,
        description: finalContent,
        link: generateBlogLink(frontmatter.date, frontmatter.title)
      })
    } catch (error) {
      console.error('Error processing post:', release.name, error)
    }
  }
  const sortedReleases = processedReleases.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return sortedReleases.slice(0, 3)
}
