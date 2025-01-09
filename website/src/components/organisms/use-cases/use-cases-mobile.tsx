'use client'

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from 'components/ui/carousel'
import { useEffect, useState } from 'react'
import { dataUseCases } from './data'
import { UseCase } from 'components/molecules/use-case/use-case'
import { DotsPagination } from 'components/molecules/dots-pagination/dots-pagination'

export const UseCasesMobile = () => {
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
    <div className='relative lg:hidden'>
      <Carousel
        opts={{
          align: 'start',
          loop: true
        }}
        setApi={setApi}
        className='w-full'
      >
        <CarouselContent>
          {dataUseCases.map((useCase, index) => (
            <CarouselItem key={index}>
              <UseCase useCaseData={useCase} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <DotsPagination
        api={api}
        current={current}
        dotsLength={dataUseCases.length}
        className='md:block'
      />
    </div>
  )
}
