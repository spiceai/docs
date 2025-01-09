'use client'

import { useEffect, useState } from 'react'

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from 'components/ui/carousel'
import { Article } from 'components/molecules/article/article'
import { DotsPagination } from 'components/molecules/dots-pagination/dots-pagination'

import { ProcessedFile } from './utils'

export const ArticlesCarousel = ({ data }: { data: ProcessedFile[] }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <>
      <Carousel
        opts={{
          align: 'start',
          loop: true
        }}
        setApi={setApi}
        className='w-full'
      >
        <CarouselContent>
          {data.map((article, index) => (
            <CarouselItem key={index} className='md:basis-1/2 lg:basis-1/3'>
              <Article article={article} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <DotsPagination api={api} current={current} dotsLength={data.length} />
    </>
  )
}
