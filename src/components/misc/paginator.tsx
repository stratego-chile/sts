'use client'

import { VisibilityMode } from '@/lib/enumerators'
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon'
import classNames from 'classnames'
import { Fragment, useMemo, useState } from 'react'

type PaginationPositionX = 'left' | 'center' | 'right'

type PaginationPositionY = 'top' | 'bottom'

type PaginationPosition = `${PaginationPositionY}-${PaginationPositionX}`

type PaginatorProps = {
  visibilityMode?: VisibilityMode
  items?: Array<React.ReactNode>
  itemsPerPage?: number
  defaultPage?: 'first' | 'last' | number
  rootWrapperClassName?: string
  wrapperClassName?: string
  headerContent?: React.ReactNode
  paginationControlPosition?: PaginationPosition
  paginationClassName?: string
  placeholder?: React.ReactNode
}

const Paginator = ({
  visibilityMode = VisibilityMode.Columns,
  items = [],
  itemsPerPage = 5,
  defaultPage = 'first',
  rootWrapperClassName,
  wrapperClassName,
  headerContent = <Fragment />,
  paginationControlPosition = 'top-right',
  paginationClassName,
  placeholder,
}: PaginatorProps) => {
  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage],
  )

  const [currentPage, setCurrentPage] = useState(
    typeof defaultPage === 'number'
      ? defaultPage
      : defaultPage === 'first'
        ? 1
        : totalPages,
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
            paginationClassName,
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
    [currentPage, paginationClassName, paginationControlPosition, totalPages],
  )

  return visibilityMode === VisibilityMode.Table ? (
    <Fragment>
      {paginationControlPosition.startsWith('top') && paginationControls}

      <div className={classNames('table table-flex', rootWrapperClassName)}>
        <div className="table-header-group">
          <div className="table-row [&>.table-cell]:p-2">{headerContent}</div>
        </div>

        <div className={classNames('table-row-group', wrapperClassName)}>
          {items.length === 0 && placeholder}

          {items.map((item, key) => {
            const page = Math.ceil((key + 1) / itemsPerPage)

            return (
              <div
                key={key}
                className={classNames(
                  'table-row [&>.table-cell]:p-2 transition-all duration-500',
                  page === currentPage ? 'block' : 'hidden',
                )}
              >
                {item}
              </div>
            )
          })}
        </div>
      </div>

      {paginationControlPosition.startsWith('bottom') && paginationControls}
    </Fragment>
  ) : (
    <div
      className={classNames(
        'flex flex-grow gap-2 w-full',
        visibilityMode === VisibilityMode.Columns && 'flex-col',
        visibilityMode === VisibilityMode.Rows && 'flex-row',
        rootWrapperClassName,
      )}
    >
      {paginationControlPosition.startsWith('top') && paginationControls}

      {headerContent}

      <div className={wrapperClassName}>
        {items.length === 0 && placeholder}

        {items.map((item, key) => {
          const page = Math.ceil((key + 1) / itemsPerPage)

          return (
            <div
              key={key}
              className={classNames(
                'transition-all duration-500',
                page === currentPage ? 'block' : 'hidden',
              )}
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
