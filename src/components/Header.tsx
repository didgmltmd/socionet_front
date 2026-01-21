import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, UserPlus, Mail, Menu, X, Lock, LogOut, Phone } from 'lucide-react'
import { fetchMe, loginUser, logoutUser, registerUser } from '../lib/api'

interface HeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (value: boolean) => void
  logoSrc?: string
}

interface SignupData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone: string
  role: string
}

const emptySignup: SignupData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  role: 'BEGINNER',
}

function LogoMark({ logoSrc }: { logoSrc?: string }) {
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="한국 SOCIONET 연구소 로고"
        className="h-12 w-12 object-contain sm:h-16 sm:w-16"
      />
    )
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white sm:h-16 sm:w-16">
      <span className="text-sm font-bold sm:text-base">SN</span>
    </div>
  )
}

export default function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  logoSrc,
}: HeaderProps) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [signupData, setSignupData] = useState<SignupData>(emptySignup)

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        setIsLoggedIn(true)
        const isAdminUser = user.role === 'ADMIN'
        setIsAdmin(isAdminUser)
        setUserName(isAdminUser ? '\uc548\uc774\ud658' : user.name || '')
      })
      .catch(() => {})
  }, [])


  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const { user } = await loginUser(email, password)
      const isAdminUser = user.role === 'ADMIN'
      setIsLoggedIn(true)
      setIsAdmin(isAdminUser)
      setUserName(isAdminUser ? '\uc548\uc774\ud658' : user.name || '')

      if (user.role === 'ADMIN') {
        alert('관리자로 로그인 되었습니다!')
        navigate('/admin')
        return
      }

      alert('로그인 되었습니다!')
    } catch (error) {
      alert(error instanceof Error ? error.message : '로그인에 실패했습니다.')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUserName('')
    setEmail('')
    setPassword('')
    logoutUser().catch(() => {})
    navigate('/')
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (signupData.password !== signupData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      await registerUser({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        phone: signupData.phone,
        role: signupData.role,
      })
      alert('회원가입 신청이 완료되었습니다!\n관리자 승인 후 로그인이 가능합니다.')
      setIsSignupModalOpen(false)
      setSignupData(emptySignup)
    } catch (error) {
      alert(error instanceof Error ? error.message : '회원가입에 실패했습니다.')
    }
  }

  const updateSignupField =
    (field: keyof SignupData) => (value: string) => {
      setSignupData((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <header className="bg-white">
      <div className="px-3 py-2 sm:px-4">
        <div className="relative flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="absolute left-0 -ml-2 p-2 text-gray-700 transition-colors hover:text-teal-600 lg:hidden"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            type="button"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button
            onClick={() => navigate('/')}
            className="mx-auto flex items-center gap-2 transition-opacity hover:opacity-80 hover:cursor-pointer sm:gap-4 lg:mx-0"
            type="button"
          >
            <LogoMark logoSrc={logoSrc} />
            <h1 className="text-base font-bold text-teal-700 sm:text-xl">
              한국 SOCIONET 연구소
            </h1>
          </button>

          <div className="hidden items-center gap-2 md:flex lg:gap-4">
            {!isLoggedIn ? (
              <>
                <form onSubmit={handleLogin} className="flex items-center gap-2">
                  <div className="relative">
                    <User
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="이메일"
                      required
                      className="w-24 rounded-lg border-2 border-gray-200 py-1 pl-8 pr-2 text-xs transition-colors focus:border-teal-500 focus:outline-none lg:w-28"
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="비밀번호"
                      required
                      className="w-20 rounded-lg border-2 border-gray-200 py-1 pl-8 pr-2 text-xs transition-colors focus:border-teal-500 focus:outline-none lg:w-24"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-md transition-all hover:bg-teal-700 hover:cursor-pointer"
                  >
                    로그인
                  </button>
                </form>

                <div className="h-6 w-px bg-gray-300"></div>

                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="flex items-center gap-2 px-2 py-1 text-xs text-gray-700 transition-colors hover:text-teal-600 hover:cursor-pointer lg:px-2.5"
                  type="button"
                >
                  <UserPlus size={18} />
                  <span>회원가입</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => isAdmin && navigate('/admin')}
                  className={`flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 ${
                    isAdmin
                      ? 'cursor-pointer transition-colors hover:bg-teal-100'
                      : ''
                  }`}
                  title={isAdmin ? '관리자 페이지로 이동' : ''}
                  type="button"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {userName ? `${userName}님` : isAdmin ? '관리자님' : '회원님'}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:text-red-600 hover:cursor-pointer"
                  type="button"
                >
                  <LogOut size={18} />
                  <span>로그아웃</span>
                </button>
              </>
            )}

            
          </div>

          <button
            className="absolute right-0 -mr-1 p-2 text-teal-600 md:hidden"
            type="button"
            onClick={() => setIsContactModalOpen(true)}
          >
            <Mail size={20} />
          </button>
        </div>
      </div>

      {isSignupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="relative rounded-t-xl bg-gradient-to-r from-teal-600 to-teal-500 p-6">
              <button
                onClick={() => setIsSignupModalOpen(false)}
                className="absolute right-4 top-4 text-white transition-colors hover:text-gray-200"
                type="button"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <UserPlus size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">회원가입</h2>
                  <p className="text-sm text-teal-50">한국 SOCIONET 연구소</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(event) =>
                      updateSignupField('name')(event.target.value)
                    }
                    placeholder="홍길동"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(event) =>
                      updateSignupField('email')(event.target.value)
                    }
                    placeholder="example@email.com"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={signupData.phone}
                    onChange={(event) =>
                      updateSignupField('phone')(event.target.value)
                    }
                    placeholder="010-1234-5678"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  신청 과정 <span className="text-red-500">*</span>
                </label>
                <select
                  value={signupData.role}
                  onChange={(event) =>
                    updateSignupField('role')(event.target.value)
                  }
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors focus:border-teal-500 focus:outline-none"
                >
                  <option value="BEGINNER">초급 과정</option>
                  <option value="INTERMEDIATE">중급 과정</option>
                  <option value="ADVANCED">고급 과정</option>
                  <option value="INSTRUCTOR">일반강사과정</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(event) =>
                      updateSignupField('password')(event.target.value)
                    }
                    placeholder="8자 이상 입력"
                    required
                    minLength={8}
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(event) =>
                      updateSignupField('confirmPassword')(event.target.value)
                    }
                    placeholder="비밀번호 재입력"
                    required
                    minLength={8}
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
                {signupData.password &&
                  signupData.confirmPassword &&
                  signupData.password !== signupData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSignupModalOpen(false)}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:bg-teal-700"
                >
                  가입하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsContactModalOpen(false)
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-teal-600">
                  Contact
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  연구소 연락처
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">M.</p>
                <p className="mt-1">010-6563-7308</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">E.</p>
                <p className="mt-1 break-all">
                  ksocionet@gmail.com / ksocionet@naver.com
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
