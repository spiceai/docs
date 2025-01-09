import { cn } from 'lib/utils'

/**
 *
 * Containers are used to wrap content and provide consistent spacing and alignment.
 */
export const Container = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn('px-4 sm:px-16 xl:px-20', className)}>
      <div className='container mx-auto max-w-screen-xl'>{children}</div>
    </div>
  )
}
