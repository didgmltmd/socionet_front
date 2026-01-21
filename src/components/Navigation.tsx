import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  clearMeCache,
  fetchMe,
  loginUser,
  logoutUser,
  registerUser,
  setAuthToken,
} from '../lib/api'

interface MenuItem {
  title: string
  items?: string[]
  subItems?: { [key: string]: string[] }
}

const menuData: MenuItem[] = [
  {
    title: '\uc5f0\uad6c\uc18c \uc18c\uac1c',
    items: ['\uc778\uc0ac\ub9d0', '\uc5f0\ud601', '\uc8fc\uc694\ud65c\ub3d9', '\uc624\uc2dc\ub294 \uae38'],
  },
  {
    title: 'SOCIONET \uc774\ud574',
    items: [
      'SOCIONET\uc5d0 \ub300\ud558\uc5ec',
      'SOCIOMETRY',
      'SOCIAL NETWORK ANALYSIS',
      '\ud55c\uad6d\uacfc SOCIONET',
      'SOCIONET \ud65c\uc6a9',
    ],
  },
  {
    title: 'SOCIONET \uac80\uc0ac',
    items: ['\uac80\uc0ac\uc2e0\uccad', '\uac80\uc0ac\ub300\uc0c1', '\uc720\uc758\uc0ac\ud56d', '\uc218\ub828\uad50\uc721\uacfc\uc815'],
    subItems: {
      '\uc218\ub828\uad50\uc721\uacfc\uc815': ['\ucd08\uae09 SOCIONET', '\uc911\uae09 SOCIONET', '\uace0\uae09 SOCIONET', '\uc77c\ubc18\uac15\uc0ac\uacfc\uc815'],
    },
  },
  {
    title: '\ucee4\ubba4\ub2c8\ud2f0',
    items: [
      '\uacf5\uc9c0\uc0ac\ud56d',
      '\ucee4\ubba4\ub2c8\ud2f0 \ud65c\ub3d9',
      '\uc5f4\ub9b0\ub9c8\ub2f9',
      'Q & A',
      'FAQ',
      'SOCIONET \uc5f0\uad6c\ubaa8\uc784',
      '\uc77c\ubc18\uc0c1\ub2f4 \uc5f0\uad6c\ubaa8\uc784',
    ],
  },
  {
    title: '\uc77c\ubc18 \uac80\uc0ac \ubc0f \uc0c1\ub2f4',
    items: [
      '\uc544\ub3d9 \uc2ec\ub9ac\uac80\uc0ac',
      '\uccad\uc18c\ub144 \uc2ec\ub9ac\uac80\uc0ac',
      '\uc131\uc778\uc2ec\ub9ac\uac80\uc0ac',
      '\uc885\ud569 \uc2ec\ub9ac\uac80\uc0ac',
      '\uc544\ub3d9\uccad\uc18c\ub144 \uc0c1\ub2f4',
      '\ubd80\ubd80 \ubc0f \uac00\uc871\uc0c1\ub2f4',
      '\ud559\uc2b5 \uc9c4\ub85c\uc0c1\ub2f4',
      '\uae30\uc5c5\uc0c1\ub2f4',
      '\uc740\ud1f4\uc790 \uc0c1\ub2f4',
      '\uac10\uc218\uc131 \ud6c8\ub828',
    ],
  },
  {
    title: '\uc790\ub8cc\uc2e4',
    items: ['\ub17c\ubb38', '\ucd9c\ud310\ubb3c', '\ucd94\ucc9c\ub3c4\uc11c'],
  },
]

interface NavigationProps {
  isMobileMenuOpen: boolean
  onClose: () => void
}

const routeMap: Record<string, string> = {
  '\uc5f0\uad6c\uc18c \uc18c\uac1c': '/intro',
  'SOCIONET \uc774\ud574': '/understanding',
  'SOCIONET \uac80\uc0ac': '/test',
  '\ucee4\ubba4\ub2c8\ud2f0': '/community',
  '\uc77c\ubc18 \uac80\uc0ac \ubc0f \uc0c1\ub2f4': '/counseling',
  '\uc790\ub8cc\uc2e4': '/resources',
  '\uc778\uc0ac\ub9d0': '/intro/greeting',
  '\uc5f0\ud601': '/intro/history',
  '\uc8fc\uc694\ud65c\ub3d9': '/intro/activities',
  '\uc624\uc2dc\ub294 \uae38': '/intro/location',
  'SOCIONET\uc5d0 \ub300\ud558\uc5ec': '/understanding/about',
  'SOCIOMETRY': '/understanding/sociometry',
  'SOCIAL NETWORK ANALYSIS': '/understanding/sna',
  '\ud55c\uad6d\uacfc SOCIONET': '/understanding/korea',
  'SOCIONET \ud65c\uc6a9': '/understanding/application',
  '\uac80\uc0ac\uc2e0\uccad': '/test/application',
  '\uac80\uc0ac\ub300\uc0c1': '/test/target',
  '\uc720\uc758\uc0ac\ud56d': '/test/notice',
  '\uc218\ub828\uad50\uc721\uacfc\uc815': '/test/education',
  '\ucd08\uae09 SOCIONET': '/test/education/beginner',
  '\uc911\uae09 SOCIONET': '/test/education/intermediate',
  '\uace0\uae09 SOCIONET': '/test/education/advanced',
  '\uc77c\ubc18\uac15\uc0ac\uacfc\uc815': '/test/education/instructor',
  '\uacf5\uc9c0\uc0ac\ud56d': '/community/notice',
  '\ucee4\ubba4\ub2c8\ud2f0 \ud65c\ub3d9': '/community/activity',
  '\uc5f4\ub9b0\ub9c8\ub2f9': '/community/open',
  'Q & A': '/community/faq',
  'FAQ': '/community/faq',
  'SOCIONET \uc5f0\uad6c\ubaa8\uc784': '/community/socionet-study',
  '\uc77c\ubc18\uc0c1\ub2f4 \uc5f0\uad6c\ubaa8\uc784': '/community/counseling-study',
  '\uc544\ub3d9 \uc2ec\ub9ac\uac80\uc0ac': '/counseling/test/child',
  '\uccad\uc18c\ub144 \uc2ec\ub9ac\uac80\uc0ac': '/counseling/test/youth',
  '\uc131\uc778\uc2ec\ub9ac\uac80\uc0ac': '/counseling/test/adult',
  '\uc885\ud569 \uc2ec\ub9ac\uac80\uc0ac': '/counseling/test/general',
  '\uc544\ub3d9\uccad\uc18c\ub144 \uc0c1\ub2f4': '/counseling/youth',
  '\ubd80\ubd80 \ubc0f \uac00\uc871\uc0c1\ub2f4': '/counseling/family',
  '\ud559\uc2b5 \uc9c4\ub85c\uc0c1\ub2f4': '/counseling/career',
  '\uae30\uc5c5\uc0c1\ub2f4': '/counseling/corporate',
  '\uc740\ud1f4\uc790 \uc0c1\ub2f4': '/counseling/retiree',
  '\uac10\uc218\uc131 \ud6c8\ub828': '/counseling/tgroup',
  '\ub17c\ubb38': '/resources/papers',
  '\ucd9c\ud310\ubb3c': '/resources/publications',
  '\ucd94\ucc9c\ub3c4\uc11c': '/resources/books',
}

export default function Navigation({ isMobileMenuOpen, onClose }: NavigationProps) {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<number | null>(
    null,
  )
  const [mobileExpandedSubMenu, setMobileExpandedSubMenu] = useState<
    string | null
  >(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupRole, setSignupRole] = useState('BEGINNER')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchMe()
      .then(() => {
        if (isMounted) {
          setIsLoggedIn(true)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoggedIn(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleClick = (label: string) => {
    const path = routeMap[label]
    navigate(path || '/')
    onClose()
  }

  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)
    try {
      const { user, token } = await loginUser(loginEmail.trim(), loginPassword)
      clearMeCache()
      if (token) {
        setAuthToken(token)
      }
      setIsLoggedIn(true)
      setIsLoginModalOpen(false)
      setLoginEmail('')
      setLoginPassword('')
      if (user?.role === 'ADMIN') {
        navigate('/admin')
      }
    } catch (error) {
      setLoginError('\ub85c\uadf8\uc778\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \ud655\uc778\ud574\uc8fc\uc138\uc694.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSignupSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSigningUp(true)
    setSignupError(null)
    setSignupSuccess(null)
    try {
      await registerUser({
        email: signupEmail.trim(),
        password: signupPassword,
        name: signupName.trim(),
        phone: signupPhone.trim() || undefined,
        role: signupRole,
      })
      setSignupSuccess('\ud68c\uc6d0\uac00\uc785 \uc2e0\uccad\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.')
      setSignupName('')
      setSignupEmail('')
      setSignupPhone('')
      setSignupPassword('')
      setSignupRole('BEGINNER')
    } catch (error) {
      setSignupError('\ud68c\uc6d0\uac00\uc785\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \uc785\ub825\ud55c \uc815\ubcf4\ub97c \ud655\uc778\ud574\uc8fc\uc138\uc694.')
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleLogout = async () => {
    try {
      clearMeCache()
      setAuthToken(null)
      await logoutUser()
    } catch {
      // ignore logout errors
    }
    setIsLoggedIn(false)
    onClose()
  }

  const openLoginModal = () => {
    setLoginError(null)
    setLoginEmail('')
    setLoginPassword('')
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const openSignupModal = () => {
    setSignupError(null)
    setSignupSuccess(null)
    setSignupName('')
    setSignupEmail('')
    setSignupPhone('')
    setSignupPassword('')
    setSignupRole('BEGINNER')
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  return (
    <>
      <nav className="hidden bg-teal-600 shadow-lg lg:block">
        <div className="px-6">
          <div className="flex items-center justify-center">
            {menuData.map((menu, index) => (
              <div
                key={menu.title}
                className="relative"
                onMouseEnter={() => setActiveMenu(index)}
                onMouseLeave={() => {
                  setActiveMenu(null)
                  setActiveSubMenu(null)
                }}
              >
                <button
                  onClick={() => handleClick(menu.title)}
                  className="flex items-center gap-1 px-4 py-4 text-sm font-medium text-white transition-colors hover:bg-teal-700 hover:cursor-pointer xl:px-6 xl:text-base"
                  type="button"
                >
                  {menu.title}
                  {menu.items && <ChevronDown size={16} />}
                </button>

                {activeMenu === index && menu.items && (
                  <div className="absolute left-0 top-full z-50 min-w-[220px] border-t-2 border-orange-500 bg-white shadow-xl">
                    {menu.items.map((item) => (
                      <div
                        key={item}
                        className="relative"
                        onMouseEnter={() =>
                          menu.subItems?.[item] && setActiveSubMenu(item)
                        }
                        onMouseLeave={() => setActiveSubMenu(null)}
                      >
                        <button
                          onClick={() => handleClick(item)}
                          className="block w-full border-b border-gray-100 px-6 py-3 text-left text-gray-700 transition-colors hover:bg-teal-50 hover:text-teal-700 hover:cursor-pointer"
                          type="button"
                        >
                          {item}
                          {menu.subItems?.[item] && (
                            <ChevronDown
                              size={14}
                              className="ml-1 inline -rotate-90"
                            />
                          )}
                        </button>

                        {activeSubMenu === item && menu.subItems?.[item] && (
                          <div className="absolute left-full top-0 min-w-[200px] border-l-2 border-orange-500 bg-white shadow-xl">
                            {menu.subItems[item].map((subItem) => (
                              <button
                                key={subItem}
                                onClick={() => handleClick(subItem)}
                                className="block w-full border-b border-gray-100 px-6 py-3 text-left text-gray-700 transition-colors hover:bg-teal-50 hover:text-teal-700 hover:cursor-pointer"
                                type="button"
                              >
                                {subItem}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose()
            }
          }}
        >
          <div className="h-full w-80 max-w-[85%] overflow-y-auto bg-white shadow-xl">
            <div className="bg-teal-600 p-4">
              <h2 className="text-lg font-bold text-white">{'\uba54\ub274'}</h2>
            </div>

            <div className="py-2">
              {menuData.map((menu, index) => (
                <div key={menu.title} className="border-b border-gray-100">
                  <button
                    onClick={() => {
                      if (!menu.items) {
                        handleClick(menu.title)
                        return
                      }
                      setMobileExpandedMenu(
                        mobileExpandedMenu === index ? null : index,
                      )
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-gray-800 transition-colors hover:bg-sky-50 hover:cursor-pointer"
                    type="button"
                  >
                    <span className="font-medium">{menu.title}</span>
                    {menu.items && (
                      <ChevronDown
                        size={18}
                        className={`transform transition-transform ${
                          mobileExpandedMenu === index ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {menu.items && (
                    <div
                      className={`overflow-hidden bg-teal-50 transition-[max-height,opacity] duration-300 ${
                        mobileExpandedMenu === index
                          ? 'max-h-[800px] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="py-1">
                        {menu.items.map((item) => (
                          <div key={item}>
                            <button
                              onClick={() => {
                                if (menu.subItems?.[item]) {
                                  setMobileExpandedSubMenu(
                                    mobileExpandedSubMenu === item ? null : item,
                                  )
                                  return
                                }
                                handleClick(item)
                              }}
                              className="flex w-full items-center justify-between px-8 py-2 text-left text-gray-700 transition-colors hover:bg-teal-100 hover:text-teal-700 hover:cursor-pointer"
                              type="button"
                            >
                              <span>{item}</span>
                              {menu.subItems?.[item] && (
                                <ChevronRight
                                  size={16}
                                  className={`transform transition-transform ${
                                    mobileExpandedSubMenu === item
                                      ? 'rotate-90'
                                      : ''
                                  }`}
                                />
                              )}
                            </button>

                            {menu.subItems?.[item] && (
                              <div
                                className={`overflow-hidden bg-teal-100 transition-[max-height,opacity] duration-300 ${
                                  mobileExpandedSubMenu === item
                                    ? 'max-h-64 opacity-100'
                                    : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="py-1">
                                  {menu.subItems[item].map((subItem) => (
                                    <button
                                      key={subItem}
                                      onClick={() => handleClick(subItem)}
                                      className="block w-full px-12 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-teal-200 hover:text-teal-800 hover:cursor-pointer"
                                      type="button"
                                    >
                                      {subItem}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-200 p-4">
              {isLoggedIn ? (
                <>
                  <button
                    className="w-full rounded-lg border-2 border-teal-600 py-3 font-medium text-teal-600 transition-colors hover:bg-teal-50 hover:cursor-pointer"
                    type="button"
                    onClick={() => {
                      navigate('/online-education')
                      onClose()
                    }}
                  >
                    {'\uc628\ub77c\uc778\uad50\uc721 \ub4e3\uae30'}
                  </button>
                  <button
                    className="w-full rounded-lg bg-gray-800 py-3 font-medium text-white shadow-md transition-colors hover:bg-gray-900 hover:cursor-pointer"
                    type="button"
                    onClick={handleLogout}
                  >
                    {'\ub85c\uadf8\uc544\uc6c3'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full rounded-lg border-2 border-teal-600 py-3 font-medium text-teal-600 transition-colors hover:bg-teal-50 hover:cursor-pointer"
                    type="button"
                    onClick={openLoginModal}
                  >
                    {'\ub85c\uadf8\uc778'}
                  </button>
                  <button
                    className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white shadow-md transition-colors hover:bg-teal-700 hover:cursor-pointer"
                    type="button"
                    onClick={openSignupModal}
                  >
                    {'\ud68c\uc6d0\uac00\uc785'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      
      {isSignupModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 lg:hidden">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{'\ud68c\uc6d0\uac00\uc785'}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {'\uc815\ubcf4\ub97c \uc785\ub825\ud558\uc5ec \uc2e0\uccad\ud574 \uc8fc\uc138\uc694.'}
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleSignupSubmit}>
              <label className="block text-sm font-medium text-gray-700">
                {'\uc774\ub984'}
                <input
                  type="text"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={'\uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694'}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {'\uc774\uba54\uc77c'}
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={'\uc774\uba54\uc77c\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694'}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {'\uc804\ud654\ubc88\ud638'}
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(event) => setSignupPhone(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={'\uc804\ud654\ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694'}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {'\ube44\ubc00\ubc88\ud638'}
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={'\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694'}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {'\uad50\uc721 \uad8c\ud55c'}
                <select
                  value={signupRole}
                  onChange={(event) => setSignupRole(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="BEGINNER">{'\ucd08\uae09 \uacfc\uc815'}</option>
                  <option value="INTERMEDIATE">{'\uc911\uae09 \uacfc\uc815'}</option>
                  <option value="ADVANCED">{'\uace0\uae09 \uacfc\uc815'}</option>
                  <option value="INSTRUCTOR">{'\uc77c\ubc18\uac15\uc0ac\uacfc\uc815'}</option>
                </select>
              </label>
              {signupError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {signupError}
                </p>
              )}
              {signupSuccess && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {signupSuccess}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:cursor-pointer"
                  onClick={() => setIsSignupModalOpen(false)}
                >
                  {'\ucde8\uc18c'}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 hover:cursor-pointer"
                  disabled={isSigningUp}
                >
                  {isSigningUp ? '\uc2e0\uccad \uc911...' : '\ud68c\uc6d0\uac00\uc785'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 lg:hidden">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{'\ub85c\uadf8\uc778'}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {'\uacc4\uc815 \uc815\ubcf4\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.'}
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleLoginSubmit}>
              <label className="block text-sm font-medium text-gray-700">
                {'\uc774\uba54\uc77c'}
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={'\uc774\uba54\uc77c\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694'}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {'\ube44\ubc00\ubc88\ud638'}
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={'\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694'}
                  required
                />
              </label>
              {loginError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {loginError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:cursor-pointer"
                  onClick={() => setIsLoginModalOpen(false)}
                >
                  {'\ucde8\uc18c'}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 hover:cursor-pointer"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '\ub85c\uadf8\uc778 \uc911...' : '\ub85c\uadf8\uc778'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
