import { useState } from 'react'
import { fetchMe } from '../lib/api'
import { ClipboardList, Mail, Phone, Video, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  logoSrc?: string
}

const menuItems = [
  {
    icon: ClipboardList,
    title: 'SOCIONET \uac80\uc0ac \ubc0f \uad50\uc721 \uc2e0\uccad',
    color: 'bg-teal-600 hover:bg-teal-700',
    action: (navigate: ReturnType<typeof useNavigate>) =>
      navigate('/test/application'),
  },
  {
    icon: Mail,
    title: '\uc5f0\uad6c\uc18c \uba54\uc77c',
    color: 'bg-orange-500 hover:bg-orange-600',
    action: () => {},
  },
  {
    icon: Phone,
    title: '\uc5f0\uad6c\uc18c \uc804\ud654',
    color: 'bg-teal-500 hover:bg-teal-600',
    action: () => {},
  },
  {
    icon: Video,
    title: '\uc628\ub77c\uc778 \uad50\uc721',
    color: 'bg-orange-600 hover:bg-orange-700',
    action: (navigate: ReturnType<typeof useNavigate>) =>
      navigate('/online-education'),
  },
]

function LogoMark({ logoSrc }: { logoSrc?: string }) {
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="\ud55c\uad6d SOCIONET \uc5f0\uad6c\uc18c \ub85c\uace0"
        className="h-full w-full object-contain"
      />
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-teal-600 text-white">
      <span className="text-sm font-bold">SOCIONET</span>
    </div>
  )
}

export default function Sidebar({ logoSrc }: SidebarProps) {
  const navigate = useNavigate()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactType, setContactType] = useState<'mail' | 'phone' | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <aside className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b-2 border-teal-600 bg-gradient-to-br from-teal-50 to-white p-3">
        <button
          onClick={() => navigate('/')}
          className="w-full transition-opacity hover:opacity-80 hover:cursor-pointer"
          type="button"
        >
          <div className="flex h-24 w-full items-center justify-center rounded-lg bg-white p-2">
            <LogoMark logoSrc={logoSrc} />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-teal-700">
            {'\uc8fc\uc694 \uba54\ub274 \ubc14\ub85c\uac00\uae30'}
          </p>
        </button>
      </div>

      <div className="space-y-2 bg-gray-50 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isContactAction = item.icon === Mail || item.icon === Phone
          const requiresLogin = item.icon === Video

          return (
            <button
              key={item.title}
              onClick={async () => {
                if (isContactAction) {
                  setContactType(item.icon === Mail ? 'mail' : 'phone')
                  setIsContactModalOpen(true)
                  return
                }
                if (requiresLogin) {
                  try {
                    await fetchMe()
                  } catch {
                    setIsLoginModalOpen(true)
                    return
                  }
                }
                item.action(navigate)
              }}
              className={`flex min-h-[90px] w-full flex-col items-center justify-center gap-2 rounded-lg p-3 text-white shadow-md transition-all hover:scale-105 hover:shadow-xl hover:cursor-pointer ${item.color}`}
              type="button"
            >
              <Icon size={24} />
              <span className="whitespace-pre-line text-center text-xs font-medium leading-tight">
                {item.title}
              </span>
            </button>
          )
        })}
      </div>

      {isContactModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsContactModalOpen(false)
              }
            }}
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-teal-600">
                    Contact
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {contactType === 'mail'
                      ? '\uc5f0\uad6c\uc18c \uba54\uc77c'
                      : '\uc5f0\uad6c\uc18c \uc804\ud654'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="\ub2eb\uae30"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 space-y-4 text-sm text-gray-700">
                {contactType === 'phone' && (
                  <div>
                    <p className="font-semibold text-gray-900">M.</p>
                    <p className="mt-1">010-6563-7308</p>
                  </div>
                )}
                {contactType === 'mail' && (
                  <div>
                    <p className="font-semibold text-gray-900">E.</p>
                    <p className="mt-1 break-all">
                      ksocionet@gmail.com / ksocionet@naver.com
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {isLoginModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsLoginModalOpen(false)
              }
            }}
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-teal-600">
                    {'\uc54c\ub9bc'}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {'\ub85c\uadf8\uc778 \ud544\uc694'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="\ub2eb\uae30"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 text-sm text-gray-700">
                {'\uc628\ub77c\uc778 \uad50\uc721\uc740 \ub85c\uadf8\uc778 \ud6c4 \uc774\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </aside>
  )
}
