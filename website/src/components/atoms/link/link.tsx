import * as React from 'react';
import { cn } from '../../../lib/utils';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'small' | 'large';
  className?: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({
  href,
  variant = 'small',
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'rounded-xl font-semibold text-base transition-colors hover:text-primary active:text-red-700';
  const variantClasses =
    variant === 'small'
      ? 'font-medium'
      : 'text-alpha-900 text-lg';

  const classes = cn(baseClasses, variantClasses, className);

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
};

Link.displayName = 'Link';

export { Link, LinkProps };
