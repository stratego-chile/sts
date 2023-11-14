'use client'

import { Dialog } from '@headlessui/react'
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const DefaultHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 lg:gap-x-8">
        <div className="flex">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">{process.env.BRAND_NAME}</span>

            <Image
              className="h-8 w-auto"
              src="/images/brand/logo.svg"
              height={48}
              width={48}
              alt={process.env.BRAND_NAME}
            />
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="/login"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />

        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">{process.env.BRAND_NAME}</span>

              <Image
                className="h-8 w-auto"
                src="/images/brand/logo.svg"
                height={48}
                width={48}
                alt={process.env.BRAND_NAME}
              />
            </a>

            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>

              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="py-6">
                <Link
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}

export default DefaultHeader
