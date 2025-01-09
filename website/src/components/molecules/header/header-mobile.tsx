'use client'

import clsx from 'clsx'
import { useContext } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { NavLinks } from './header'
import { HeaderContext } from './header-context'

export const HeaderMobileButton = () => {
  const { isMenuOpen, setIsMenuOpen } = useContext(HeaderContext)

  const toggleMenu = () => setIsMenuOpen(() => !isMenuOpen)

  return (
    <button
      type='button'
      className='absolute right-2.5 top-3 z-50 text-neutral md:hidden'
      onClick={toggleMenu}
      aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
    >
      {isMenuOpen ? <XMarkIcon className='h-6 w-6' /> : <Bars3Icon className='h-6 w-6' />}
    </button>
  )
}

export const HeaderMobile = () => {
  const { isMenuOpen, setIsMenuOpen } = useContext(HeaderContext)

  return (
    <div
      className={clsx(
        'fixed inset-x-0 top-[74px] z-40 mx-4 rounded-2xl bg-alpha-800 p-1 shadow-box backdrop-blur-lg transition-opacity duration-150 md:hidden',
        isMenuOpen
          ? 'animate-slide-down opacity-100'
          : 'animate-slide-up pointer-events-none opacity-0'
      )}
    >
      <nav className='flex flex-col items-center gap-6 p-6'>
        <NavLinks />

        <div className='h-2 w-full border-t border-neutral-600' />
        <button aria-label='Close menu' onClick={() => setIsMenuOpen(false)}>
          <XMarkIcon className='h-6 w-6 text-neutral' />
        </button>
      </nav>
    </div>
  )
}
