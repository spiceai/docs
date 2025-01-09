import React from 'react'
import Image from 'next/image'

import LogoDark from 'public/spice-logo-dark.png'
import LogoWhite from 'public/spice-logo-white.png'
import Logotype from 'public/spice-logotype.png'

type LogoVariant = 'white' | 'dark' | 'logotype'

type LogoProps = {
  variant?: LogoVariant
  className?: string
  width?: number
  height?: number
}

const logoSources: Record<LogoVariant, any> = {
  white: LogoWhite,
  dark: LogoDark,
  logotype: Logotype
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'white',
  className,
  width = 156,
  height = 32
}) => {
  return (
    <Image
      src={logoSources[variant]}
      alt='Spice.ai Logo'
      width={width}
      height={height}
      className={className}
    />
  )
}
