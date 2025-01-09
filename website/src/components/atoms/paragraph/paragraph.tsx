import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

import { cn } from 'lib/utils'

const paragraphVariants = cva('', {
  variants: {
    variant: {
      small: 'text-sm leading-6 font-normal',
      medium: 'text-sm md:text-base leading-6 md:leading-7 font-normal',
      large: 'text-sm md:text-lg leading-6 md:leading-7 font-normal',
      extralarge: 'text-lg md:text-2xl text-neutral-400 leading-7'
    }
  },
  defaultVariants: {
    variant: 'medium'
  },
  compoundVariants: [
    {
      variant: ['small', 'medium', 'large'],
      className: 'text-alpha-700'
    }
  ]
})

type ParagraphProps = VariantProps<typeof paragraphVariants> & {
  className?: string
  children: React.ReactNode
}

const Paragraph: React.FC<ParagraphProps> = ({ className, variant, children, ...props }) => {
  const classes = cn(paragraphVariants({ variant, className }))

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  )
}

Paragraph.displayName = 'Paragraph'

export { Paragraph, paragraphVariants }
