import { Paragraph } from '../../atoms/paragraph/paragraph';
import { Title } from '../../atoms/title/title';
import { Link } from '../../atoms/link/link';
import { Icon } from '../../atoms/icon/icon';
import { classNames } from '@site/src/lib/utils';

export const Recipe = ({
  title,
  description,
  href,
  className,
}: {
  title: string;
  description: string;
  href: string;
  className?: string;
}) => {
  return (
    <div className={classNames('flex flex-col items-start gap-3 h-full rounded-sm border border-alpha-150 px-6 py-10 shadow-box md:gap-10 md:px-10', className)}>  
      <Title as='h3' variant='small' className='line-clamp-2'>
        {title}
      </Title>
      <Paragraph className='flex-1'>{description}</Paragraph>
      <Link
        className='hover:text-primary-500 underline inline-flex gap-2 mt-auto'
        href={href}
        target='_blank'
        rel='noopener noreferrer'
      >
        <Icon iconName='github' /> Recipe
      </Link>
    </div>
  );
};

const Squares = ({ width = 24, height = 24 }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={width}
    height={height}
    viewBox='0 0 24 24'
    fill='none'
  >
    <path
      d='M6.42857 9.75L2.25 12L6.42857 14.25M6.42857 9.75L12 12.75L17.5714 9.75M6.42857 9.75L2.25 7.5L12 2.25L21.75 7.5L17.5714 9.75M17.5714 9.75L21.75 12L17.5714 14.25M17.5714 14.25L21.75 16.5L12 21.75L2.25 16.5L6.42857 14.25M17.5714 14.25L12 17.25L6.42857 14.25'
      stroke='#F37721'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
