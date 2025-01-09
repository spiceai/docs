import { Container } from 'components/atoms/container/container'
import { Paragraph } from 'components/atoms/paragraph/paragraph'
import { Social } from 'components/molecules/social/social'

import { Logo } from 'components/atoms/logo/logo'
import { Link } from 'components/atoms/link/link'

export const Footer = () => {
  return (
    <Container>
      <footer className='flex flex-col gap-8 py-16 pt-0 md:py-20'>
        <div className='flex flex-col items-center justify-between gap-8 md:flex-row'>
          <Link href='https://spice.ai' target='_blank'>
            <Logo variant='dark' />
          </Link>

          <Social />
        </div>
        <div className='flex flex-col items-center justify-between gap-6 md:flex-row'>
          <nav className='flex items-center gap-6 md:gap-10'>
            <Link href='https://docs.spice.ai/security' variant='large'>
              Security
            </Link>
            <Link href='https://docs.spiceai.org' variant='large'>
              Docs
            </Link>
            <Link href='https://blog.spiceai.org' variant='large'>
              Blog
            </Link>
            <Link href='mailto:hey@spice.ai' variant='large'>
              Contact
            </Link>
          </nav>
          <div className='flex flex-col items-center gap-6 md:flex-row'>
            <Paragraph variant='medium' className='text-base'>
              Copyright © 2025 Spice AI, Inc. All rights reserved.
            </Paragraph>
            <div className='flex items-center gap-6'>
              <Link
                variant='large'
                href='https://docs.spice.ai/legal/privacy'
                className='text-base font-normal leading-7'
              >
                Privacy Policy
              </Link>
              <Link
                variant='large'
                href='https://docs.spice.ai/legal/terms'
                className='text-base font-normal leading-7'
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </Container>
  )
}
