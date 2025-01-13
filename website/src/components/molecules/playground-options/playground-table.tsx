import { Dispatch, SetStateAction } from 'react'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import { ResponseData } from './playground-options'
import { Dialog, DialogContent } from 'components/ui/dialog'

import { DialogTitle } from '@radix-ui/react-dialog'

export const PlaygroundTable = ({
  data,
  isOpenTable,
  setIsOpenTable
}: {
  data: ResponseData
  isOpenTable: boolean
  setIsOpenTable: Dispatch<SetStateAction<boolean>>
}) => {
  return (
    <>
      <div className='relative h-40 max-w-xl overflow-hidden'>
        <TableData data={data} />
        {data.schema.length > 3 && <Shadows />}
      </div>
      <Dialog open={isOpenTable} onOpenChange={setIsOpenTable} modal={false}>
        <DialogContent
          className='w-full max-w-5xl'
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root>
            <DialogTitle>Results</DialogTitle>
          </VisuallyHidden.Root>
          <TableData data={data} />
        </DialogContent>
      </Dialog>
    </>
  )
}

const TableData = ({ data }: { data: ResponseData }) => {
  return (
    <div className='w-full overflow-x-auto'>
      <table className='w-full overflow-hidden rounded-md text-left text-sm'>
        <thead className='bg-neutral-50 text-xs uppercase text-neutral-600'>
          <tr>
            {data.schema.map((column, index) => (
              <th key={index} className='px-6 py-3 font-extrabold'>
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className='border-b bg-neutral even:bg-neutral-50/70 hover:bg-neutral-100'
            >
              {data.schema.map((column, columnIndex) => (
                <td key={columnIndex} className='px-6 py-2'>
                  <span className='block max-w-[150px] truncate sm:max-w-[200px]'>
                    {row[column.name]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Shadows = () => {
  return (
    <>
      <div className='absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-neutral' />
      <div className='absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-neutral/60' />

      <div className='absolute top-0 h-full w-20 bg-gradient-to-r from-neutral' />
      <div className='absolute top-0 h-full w-20 bg-gradient-to-r from-neutral' />

      <div className='absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-neutral' />
      <div className='absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-neutral' />
    </>
  )
}
