import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network } from 'lucide-react'
import mainImage1 from '../assets/main_1.png'
import mainImage2 from '../assets/main_2.png'
import mainImage3 from '../assets/main_3.png'
import mainImage4 from '../assets/main_4.png'
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

let cachedNotices: Array<{ id: string; title: string; publishedAt: string }> | null = null
let cachedActivities: Array<{ id: string; title: string; publishedAt: string }> | null = null


function HomePage() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState<Array<{ id: string; title: string; publishedAt: string }>>([])
  const [activities, setActivities] = useState<Array<{ id: string; title: string; publishedAt: string }>>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [selectedMainImage, setSelectedMainImage] = useState<{
    src: string
    title: string
  } | null>(null)
    const zoomContainerRef = useRef<HTMLDivElement | null>(null)
    const zoomImageRef = useRef<HTMLImageElement | null>(null)
    const [zoomLens, setZoomLens] = useState({
      x: 0,
      y: 0,
      pointerX: 0,
      pointerY: 0,
      imageWidth: 0,
      imageHeight: 0,
      visible: false,
    })
    const lensWidth = 300
    const lensHeight = 240

  useEffect(() => {
    if (cachedNotices && cachedActivities) {
      setNotices(cachedNotices)
      setActivities(cachedActivities)
      return
    }

    setIsLoadingPosts(true)
    Promise.all([fetchPosts('NOTICE'), fetchPosts('ACTIVITY')])
      .then(([noticeResult, activityResult]) => {
        cachedNotices = noticeResult.posts
        cachedActivities = activityResult.posts
        setNotices(noticeResult.posts)
        setActivities(activityResult.posts)
      })
      .catch(() => {
        setNotices([])
        setActivities([])
      })
      .finally(() => setIsLoadingPosts(false))
  }, [])

  const latestNotices = useMemo(() => notices.slice(0, 5), [notices])

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
            한국 SOCIONET 연구소에 오신 것을 환영합니다.
          </h2>
          <p className="mb-4 text-base text-white/90 sm:text-lg lg:mb-6 lg:text-xl">
            심리검사 및 상담 서비스 전문기관
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
            SOCIONET은 집단 내 각 개인들의 사회적 성격과 소집단의 역동을 시각화하여 분석하는 한국형 집단심리검사 도구입니다.
            
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
  <button
    type="button"
    onClick={() =>
      setSelectedMainImage({ src: mainImage1, title: '개인의 사회적 특성 분석' })
    }
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer"
          >
            <div className="border-b border-teal-100 bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 text-center text-base font-semibold text-white">
              개인의 사회적 특성 분석
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden bg-white p-3">
              <motion.img
                src={mainImage1}
                alt="개인의 사회적 특성 분석"
                className="h-72 w-full origin-center object-contain scale-[1.1] sm:scale-[1.2] md:scale-[1.3] lg:scale-[1.4]"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
            </div>
  </button>

          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-md">
            <div className="border-b border-teal-100 bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 text-center text-base font-semibold text-white">
              자기분석과 자기망
            </div>
            <div className="grid flex-1 gap-4 p-3">
      <button
        type="button"
        onClick={() => setSelectedMainImage({ src: mainImage2, title: '자기분석' })}
                className="group overflow-hidden rounded-xl border border-teal-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:cursor-pointer"
              >
                <div className="border-b border-teal-100 bg-teal-50 px-4 py-2.5 text-center text-sm font-semibold text-teal-700">
                  자기분석
                </div>
              <div className="flex items-center justify-center overflow-hidden bg-white p-3">
                <motion.img
                  src={mainImage2}
                  alt="자기분석"
                  className="h-56 w-full origin-center object-contain scale-[1.1] sm:scale-[1.2] md:scale-[1.3] lg:scale-[1.4]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
      </button>
      <button
        type="button"
        onClick={() => setSelectedMainImage({ src: mainImage3, title: '자기망' })}
                className="group overflow-hidden rounded-xl border border-teal-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:cursor-pointer"
              >
                <div className="border-b border-teal-100 bg-teal-50 px-4 py-2.5 text-center text-sm font-semibold text-teal-700">
                  자기망
                </div>
              <div className="flex items-center justify-center overflow-hidden bg-white p-3">
                <motion.img
                  src={mainImage3}
                  alt="자기망"
                  className="h-56 w-full origin-center object-contain scale-[1.1] sm:scale-[1.2] md:scale-[1.3] lg:scale-[1.4]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
      </button>
    </div>
  </div>

  <button
    type="button"
    onClick={() =>
      setSelectedMainImage({ src: mainImage4, title: '소집단 관계망 분석' })
    }
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer"
          >
            <div className="border-b border-teal-100 bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 text-center text-base font-semibold text-white">
              소집단 관계망 분석
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden bg-white p-3">
              <motion.img
                src={mainImage4}
                alt="소집단 관계망 분석"
                className="h-72 w-full origin-center object-contain scale-[1.1] sm:scale-[1.2] md:scale-[1.3] lg:scale-[1.4]"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
            </div>
  </button>
</div>

        <AnimatePresence>
          {selectedMainImage && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMainImage(null)}
            >
              <motion.div
                className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-center text-sm font-semibold text-gray-700">
                  {selectedMainImage.title}
                </div>
                <div className="bg-white p-4">
                  <div
                    ref={zoomContainerRef}
                    className="relative mx-auto max-h-[75vh] w-full overflow-hidden cursor-zoom-in"
                    onMouseMove={(event) => {
                      const container = zoomContainerRef.current
                      if (!container) {
                        return
                      }
                      const rect = container.getBoundingClientRect()
                      const image = zoomImageRef.current
                      const x = event.clientX - rect.left
                      const y = event.clientY - rect.top

                      if (!image || !image.naturalWidth || !image.naturalHeight) {
                        return
                      }

                      const containerWidth = rect.width
                      const containerHeight = rect.height
                      const imageAspect = image.naturalWidth / image.naturalHeight
                      const containerAspect = containerWidth / containerHeight
                      let imageWidth = containerWidth
                      let imageHeight = containerHeight
                      let imageLeft = 0
                      let imageTop = 0

                      if (containerAspect > imageAspect) {
                        imageHeight = containerHeight
                        imageWidth = imageHeight * imageAspect
                        imageLeft = (containerWidth - imageWidth) / 2
                      } else {
                        imageWidth = containerWidth
                        imageHeight = imageWidth / imageAspect
                        imageTop = (containerHeight - imageHeight) / 2
                      }

                      const pointerX = x - imageLeft
                      const pointerY = y - imageTop

                      if (
                        pointerX < 0 ||
                        pointerY < 0 ||
                        pointerX > imageWidth ||
                        pointerY > imageHeight
                      ) {
                        setZoomLens((prev) => ({ ...prev, visible: false }))
                        return
                      }
                      const centerX = Math.min(
                        Math.max(x, imageLeft + lensWidth / 2),
                        imageLeft + imageWidth - lensWidth / 2,
                      )
                      const centerY = Math.min(
                        Math.max(y, imageTop + lensHeight / 2),
                        imageTop + imageHeight - lensHeight / 2,
                      )
                      const clampedX = centerX - lensWidth / 2
                      const clampedY = centerY - lensHeight / 2
                      setZoomLens({
                        x: clampedX,
                        y: clampedY,
                        pointerX,
                        pointerY,
                        imageWidth,
                        imageHeight,
                        visible: true,
                      })
                    }}
                    onMouseLeave={() =>
                      setZoomLens((prev) => ({ ...prev, visible: false }))
                    }
                  >
                      <img
                        src={selectedMainImage.src}
                        alt={selectedMainImage.title}
                        ref={zoomImageRef}
                        className="max-h-[75vh] w-full object-contain"
                      />
                    {zoomLens.visible && (
                      <div
                        className="pointer-events-none absolute z-10 rounded-md border-2 border-teal-500 shadow-lg"
                        style={{
                          width: 300,
                          height: lensHeight,
                          left: zoomLens.x,
                          top: zoomLens.y,
                          backgroundImage: `url(${selectedMainImage.src})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '380% 380%',
                          backgroundPosition: `${
                            (zoomLens.pointerX / (zoomLens.imageWidth || 1)) *
                              100
                          }% ${
                            (zoomLens.pointerY / (zoomLens.imageHeight || 1)) *
                              100
                          }%`,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 lg:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-teal-700">
            <Network size={24} />
            SOCIONET 핵심 기능
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-teal-600"></div>
              <div>
                <p className="font-bold text-gray-800">개인분석</p>
                <p className="text-sm text-gray-600">
                  개인의 사회적 성격 특성 분석
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
              <div>
                <p className="font-bold text-gray-800">소집단 분석</p>
                <p className="text-sm text-gray-600">
                  소집단의 네트워크 성질 분석
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-teal-600"></div>
              <div>
                <p className="font-bold text-gray-800">문제 해결</p>
                <p className="text-sm text-gray-600">
                  문제아동, 외톨이, 관심사병, 갱집단 등등의 조기 발견 및 처치 개입, 팀빌딩 제시
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
              <div>
                <p className="font-bold text-gray-800">한국형 집단검사 도구</p>
                <p className="text-sm text-gray-600">
                  특허 취득 집단 심리검사 도구
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
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-teal-700 lg:text-2xl">공지사항</h3>
              <button
                type="button"
                onClick={() => navigate('/news/notice')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:cursor-pointer"
              >
                전체보기
              </button>
            </div>
            <div className="space-y-3">
              {isLoadingPosts ? (
                <div className="text-sm text-gray-500">불러오는 중...</div>
              ) : notices.length === 0 ? (
                <div className="text-sm text-gray-500">등록된 공지사항이 없습니다.</div>
              ) : latestNotices.map((notice) => (
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
      case '일반-검사-상담':
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










