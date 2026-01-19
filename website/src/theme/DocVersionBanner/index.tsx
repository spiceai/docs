import React, { type ReactNode } from 'react'
import DocVersionBanner from '@theme-original/DocVersionBanner'
import type DocVersionBannerType from '@theme/DocVersionBanner'
import type { WrapperProps } from '@docusaurus/types'
import { useDocsVersion } from '@docusaurus/plugin-content-docs/client'
import Admonition from '@theme/Admonition'

type Props = WrapperProps<typeof DocVersionBannerType>

export default function DocVersionBannerWrapper(props: Props): ReactNode {
  const version = useDocsVersion()

  // Show enterprise support message for unmaintained versions
  const isUnmaintained = version?.banner === 'unmaintained'

  return (
    <>
      <DocVersionBanner {...props} />
      {isUnmaintained && (
        <Admonition type='tip' title='Enterprise Support Available'>
          <a href='https://spice.ai/pricing' target='_blank' rel='noopener noreferrer'>
            Spice.ai Enterprise
          </a>{' '}
          provides full support for up to 3 years from the release date.
        </Admonition>
      )}
    </>
  )
}
