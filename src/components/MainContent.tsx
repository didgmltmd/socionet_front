import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network } from 'lucide-react'
import IntroductionPage from '../pages/IntroductionPage'
import UnderstandingPage from '../pages/UnderstandingPage'
import TestPage from '../pages/TestPage'
import CommunityPage from '../pages/CommunityPage'
import CounselingPage from '../pages/CounselingPage'
import ResourcesPage from '../pages/ResourcesPage'
import AdminPage from '../pages/AdminPage'
import { fetchPosts } from '../lib/api'

interface MainContentProps {
  currentPage: string
  currentSubPage: string
}


function HomePage() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState<Array<{ id: string; title: string; publishedAt: string }>>([])
  const [activities, setActivities] = useState<Array<{ id: string; title: string; publishedAt: string }>>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  useEffect(() => {
    setIsLoadingPosts(true)
    Promise.all([fetchPosts('NOTICE'), fetchPosts('ACTIVITY')])
      .then(([noticeResult, activityResult]) => {
        setNotices(noticeResult.posts)
        setActivities(activityResult.posts)
      })
      .catch(() => {
        setNotices([])
        setActivities([])
      })
      .finally(() => setIsLoadingPosts(false))
  }, [])

  const formatDate = (value: string) => value.slice(0, 10)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white shadow-xl sm:p-8 lg:mb-12 lg:p-12">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="network-pattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="2" fill="white" />
                <circle cx="50" cy="30" r="2" fill="white" />
                <circle cx="80" cy="20" r="2" fill="white" />
                <circle cx="30" cy="60" r="2" fill="white" />
                <circle cx="70" cy="70" r="2" fill="white" />
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
                <line
                  x1="10"
                  y1="10"
                  x2="30"
                  y2="60"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <line
                  x1="30"
                  y1="60"
                  x2="70"
                  y2="70"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <line
                  x1="50"
                  y1="30"
                  x2="70"
                  y2="70"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network-pattern)" />
          </svg>
        </div>

        <div className="relative z-10">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl lg:mb-4 lg:text-4xl">
            한국 SOCIONET 연구소에 오신 것을 환영합니다
          </h2>
          <p className="mb-4 text-base text-white/90 sm:text-lg lg:mb-6 lg:text-xl">
            사회관계망 분석을 통한 전문적인 심리검사 및 상담 서비스
          </p>
          <button
            type="button"
            onClick={() => navigate('/test/application')}
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-teal-600 shadow-lg transition-all hover:bg-teal-50 hover:cursor-pointer sm:px-8 sm:py-3 sm:text-base"
          >
            {'\uac80\uc0ac \ubc0f \uad50\uc721 \uc2e0\uccad'}
          </button>
        </div>
      </div>
      <div className="mb-8 lg:mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Network size={32} className="text-teal-600" />
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
              SOCIONET이란?
            </h2>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            SOCIONET은 집단 내 개인의 사회적 관계와 역동을 시각화하여
            분석하는 한국형 심리검사 도구입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border-2 border-teal-200 bg-white shadow-lg transition-all hover:border-teal-400">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white">
              <h3 className="text-lg font-bold">소시오그램 관계망</h3>
              <p className="text-sm text-teal-50">개인 간 관계 구조 파악</p>
            </div>
            <div className="bg-gray-50 p-6">
              <svg className="h-64 w-full" viewBox="0 0 300 250">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#14b8a6" />
                  </marker>
                </defs>

                <line
                  x1="150"
                  y1="50"
                  x2="80"
                  y2="120"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="150"
                  y1="50"
                  x2="220"
                  y2="120"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="80"
                  y1="120"
                  x2="50"
                  y2="200"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="220"
                  y1="120"
                  x2="250"
                  y2="200"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="80"
                  y1="120"
                  x2="150"
                  y2="200"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="220"
                  y1="120"
                  x2="150"
                  y2="200"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />

                <circle
                  cx="150"
                  cy="50"
                  r="20"
                  fill="#0d9488"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x="150"
                  y="55"
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  A
                </text>

                <circle
                  cx="80"
                  cy="120"
                  r="18"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x="80"
                  y="125"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  B
                </text>

                <circle
                  cx="220"
                  cy="120"
                  r="18"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x="220"
                  y="125"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  C
                </text>

                <circle
                  cx="50"
                  cy="200"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x="50"
                  y="205"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  D
                </text>

                <circle
                  cx="150"
                  cy="200"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x="150"
                  y="205"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  E
                </text>

                <circle
                  cx="250"
                  cy="200"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x="250"
                  y="205"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  F
                </text>
              </svg>
              <p className="mt-3 text-center text-sm text-gray-600">
                집단 내 개인 간의 선호도와 관계를 화살표로 시각화
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border-2 border-orange-200 bg-white shadow-lg transition-all hover:border-orange-400">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
              <h3 className="text-lg font-bold">소집단 관계망</h3>
              <p className="text-sm text-orange-50">하위 집단 형성 분석</p>
            </div>
            <div className="bg-gray-50 p-6">
              <svg className="h-64 w-full" viewBox="0 0 300 250">
                <circle cx="70" cy="70" r="50" fill="#d1fae5" opacity="0.5" />
                <circle
                  cx="50"
                  cy="60"
                  r="18"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="90"
                  cy="60"
                  r="18"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="70"
                  cy="90"
                  r="18"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />
                <line
                  x1="50"
                  y1="60"
                  x2="90"
                  y2="60"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <line
                  x1="50"
                  y1="60"
                  x2="70"
                  y2="90"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <line
                  x1="90"
                  y1="60"
                  x2="70"
                  y2="90"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />

                <circle cx="230" cy="80" r="55" fill="#fed7aa" opacity="0.5" />
                <circle
                  cx="210"
                  cy="70"
                  r="18"
                  fill="#f97316"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="250"
                  cy="70"
                  r="18"
                  fill="#f97316"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="230"
                  cy="105"
                  r="18"
                  fill="#f97316"
                  stroke="white"
                  strokeWidth="3"
                />
                <line
                  x1="210"
                  y1="70"
                  x2="250"
                  y2="70"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <line
                  x1="210"
                  y1="70"
                  x2="230"
                  y2="105"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <line
                  x1="250"
                  y1="70"
                  x2="230"
                  y2="105"
                  stroke="#f97316"
                  strokeWidth="2"
                />

                <circle cx="150" cy="190" r="45" fill="#e9d5ff" opacity="0.5" />
                <circle
                  cx="135"
                  cy="180"
                  r="18"
                  fill="#a855f7"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="165"
                  cy="180"
                  r="18"
                  fill="#a855f7"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="150"
                  cy="210"
                  r="18"
                  fill="#a855f7"
                  stroke="white"
                  strokeWidth="3"
                />
                <line
                  x1="135"
                  y1="180"
                  x2="165"
                  y2="180"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
                <line
                  x1="135"
                  y1="180"
                  x2="150"
                  y2="210"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
                <line
                  x1="165"
                  y1="180"
                  x2="150"
                  y2="210"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
              </svg>
              <p className="mt-3 text-center text-sm text-gray-600">
                색상별로 구분된 하위 집단의 관계 패턴 분석
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border-2 border-teal-200 bg-white shadow-lg transition-all hover:border-teal-400">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 text-white">
              <h3 className="text-lg font-bold">개인별 관계망</h3>
              <p className="text-sm text-teal-50">개인 중심 관계 분석</p>
            </div>
            <div className="bg-gray-50 p-6">
              <svg className="h-64 w-full" viewBox="0 0 300 250">
                <line
                  x1="150"
                  y1="125"
                  x2="80"
                  y2="60"
                  stroke="#14b8a6"
                  strokeWidth="3"
                />
                <line
                  x1="150"
                  y1="125"
                  x2="220"
                  y2="60"
                  stroke="#14b8a6"
                  strokeWidth="3"
                />
                <line
                  x1="150"
                  y1="125"
                  x2="70"
                  y2="140"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <line
                  x1="150"
                  y1="125"
                  x2="230"
                  y2="140"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <line
                  x1="150"
                  y1="125"
                  x2="100"
                  y2="200"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <line
                  x1="150"
                  y1="125"
                  x2="200"
                  y2="200"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <line
                  x1="150"
                  y1="125"
                  x2="150"
                  y2="50"
                  stroke="#14b8a6"
                  strokeWidth="1"
                  opacity="0.5"
                />

                <circle
                  cx="150"
                  cy="125"
                  r="25"
                  fill="#0d9488"
                  stroke="white"
                  strokeWidth="4"
                />
                <text
                  x="150"
                  y="132"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  나
                </text>

                <circle
                  cx="80"
                  cy="60"
                  r="20"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="220"
                  cy="60"
                  r="20"
                  fill="#14b8a6"
                  stroke="white"
                  strokeWidth="3"
                />

                <circle
                  cx="70"
                  cy="140"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="230"
                  cy="140"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="100"
                  cy="200"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="16"
                  fill="#5eead4"
                  stroke="white"
                  strokeWidth="3"
                />

                <circle
                  cx="150"
                  cy="50"
                  r="12"
                  fill="#99f6e4"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
              <p className="mt-3 text-center text-sm text-gray-600">
                개인을 중심으로 관계의 강도와 거리를 시각화
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 lg:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-teal-700">
            <Network size={24} />
            SOCIONET의 핵심 기능
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-teal-600"></div>
              <div>
                <p className="font-bold text-gray-800">관계 시각화</p>
                <p className="text-sm text-gray-600">
                  집단 내 모든 관계를 도표로 명확하게 표현
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
              <div>
                <p className="font-bold text-gray-800">객관적 분석</p>
                <p className="text-sm text-gray-600">
                  개인의 주관이 배제된 과학적 데이터 기반 평가
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-teal-600"></div>
              <div>
                <p className="font-bold text-gray-800">문제 해결</p>
                <p className="text-sm text-gray-600">
                  배척아동, 갱집단 등 집단 문제 조기 발견 및 개입
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
              <div>
                <p className="font-bold text-gray-800">한국형 도구</p>
                <p className="text-sm text-gray-600">
                  20년 연구로 개발된 특허 취득 검사 도구
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="relative overflow-hidden rounded-xl border-l-4 border-teal-500 bg-white p-6 shadow-lg lg:p-8">
          <div className="absolute -bottom-4 -right-4 opacity-5">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle
                cx="30"
                cy="30"
                r="8"
                fill="currentColor"
                className="text-teal-600"
              />
              <circle
                cx="90"
                cy="50"
                r="8"
                fill="currentColor"
                className="text-teal-600"
              />
              <circle
                cx="120"
                cy="90"
                r="8"
                fill="currentColor"
                className="text-teal-600"
              />
              <circle
                cx="50"
                cy="110"
                r="8"
                fill="currentColor"
                className="text-teal-600"
              />
              <line
                x1="30"
                y1="30"
                x2="90"
                y2="50"
                stroke="currentColor"
                strokeWidth="2"
                className="text-teal-600"
              />
              <line
                x1="90"
                y1="50"
                x2="120"
                y2="90"
                stroke="currentColor"
                strokeWidth="2"
                className="text-teal-600"
              />
              <line
                x1="30"
                y1="30"
                x2="50"
                y2="110"
                stroke="currentColor"
                strokeWidth="2"
                className="text-teal-600"
              />
              <line
                x1="50"
                y1="110"
                x2="120"
                y2="90"
                stroke="currentColor"
                strokeWidth="2"
                className="text-teal-600"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="mb-6 text-xl font-bold text-teal-700 lg:text-2xl">
              공지사항
            </h3>
            <div className="space-y-3">
              {isLoadingPosts ? (
                <div className="text-sm text-gray-500">불러오는 중...</div>
              ) : notices.length === 0 ? (
                <div className="text-sm text-gray-500">등록된 공지사항이 없습니다.</div>
              ) : notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => navigate(`/community/posts/${notice.id}`)}
                  className="flex w-full flex-col gap-1 rounded-lg border-b border-gray-100 px-2 py-3 text-left transition-colors hover:bg-teal-50 hover:cursor-pointer sm:flex-row sm:items-center sm:justify-between sm:gap-0"
                >
                  <span className="text-sm text-gray-700 lg:text-base">
                    {notice.title}
                  </span>
                  <span className="text-xs text-gray-400 lg:text-sm">
                    {formatDate(notice.publishedAt)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border-l-4 border-orange-500 bg-white p-6 shadow-lg lg:p-8">
          <div className="absolute -bottom-4 -right-4 opacity-5">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle
                cx="40"
                cy="40"
                r="8"
                fill="currentColor"
                className="text-orange-600"
              />
              <circle
                cx="100"
                cy="30"
                r="8"
                fill="currentColor"
                className="text-orange-600"
              />
              <circle
                cx="110"
                cy="100"
                r="8"
                fill="currentColor"
                className="text-orange-600"
              />
              <circle
                cx="60"
                cy="120"
                r="8"
                fill="currentColor"
                className="text-orange-600"
              />
              <line
                x1="40"
                y1="40"
                x2="100"
                y2="30"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-600"
              />
              <line
                x1="100"
                y1="30"
                x2="110"
                y2="100"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-600"
              />
              <line
                x1="40"
                y1="40"
                x2="60"
                y2="120"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-600"
              />
              <line
                x1="60"
                y1="120"
                x2="110"
                y2="100"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-600"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="mb-6 text-xl font-bold text-orange-600 lg:text-2xl">
              커뮤니티 활동
            </h3>
            <div className="space-y-3">
              {isLoadingPosts ? (
                <div className="text-sm text-gray-500">불러오는 중...</div>
              ) : activities.length === 0 ? (
                <div className="text-sm text-gray-500">등록된 활동이 없습니다.</div>
              ) : activities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => navigate(`/community/posts/${activity.id}`)}
                  className="flex w-full flex-col gap-1 rounded-lg border-b border-gray-100 px-2 py-3 text-left transition-colors hover:bg-orange-50 hover:cursor-pointer sm:flex-row sm:items-center sm:justify-between sm:gap-0"
                >
                  <span className="text-sm text-gray-700 lg:text-base">
                    {activity.title}
                  </span>
                  <span className="text-xs text-gray-400 lg:text-sm">
                    {formatDate(activity.publishedAt)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MainContent({
  currentPage,
  currentSubPage,
}: MainContentProps) {
  const renderPage = () => {
    switch (currentPage) {
      case '연구소-소개':
        return <IntroductionPage subPage={currentSubPage} />
      case 'socionet-이해':
        return <UnderstandingPage subPage={currentSubPage} />
      case 'socionet-검사':
        return <TestPage subPage={currentSubPage} />
      case '커뮤니티':
        return <CommunityPage subPage={currentSubPage} />
      case '일반-검사-및-상담':
        return <CounselingPage />
      case '자료실':
        return <ResourcesPage subPage={currentSubPage} />
      case '관리자':
        return <AdminPage />
      default:
        return <HomePage />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  )
}
