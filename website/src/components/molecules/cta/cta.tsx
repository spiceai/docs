import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { Paragraph } from '../../atoms/paragraph/paragraph';
import { Container } from '../../atoms/container/container';

import { Button } from '../../atoms/button/button';
import { Title } from '../../atoms/title/title';
import { Icon } from '../../atoms/icon/icon';
import { Logo } from '../../atoms/logo/logo';

import { classNames } from '../../../lib/utils';

import { Link, LinkProps } from '../../atoms/link/link';

export const Cta = ({ className }: { className?: string }) => {
  return (
    <Container className='px-0'>
      <section
        className={classNames(
          'my-20 flex flex-col overflow-hidden rounded-none sm:rounded-2xl lg:flex-row',
          className
        )}
      >
        <div className='bg-alpha-900 px-8 py-16 md:p-14 lg:w-7/12 xl:p-20'>
          <Logo variant='white' />
          <Title as='h2' variant='medium' className='my-14 text-neutral'>
            Secure, highly-available access to data.{' '}
            <span className='text-primary'>Ridiculously easy setup.</span> Super
            fast data-grounded AI.
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
        </div>
        <div className='flex flex-col justify-between gap-6 bg-alpha-800 px-8 py-16 md:p-14 lg:w-5/12 xl:p-20'>
          <Paragraph variant='extralarge'>
            “Spice opened the door to take these critical control-plane datasets
            and move them next to our services in the runtime path.”
          </Paragraph>

          <div className='flex items-start justify-between gap-6'>
            <div className='flex flex-col gap-2'>
              <Title as='h5' variant='small' className='font-bold text-neutral'>
                Peter Janovsky
              </Title>
              <Paragraph className='text-neutral'>
                Software Architect at Twilio
              </Paragraph>
              <img
                src='img/twilio.svg'
                alt='Twilio'
                width={118}
                height={40}
                className='relative right-1.5 mt-2 h-auto w-32 brightness-0 invert'
              />
            </div>
            <img
              src='img/peter-janovsky.png'
              alt='Peter Janovsky'
              width={70}
              height={70}
              className='h-16 w-16 rounded-full object-cover'
            />
          </div>
        </div>
      </section>
    </Container>
  );
};
