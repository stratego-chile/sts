'use client'

import classNames from 'classnames'
import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type PaginationPositionX = 'left' | 'center' | 'right'

type PaginationPositionY = 'top' | 'bottom'

type PaginationPosition = `${PaginationPositionY}-${PaginationPositionX}`

type PaginatorProps = {
  items?: Array<React.ReactNode>
  itemsPerPage?: number
  defaultPage?: 'first' | 'last' | number
  wrapperClassName?: string
  paginationControlPosition?: PaginationPosition
  paginationClassName?: string
  placeholder?: React.ReactNode
}

const Paginator: React.FC<PaginatorProps> = ({
  items = [],
  itemsPerPage = 5,
  defaultPage = 'first',
  wrapperClassName = '',
  paginationControlPosition = 'top-right',
  paginationClassName = '',
  placeholder,
}) => {
  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage]
  )

  const [currentPage, setCurrentPage] = useState(
    typeof defaultPage === 'number'
      ? defaultPage
      : defaultPage === 'first'
      ? 1
      : totalPages
  )

  const paginationControls = useMemo(
    () =>
      totalPages > 1 && (
        <div
          className={classNames(
            'flex',
            paginationControlPosition.endsWith('left') && 'justify-start',
            paginationControlPosition.endsWith('center') && 'justify-center',
            paginationControlPosition.endsWith('right') && 'justify-end',
            paginationClassName
          )}
        >
          <div className="inline-flex justify-center items-center gap-x-2">
            <button
              onClick={() =>
                currentPage > 1 && setCurrentPage((page) => --page)
              }
              className="border-0 bg-transparent p-0 text-gray-500"
            >
              <ChevronLeftIcon
                className="text-gray-400 h-5 w-auto"
                aria-hidden="true"
              />
            </button>
            <div className="text-slate-500">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage((page) => ++page)
              }
              className="border-0 bg-transparent p-0 text-gray-500"
            >
              <ChevronRightIcon
                className="text-gray-400 h-5 w-auto"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      ),
    [currentPage, paginationClassName, paginationControlPosition, totalPages]
  )

  return (
    <div className="flex flex-col flex-grow gap-2 w-full">
      {paginationControlPosition.startsWith('top') && paginationControls}

      <div className={wrapperClassName}>
        {items.length === 0 && placeholder}

        {items.map((item, key) => {
          const page = Math.ceil((key + 1) / itemsPerPage)

          return (
            <div
              key={key}
              className={`${
                page === currentPage ? 'block' : 'hidden'
              } transition-all duration-500`}
            >
              {item}
            </div>
          )
        })}
      </div>

      {paginationControlPosition.startsWith('bottom') && paginationControls}
    </div>
  )
}

export default Paginator
