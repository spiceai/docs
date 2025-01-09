import * as React from 'react'
import Link, { LinkProps } from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from 'lib/utils'

type ButtonAnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof React.ButtonHTMLAttributes<HTMLButtonElement>
>

const buttonVariants = cva('rounded-xl font-semibold transition-all outline-none', {
  variants: {
    variant: {
      brand: 'bg-primary hover:bg-primary-600',
      brandOutline:
        'bg-primary  hover:bg-neutral hover:text-neutral-foreground active:bg-neutral-400 active:shadow-none hover:shadow-button-hover',
      primary: 'bg-alpha-900 hover:bg-primary',
      secondary:
        'bg-transparent hover:bg-alpha-150 hover:text-neutral-foreground active:bg-alpha-300 border border-alpha-150',
      negative: 'bg-neutral hover:bg-primary',
      tag: 'px-4 py-3 md:hover:bg-alpha-50 md:active:bg-alpha-100',
      tagSmall:
        'bg-alpha-100 rounded-sm md:hover:bg-alpha-150 active:bg-alpha-200 text-xs leading-6 text-alpha-700'
    },
    size: {
      sm: 'px-3 py-2 text-base',
      md: 'px-4 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  },
  compoundVariants: [
    {
      variant: ['brand', 'primary', 'negative'],
      className:
        'active:bg-red-700 hover:text-primary-foreground hover:shadow-button-hover active:shadow-none'
    },
    {
      variant: ['brand', 'brandOutline', 'primary'],
      className: 'text-primary-foreground'
    },
    {
      variant: ['secondary', 'negative'],
      className: 'text-neutral-foreground'
    },
    {
      variant: ['tagSmall'],
      className: 'text-sm px-2 py-0.5'
    }
  ]
})

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonAnchorProps>,
    ButtonAnchorProps,
    VariantProps<typeof buttonVariants> {
  href?: string
  ref?: React.Ref<HTMLButtonElement & HTMLAnchorElement>
}

const Button = ({ className, variant, size, href, ref, ...props }: ButtonProps) => {
  const classes = cn('inline-block', buttonVariants({ variant, size, className }))

  if (href) {
    return (
      <Link className={classes} {...(props as LinkProps)} href={href}>
        {props.children}
      </Link>
    )
  }

  return <button className={classes} {...props} {...(ref ? { ref } : {})} />
}

Button.displayName = 'Button'

export { Button, buttonVariants }
