import { Icon } from 'components/atoms/icon/icon'
import { Link } from 'components/atoms/link/link'
import { Logo } from 'components/atoms/logo/logo'
import { Button } from 'components/atoms/button/button'
import { StarsCount } from 'components/atoms/stars-count/stars-count'
import { HeaderMobile, HeaderMobileButton } from './header-mobile'

import { HeaderProvider } from './header-context'

export const NavLinks = () => (
  <>
    <Link href='#use-cases'>Use Cases</Link>
    <Link
      href='https://github.com/spiceai/cookbook#spiceai-oss-cookbook'
      target='_blank'
      rel='noopener noreferrer'
    >
      Cookbook
    </Link>
    <Link href='https://docs.spiceai.org' target='_blank' rel='noopener noreferrer'>
      Docs
    </Link>
  </>
)

export const Header = () => {
  return (
    <HeaderProvider>
      <header className='relative z-20'>
        <div className='fixed left-1/2 top-4 z-20 flex -translate-x-1/2 transform items-center gap-6 rounded-2xl bg-alpha-800 p-1 pr-11 shadow-box backdrop-blur-sm md:top-6 md:pr-1'>
          <div className='w-10'>
            <Logo variant={'logotype'} width={40} height={40} />
          </div>
          <nav className='flex items-center gap-6 whitespace-pre pl-8 md:pl-0'>
            <div className='hidden items-center gap-6 md:flex'>
              <NavLinks />
            </div>
            <Link
              href='https://github.com/spiceai/spiceai'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2'
            >
              <Icon iconName='github' className='h-6 w-6' />
              <StarsCount />
            </Link>
          </nav>
          <Button
            href='/#install-cli'
            rel='noopener noreferrer'
            variant={'negative'}
            size={'sm'}
            className='hidden md:block'
          >
            Installation
          </Button>
          <Button
            className='md:hidden'
            href='https://docs.spiceai.org'
            target='_blank'
            rel='noopener noreferrer'
            variant={'negative'}
            size={'sm'}
          >
            Docs
          </Button>
          <Button
            className='md:hidden'
            href='https://docs.spiceai.org/api'
            target='_blank'
            rel='noopener noreferrer'
            variant={'negative'}
            size={'sm'}
          >
            API
          </Button>
          <HeaderMobileButton />
        </div>
      </header>

      {/* The mobile header is separated to enable the blur effect, that's why a context is required */}
      <HeaderMobile />
    </HeaderProvider>
  )
}
