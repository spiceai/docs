/**
 * ArticleImage component generates and displays an image for an article title.
 * If the title contains a version number (e.g., "v1.2.3", "v1.0-rc.1", "v1.0.3-rc.4"),
 * it will be extracted and combined with "Spice.ai" prefix.
 *
 * @example
 * // Basic usage
 * <ArticleImage title="Regular Article Title" />
 * // Output: renders image with full title
 *
 * @example
 * // With version number
 * <ArticleImage title="Release Notes v1.2.3-beta" />
 * // Output: renders image with "Spice.ai v1.2.3-beta"
 *
 * @example
 * // With release candidate version
 * <ArticleImage title="Release Notes v1.0-rc.1" />
 * // Output: renders image with "Spice.ai v1.0-rc.1"
 *
 * @component
 */

interface ArticleImageProps {
  /** The title of the article */
  title: string
}

export const ArticleImage = ({ title }: ArticleImageProps) => {
  const versionRegex = /v\d+(\.\d+)*(-[a-zA-Z]+(\.\d+)*)?/
  const match = title.match(versionRegex)
  const shortTitle = match ? 'Spice ' + match[0] : title

  const imageUrl = `/generate-image?title=${encodeURIComponent(shortTitle)}`

  return (
    <img
      src={imageUrl}
      alt={title}
      width={600}
      height={400}
      className='w-full overflow-hidden rounded-[4px]'
    />
  )
}
