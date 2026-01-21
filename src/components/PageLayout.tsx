import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'

interface PageLayoutProps {
  title: string
  menuItems: { label: string; value: string; indent?: boolean }[]
  currentSubPage: string
  onSubPageChange: (subPage: string) => void
  children: ReactNode
  bannerImage?: string
  subPageRoutes?: Record<string, string>
}

export default function PageLayout({
  title,
  menuItems,
  currentSubPage,
  onSubPageChange,
  children,
  bannerImage,
  subPageRoutes,
}: PageLayoutProps) {
  const navigate = useNavigate()
  return (
    <div className="bg-gray-50">
      {bannerImage && (
        <div className="relative mb-6 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 sm:h-44 lg:h-48">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="network-pattern-banner"
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="10" cy="10" r="2" fill="white" />
                  <circle cx="50" cy="30" r="2" fill="white" />
                  <circle cx="80" cy="20" r="2" fill="white" />
                  <line
                    x1="10"
                    y1="10"
                    x2="50"
                    y2="30"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="50"
                    y1="30"
                    x2="80"
                    y2="20"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#network-pattern-banner)" />
            </svg>
          </div>
          <div className="relative z-10 text-center text-white">
            <p className="mb-2 text-xs sm:text-sm">한국 SOCIONET 연구소</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-full flex-shrink-0 lg:block lg:w-60">
          <div className="lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b-2 border-teal-600 bg-gradient-to-br from-teal-50 to-white p-4 sm:p-6">
                <h2 className="text-lg font-bold text-teal-700 sm:text-xl">
                  {title}
                </h2>
              </div>
              <nav className="p-3 sm:p-4">
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block lg:space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.value}>
                      <button
                        onClick={() => {
                          const route = subPageRoutes?.[item.value]
                          if (route) {
                            navigate(route)
                          }
                          onSubPageChange(item.value)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all hover:cursor-pointer sm:px-4 sm:py-3 sm:text-base ${
                          currentSubPage === item.value
                            ? 'bg-teal-600 text-white font-bold shadow-md'
                            : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                        } ${item.indent ? 'pl-6 text-[0.95rem] sm:pl-8' : ''}`}
                        type="button"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSubPage || 'default'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="min-h-[400px] rounded-lg bg-white p-5 shadow-sm sm:min-h-[500px] sm:p-6 lg:min-h-[600px] lg:p-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
