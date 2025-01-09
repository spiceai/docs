import { Paragraph } from 'components/atoms/paragraph/paragraph'

import React from 'react'

const ShieldWarning = ({ width = 32, height = 32 }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={width}
    height={height}
    viewBox='0 0 32 32'
    fill='none'
  >
    <path
      d='M16 11.9999V16.9999M16 3.6189C13.1327 6.33439 9.26084 7.9999 5 7.9999C4.9323 7.9999 4.8647 7.99948 4.79719 7.99864C4.27986 9.57211 4 11.2534 4 13C4 20.4553 9.09909 26.7197 16 28.4959C22.9009 26.7197 28 20.4553 28 13C28 11.2534 27.7201 9.57211 27.2028 7.99864C27.1353 7.99948 27.0677 7.9999 27 7.9999C22.7392 7.9999 18.8673 6.33439 16 3.6189ZM16 20.9999H16.01V21.0099H16V20.9999Z'
      stroke='#F24F4F'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

const ShieldCheck = ({ width = 32, height = 32 }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={width}
    height={height}
    viewBox='0 0 32 32'
    fill='none'
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M16.6876 2.89307C16.302 2.52783 15.698 2.52783 15.3124 2.89307C12.6234 5.4397 8.99499 7.00014 5 7.00014C4.93644 7.00014 4.87298 6.99975 4.80961 6.99896C4.37312 6.99354 3.98356 7.27187 3.84722 7.68655C3.29716 9.35957 3 11.1462 3 13.0002C3 20.9229 8.41874 27.5774 15.7507 29.4646C15.9143 29.5067 16.0858 29.5067 16.2493 29.4646C23.5813 27.5774 29 20.9229 29 13.0002C29 11.1462 28.7028 9.35957 28.1528 7.68655C28.0164 7.27187 27.6269 6.99354 27.1904 6.99896C27.127 6.99975 27.0636 7.00014 27 7.00014C23.005 7.00014 19.3766 5.4397 16.6876 2.89307ZM20.8137 13.5812C21.1347 13.1318 21.0307 12.5073 20.5812 12.1863C20.1318 11.8653 19.5073 11.9693 19.1863 12.4188L14.8724 18.4582L12.7071 16.2929C12.3166 15.9024 11.6834 15.9024 11.2929 16.2929C10.9024 16.6834 10.9024 17.3166 11.2929 17.7071L14.2929 20.7071C14.5007 20.915 14.7895 21.0208 15.0825 20.9966C15.3754 20.9723 15.6429 20.8204 15.8137 20.5812L20.8137 13.5812Z'
      fill='#9FD356'
    />
  </svg>
)

type BenefitProps = {
  isBefore: boolean
  textBefore: string
  textAfter: string
}

export const Benefit = ({ isBefore, textBefore, textAfter }: BenefitProps) => {
  return (
    <div className='flex items-center gap-6 rounded-sm border border-alpha-150 bg-neutral px-4 py-6 lg:px-6 lg:py-8'>
      <div>{isBefore ? <ShieldWarning /> : <ShieldCheck />}</div>
      <Paragraph className='font-semibold'>{isBefore ? textBefore : textAfter}</Paragraph>
    </div>
  )
}
