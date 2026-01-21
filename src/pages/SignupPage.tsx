import { useState, type ChangeEvent, type FormEvent } from 'react'
import { UserPlus, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'

interface SignupPageProps {
  onBack: () => void
}

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  organization: string
}

const initialForm: SignupFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  organization: '',
}

export default function SignupPage({ onBack }: SignupPageProps) {
  const [formData, setFormData] = useState<SignupFormData>(initialForm)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('회원가입 시도:', formData)
    alert('회원가입이 완료되었습니다!')
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-teal-600 transition-colors hover:text-teal-700"
          whileHover={{ x: -5 }}
          transition={{ duration: 0.2 }}
          type="button"
        >
          <ArrowLeft size={20} />
          <span>돌아가기</span>
        </motion.button>

        <motion.div
          className="overflow-hidden rounded-2xl bg-white shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-8 text-white">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <UserPlus size={28} />
              </div>
              <h1 className="text-3xl font-bold">회원가입</h1>
            </div>
            <p className="text-teal-50">
              한국 SOCIONET 연구소에 오신 것을 환영합니다
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-11 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                    placeholder="홍길동"
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
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-11 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-11 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                    placeholder="8자 이상 입력해주세요"
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
                    size={20}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-11 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                    placeholder="비밀번호를 다시 입력해주세요"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  전화번호
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-11 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  소속 (학교/기관)
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-11 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                    placeholder="소속 기관명을 입력해주세요"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 개인정보 수집 및 이용에
                  동의합니다
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 서비스 이용약관에
                  동의합니다
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 py-4 font-bold text-white shadow-lg transition-all hover:from-teal-700 hover:to-teal-600 hover:shadow-xl"
            >
              회원가입 완료
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={onBack}
                className="font-bold text-teal-600 hover:text-teal-700"
              >
                로그인하기
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
