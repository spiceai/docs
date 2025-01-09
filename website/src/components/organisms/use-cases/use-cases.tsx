import { Paragraph } from 'components/atoms/paragraph/paragraph'
import { Title } from 'components/atoms/title/title'
import { UseCase } from 'components/molecules/use-case/use-case'
import { dataUseCases } from './data'
import { UseCasesMobile } from './use-cases-mobile'

export const UseCases = () => {
  return (
    <section
      id='use-cases'
      className='mt-20 rounded-2xl border border-alpha-150 bg-alpha-50 p-8 pb-24 shadow-box md:p-16 xl:p-20'
    >
      <Title as='h2' variant={'medium'} className='mb-6'>
        Use-Cases
      </Title>

      <Paragraph className='mb-6 md:max-w-3xl'>
        Spice powers data apps and AI agents with federated SQL, vector search, LLM memory,
        real-time data acceleration, observability, and integration across modern and legacy
        systems.
      </Paragraph>

      <div className='hidden grid-cols-2 gap-6 lg:grid'>
        {dataUseCases.map((useCase, index) => (
          <UseCase key={index} useCaseData={useCase} />
        ))}
      </div>

      <UseCasesMobile />
    </section>
  )
}
