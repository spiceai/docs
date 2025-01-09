'use client'

import { useEffect, useState } from 'react'

import { cn } from 'lib/utils'

import { heroPlaygroundData } from './data'
import { Title } from 'components/atoms/title/title'
import { PlaygroundTable } from './playground-table'

import { Button } from 'components/atoms/button/button'
import { Paragraph } from 'components/atoms/paragraph/paragraph'
import { DotsPagination } from 'components/molecules/dots-pagination/dots-pagination'
import { PlayIcon, TableCellsIcon } from '@heroicons/react/20/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Icon } from 'components/atoms/icon/icon'

export type ResponseData = {
  rowCount: number
  schema: Array<{
    name: string
    type: {
      name: string
    }
  }>
  rows: Array<Record<string, any>>
}

export const HeroPlaygroundOptions = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentData = heroPlaygroundData[currentIndex]
  const [requestDuration, setRequestDuration] = useState<number | null>(null)
  const [responseData, setResponseData] = useState<ResponseData | null>(null)
  const [isOpenTable, setIsOpenTable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? heroPlaygroundData.length - 1 : prevIndex - 1
    )
    setRequestDuration(null)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroPlaygroundData.length)
    setRequestDuration(null)
  }

  const handleCurrentIndexChange = (index: number) => {
    setCurrentIndex(index)
    setRequestDuration(null)
  }

  const handleRequest = async () => {
    if (requestDuration || isLoading) return

    setIsLoading(true)
    const startTime = performance.now()

    try {
      const response = await fetch(
        `https://data.spiceai.io/v0.1/sampler/${currentData.requestUrl}?api_key=313834%7C0666ecca421b4b33ba4d0dd2e90d6daa`
      )
      const data: ResponseData = await response.json()

      if (data?.rows?.length > 0) {
        setResponseData(data)
      }

      const endTime = performance.now()
      const durationInSeconds = (endTime - startTime) / 1000

      setRequestDuration(durationInSeconds)
    } catch (error) {
      console.error('Error fetching data:', error)
      setRequestDuration(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return
    }

    switch (event.code) {
      case 'ArrowLeft':
        handlePrev()
        break
      case 'ArrowRight':
        handleNext()
        break
      case 'Enter':
        handleRequest()
        break
      default:
        return
    }

    event.preventDefault()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleKeyDown])

  return (
    <div className='rounded-lg border border-alpha-150 bg-neutral pb-0 md:pb-10'>
      <div className='flex flex-col items-center justify-between gap-6 border-b border-alpha-150 px-6 py-8 md:flex-row md:gap-10 md:px-10 md:py-10'>
        <ArrowButton onClick={handlePrev} />
        <div>
          <Title as='h4' variant='small' className='mb-4 md:text-center'>
            {currentData.title}
          </Title>
          <Paragraph className='md:text-center'>{currentData.description}</Paragraph>
        </div>
        <ArrowButton onClick={handleNext} isLeft={false} />

        <MobileNavigation
          onPrev={handlePrev}
          onNext={handleNext}
          currentIndex={currentIndex}
          totalItems={heroPlaygroundData.length}
          handleCurrentIndexChange={handleCurrentIndexChange}
        />
      </div>

      <div className='flex flex-col gap-6 p-8 md:flex-row md:gap-10 md:p-10'>
        <div className='flex flex-col items-start gap-6 md:w-1/2 md:p-6'>
          <Title as='h4' variant='small'>
            SQL Query
          </Title>

          {currentData.code}

          <Button variant={'primary'} className='flex items-center gap-2' onClick={handleRequest}>
            {isLoading ? (
              <Icon iconName='spinner' className='h-5 w-5 animate-spin' />
            ) : (
              <PlayIcon className='h-5 w-5' />
            )}
            Run code
          </Button>
        </div>

        <div className='relative flex items-center justify-center overflow-hidden rounded-sm border border-dashed p-6 md:h-80 md:w-1/2'>
          {requestDuration == null ? (
            <Paragraph variant={'small'}>Run code to get results.</Paragraph>
          ) : (
            <div>
              <div className='flex flex-col items-center justify-center gap-2'>
                <p className='font-semibold text-neutral-600'>
                  {responseData?.rowCount} of {responseData?.rowCount} total results in{' '}
                  <span className='text-primary'>{requestDuration.toFixed(3)}</span> seconds.
                </p>

                {responseData?.schema && (
                  <PlaygroundTable
                    data={responseData}
                    isOpenTable={isOpenTable}
                    setIsOpenTable={setIsOpenTable}
                  />
                )}

                {responseData && responseData?.schema.length > 3 && (
                  <Button
                    variant={'brand'}
                    className='flex items-center gap-2'
                    onClick={() => setIsOpenTable(true)}
                  >
                    <TableCellsIcon className='h-5 w-5' />
                    View results
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ArrowButton = ({
  className,
  isLeft = true,
  onClick
}: {
  className?: string
  isLeft?: boolean
  onClick: () => void
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'z-10 hidden rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary md:block',
        className
      )}
    >
      {isLeft ? (
        <ChevronLeftIcon className='relative right-px h-6 w-6' />
      ) : (
        <ChevronRightIcon className='relative left-px h-6 w-6' />
      )}
    </button>
  )
}

export const MobileNavigation = ({
  onPrev,
  onNext,
  currentIndex,
  handleCurrentIndexChange,
  totalItems
}: {
  onPrev: () => void
  onNext: () => void
  currentIndex: number
  handleCurrentIndexChange: (index: number) => void
  totalItems: number
}) => {
  return (
    <div className='relative flex w-full items-center justify-between gap-2 md:hidden'>
      <button
        type='button'
        onClick={onPrev}
        className={
          'z-10 rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary'
        }
      >
        <ChevronLeftIcon className='relative right-px h-6 w-6' />
      </button>
      <DotsPagination
        className='bottom-auto translate-y-0'
        current={currentIndex}
        dotsLength={totalItems}
        handleCurrentIndexChange={handleCurrentIndexChange}
      />
      <button
        type='button'
        onClick={onNext}
        className={
          'z-10 rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary'
        }
      >
        <ChevronRightIcon className='relative right-px h-6 w-6' />
      </button>
    </div>
  )
}
