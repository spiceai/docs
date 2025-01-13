import React from 'react'

const logoSources: Record<LogoVariant, string> = {
  white: '/img/spice-logo-white.png',
  dark: '/img/spice-logo-dark.png',
  logotype: '/img/spice-logotype.png'
}

type LogoVariant = 'white' | 'dark' | 'logotype'

type LogoProps = {
  variant?: LogoVariant
  className?: string
  width?: number
  height?: number
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'white',
  className,
  width = 156,
  height = 32
}) => {
  return (
    <img
      src={logoSources[variant]}
      alt='Spice.ai Logo'
      width={width}
      height={height}
      className={className}
    />
  )
}
