import { cva, VariantProps } from 'class-variance-authority'
import { cn } from 'lib/utils'

const titleVariants = cva('text-alpha-900', {
  variants: {
    variant: {
      small: 'text-lg font-semibold leading-7',
      medium: 'text-2xl leading-8 md:text-4xl tracking-tight',
      large: 'text-3xl md:text-6xl font-medium'
    }
  },
  defaultVariants: {
    variant: 'medium'
  }
})

type TitleProps = VariantProps<typeof titleVariants> & {
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'
  children: React.ReactNode
}

const Title: React.FC<TitleProps> = ({
  className,
  variant,
  as: Component = 'h2',
  children,
  ...props
}) => {
  const classes = cn(titleVariants({ variant, className }))

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

Title.displayName = 'Title'

export { Title, titleVariants }
