export type SlideData = {
  imageBefore: string
  imageAfter: string
  benefits: {
    textBefore: string
    textAfter: string
  }[]
}

export const beforeAndAfterSlides: SlideData[] = [
  {
    imageBefore: '/img/after-demo.webp',
    imageAfter: '/img/before-demo.webp',
    benefits: [
      {
        textBefore: 'Slow 15 sec queries across 100B+ rows.',
        textAfter: 'Simple drop-in solution to materialize recent data.'
      },
      {
        textBefore: 'Poor user experience with slow page loads.',
        textAfter: 'Significantly better user experience.'
      },
      {
        textBefore: 'Unnecessary Databricks workspace expense.',
        textAfter: 'Faster, more resilient queries at lower cost.'
      }
    ]
  }
]
