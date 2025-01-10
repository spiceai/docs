'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { beforeAndAfterSlides } from './data'
import { Title } from '../../atoms/title/title'
import { Button } from '../../atoms/button/button'
import { BeforeAndAfterSlide } from './before-and-after-slide'
import { Paragraph } from '../../atoms/paragraph/paragraph'

export const BeforeAndAfter = () => {
  const [isBefore, setIsBefore] = useState(true)

  return (
    <section className='relative mb-32 overflow-x-clip px-4 pb-2 pt-20 md:px-0'>
      <Title as='h2' variant='medium' className='pb-6 text-center'>
        Before and With Spice
      </Title>
      <Paragraph className='pb-6 text-center'>
        See how Spice has been deployed in production architectures.
      </Paragraph>

      <div className='relative'>
        <div className='absolute left-1/2 top-7 z-10 grid w-full -translate-x-1/2 grid-cols-2 items-center justify-center gap-2 px-6 sm:px-20 md:top-9 md:w-auto md:px-0'>
          <Button
            variant={'tag'}
            className={clsx('whitespace-pre', isBefore && 'bg-alpha-100')}
            onClick={() => setIsBefore(true)}
          >
            Before Spice
          </Button>
          <Button
            variant={'tag'}
            className={clsx(!isBefore && 'bg-alpha-100')}
            onClick={() => setIsBefore(false)}
          >
            With Spice
          </Button>
        </div>

        <BeforeAndAfterSlide slideData={beforeAndAfterSlides[0]} isBefore={isBefore} />
      </div>
    </section>
  )
}
