import { SkillsOptions } from '../../molecules/skills-options/skills-options'
import { Paragraph } from '../../atoms/paragraph/paragraph'
import { Button } from '../../atoms/button/button'
import { Title } from '../../atoms/title/title'

export const Skills = () => {
  return (
    <section
      id='spice-skills'
      className='my-20 rounded-lg border border-alpha-150 bg-neutral p-8 md:p-16 xl:p-20'
    >
      <Title variant='medium' className='mb-6'>
        Spice Skills
      </Title>
      <Paragraph variant='large' className='max-w-3xl'>
        A coding agent can write and run the spicepod for you in minutes.
      </Paragraph>

      <SkillsOptions />

      <Button
        href='https://github.com/spiceai/skills'
        target='_blank'
        rel='noopener noreferrer'
        variant='primary'
        className='ml-6 mt-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:mt-14'
      >
        Skills on GitHub
      </Button>
    </section>
  )
}
