import { Button } from 'components/atoms/button/button'
import { Paragraph } from 'components/atoms/paragraph/paragraph'
import { Title } from 'components/atoms/title/title'
import { UseCaseData } from 'components/organisms/use-cases/data'

export const UseCase = ({ useCaseData }: { useCaseData: UseCaseData }) => {
  return (
    <div className='group flex h-[368px] flex-col items-start justify-between gap-6 rounded-sm border border-alpha-150 bg-neutral px-10 py-14 transition-colors hover:bg-neutral hover:shadow-box lg:h-auto lg:bg-transparent'>
      <div>
        <Title as='h4' variant={'small'} className='line-clamp-2'>
          {useCaseData.title}
        </Title>
        <Paragraph className='mt-6 line-clamp-5'>{useCaseData.description}</Paragraph>
      </div>
      <Button
        variant={'secondary'}
        href={useCaseData.buttonLink}
        className='w-full bg-alpha-900 text-neutral lg:w-auto lg:bg-transparent lg:text-alpha-900 lg:group-hover:bg-primary lg:group-hover:text-primary-foreground'
      >
        <span className='line-clamp-1'>{useCaseData.buttonText}</span>
      </Button>
    </div>
  )
}
