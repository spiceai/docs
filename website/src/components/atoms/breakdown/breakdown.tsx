import Image from 'next/image'
import BreakdownPicture from 'public/breakdown.webp'

export const Breakdown = () => {
  return (
    <div>
      <Image
        src={BreakdownPicture}
        alt='Spice.ai breakdown'
        width={1000}
        height={500}
        className='h-auto w-full'
        priority
      />
    </div>
  )
}
