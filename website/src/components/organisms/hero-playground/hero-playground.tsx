import React from 'react'
import { Title } from '../../atoms/title/title'
import { Button } from '../../atoms/button/button'
import { Container } from '../../atoms/container/container'
import { Paragraph } from '../../atoms/paragraph/paragraph'
import { Breakdown } from '../../atoms/breakdown/breakdown'

export const HeroPlayground = () => {
  return (
    <section className='relative pt-10 md:pt-12'>
      <Container>
        <div className='relative z-10 overflow-hidden rounded-lg border border-alpha-150 bg-neutral px-6 py-8 shadow-box md:px-20 md:pb-14 md:pt-20'>
          <Title
            as='h1'
            variant={'large'}
            className='mx-auto mb-6 mt-7 md:mt-0 md:text-center xl:max-w-[1020px]'
          >
            The portable <span className='text-primary'>data lakehouse</span>
            <br /> for every agent.
          </Title>

          <Paragraph className='mb-6 md:text-center'>
            Spice gives each app and agent fast, sandboxed access to only the data it needs through a
            single SQL endpoint for query, acceleration, search, and LLM inference. Built in Rust.
          </Paragraph>

          <div className='mb-14 grid grid-cols-2 items-center justify-center gap-3 md:flex'>
            <Button
              href='/#install-cli'
              rel='noopener noreferrer'
              variant={'primary'}
              className='border border-alpha-900 hover:border-primary'
            >
              Installation
            </Button>
            <Button
              href='https://docs.spiceai.org'
              target='_blank'
              rel='noopener noreferrer'
              variant={'secondary'}
            >
              Documentation
            </Button>
          </div>

          {/* <HeroPlaygroundOptions /> */}
          <Breakdown />

          <div className='hidden pt-14 md:block'>
            <Paragraph variant={'large'} className='mb-4 text-center font-bold'>
              Powered by
            </Paragraph>
            <div className='flex flex-wrap items-center justify-center gap-x-10 gap-y-6'>
              <img
                src={'/img/apache-arrow.svg'}
                alt='Apache Arrow Logo'
                className='h-9 w-auto object-contain dark:invert'
              />
              <img
                src={'/img/apache-datafusion.svg'}
                alt='Apache DataFusion Logo'
                className='h-8 w-auto object-contain dark:invert'
              />
              <img
                src={'/img/apache-ballista.svg'}
                alt='Apache Ballista Logo'
                className='h-6 w-auto object-contain dark:invert'
              />
              <img
                src={'/img/apache-iceberg.svg'}
                alt='Apache Iceberg Logo'
                className='h-7 w-auto object-contain dark:invert'
              />
              <img
                src={'/img/vortex.svg'}
                alt='Vortex Logo'
                className='h-7 w-auto object-contain dark:invert'
              />
              <img
                src={'/img/delta-lake.svg'}
                alt='Delta Lake Logo'
                className='h-7 w-auto object-contain dark:invert'
              />
            </div>
          </div>
        </div>
      </Container>

      <Background />
    </section>
  )
}

const Background = () => {
  return (
    <div className='absolute left-0 top-0 hidden h-[95%] w-full md:block'>
      <div className='flex h-full w-full flex-wrap gap-4 overflow-hidden'>
        {Array.from({ length: 130 }).map((_, index) => (
          <Line key={index} />
        ))}
      </div>
      <div className='absolute bottom-0 left-0 h-40 w-full bg-linear-to-t from-neutral-50' />
    </div>
  )
}

const Line = () => {
  return <div className='h-full w-px bg-alpha-50' />
}
