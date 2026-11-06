import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { Container } from '../../atoms/container/container';

import { Button } from '../../atoms/button/button';
import { Title } from '../../atoms/title/title';
import { Icon } from '../../atoms/icon/icon';
import { Logo } from '../../atoms/logo/logo';

import { classNames } from '../../../lib/utils';

import { Link } from '../../atoms/link/link';

export const Cta = ({ className }: { className?: string }) => {
  return (
    <Container className='px-0'>
      <section
        className={classNames(
          'my-20 overflow-hidden rounded-none bg-alpha-900 px-8 py-16 sm:rounded-2xl md:p-14 xl:p-20',
          className
        )}
      >
        <Logo variant='white' />
        <Title as='h2' variant='medium' className='my-14 max-w-4xl text-neutral'>
          A standard, portable lakehouse for every agent, app, and team.{' '}
          <span className='text-primary'>Get up and running in under a minute.</span>
        </Title>

        <div className='flex items-center gap-6'>
          <Button
            href='https://docs.spiceai.org/installation'
            target='_blank'
            rel='noopener noreferrer'
            variant='brand'
            size='lg'
            className='flex items-center gap-2'
          >
            <ArrowRightIcon className='h-6 w-6' />
            Installation
          </Button>
          <Link
            href='https://github.com/spiceai/spiceai'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-2'
          >
            <Icon
              iconName='github'
              width='40px'
              height='40px'
              className='fill-neutral transition-colors group-hover:fill-primary'
            />
          </Link>
        </div>
      </section>
    </Container>
  );
};
