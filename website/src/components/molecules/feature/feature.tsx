import { Paragraph } from 'components/atoms/paragraph/paragraph'
import { Title } from 'components/atoms/title/title'
import Link from 'next/link'

export const Feature = ({
  title,
  description,
  docsLink
}: {
  title: string
  description: string
  docsLink?: string
}) => {
  return (
    <div className='flex flex-col items-start gap-4 rounded-sm border border-alpha-150 px-6 py-10 shadow-box md:gap-10 md:px-10'>
      <Squares />
      <Title as='h3' variant={'small'} className='line-clamp-2'>
        {title}
      </Title>
      <Paragraph>{description}</Paragraph>
      {docsLink && (
        <Link
          className='hover:text-primary-500'
          href={docsLink}
          target='_blank'
          rel='noopener noreferrer'
        >
          Docs
        </Link>
      )}
    </div>
  )
}

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
)
