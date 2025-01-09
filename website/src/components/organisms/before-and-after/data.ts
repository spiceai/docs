import { StaticImageData } from 'next/image'
import ImageAfter from 'public/after-demo.webp'
import ImageBefore from 'public/before-demo.webp'

export type SlideData = {
  imageBefore: StaticImageData
  imageAfter: StaticImageData
  benefits: {
    textBefore: string
    textAfter: string
  }[]
}

export const beforeAndAfterSlides: SlideData[] = [
  {
    imageBefore: ImageBefore,
    imageAfter: ImageAfter,
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
