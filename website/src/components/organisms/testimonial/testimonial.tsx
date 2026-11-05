import { Paragraph } from '../../atoms/paragraph/paragraph'
import { Title } from '../../atoms/title/title'

export const Testimonial = () => {
  return (
    <section className='my-20 rounded-lg border border-alpha-150 bg-neutral p-8 md:p-16 xl:p-20'>
      <Paragraph variant='extralarge' className='max-w-4xl'>
        “Spice opened the door to take these critical control-plane datasets and move them next to
        our services in the runtime path.”
      </Paragraph>

      <div className='mt-10 flex flex-wrap items-center gap-4'>
        <img
          src='/img/peter-janovsky.png'
          alt='Peter Janovsky'
          width={64}
          height={64}
          className='h-14 w-14 rounded-full object-cover'
        />
        <div className='flex flex-col gap-1'>
          <Title as='h5' variant='small' className='font-bold'>
            Peter Janovsky
          </Title>
          <Paragraph>Software Architect at Twilio</Paragraph>
        </div>
        <img
          src='/img/twilio.svg'
          alt='Twilio'
          width={118}
          height={40}
          className='ml-auto h-auto w-28'
        />
      </div>
    </section>
  )
}
