'use client'

import clsx from 'clsx'
import { cn } from 'lib/utils'
import { CarouselApi } from 'components/ui/carousel'

type DotsPaginationProps = {
  api?: CarouselApi
  current: number
  handleCurrentIndexChange?: (index: number) => void
  className?: string
  dotsLength: number
}

export const DotsPagination = ({
  api,
  current,
  className,
  dotsLength,
  handleCurrentIndexChange
}: DotsPaginationProps) => {
  return (
    <div
      className={cn(
        'absolute -bottom-16 left-1/2 -translate-x-1/2 -translate-y-1/2 transform md:-bottom-20 md:hidden',
        className
      )}
    >
      <div className='flex gap-1'>
        {Array.from({ length: dotsLength }).map((_, index) => (
          <button
            type='button'
            onClick={() => {
              if (handleCurrentIndexChange) {
                handleCurrentIndexChange(index)
              } else {
                api?.scrollTo(index)
              }
            }}
            className='p-2 md:p-3'
            key={index}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span
              className={clsx(
                'block h-2 w-2 rounded-full md:h-3 md:w-3',
                current === index ? 'bg-alpha-900' : 'bg-alpha-300'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
