import { useEffect, useMemo, useState } from 'react'
import { Play, Clock, CheckCircle, Video, Home } from 'lucide-react'
import { fetchMe, fetchVideo, fetchVideos, updateVideoProgress } from '../lib/api'

interface Lecture {
  id: string
  title: string
  duration: string
  completed: boolean
  description: string
  videoId: string
}

type CourseLevel = '초급' | '중급' | '고급' | '일반강사과정'

interface Course {
  id: string
  title: string
  level: CourseLevel
  description: string
  totalLectures: number
  totalDuration: string
  lectures: Lecture[]
}

interface OnlineEducationPageProps {
  onBack: () => void
}

const levelTabs: Array<{
  level: CourseLevel
  color: string
  bgColor: string
  textColor: string
}> = [
  {
    level: '초급',
    color: 'from-teal-600 to-teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
  },
  {
    level: '중급',
    color: 'from-orange-600 to-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  {
    level: '고급',
    color: 'from-purple-600 to-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    level: '일반강사과정',
    color: 'from-blue-600 to-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
]

const roleToLevel: Record<string, CourseLevel> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
  INSTRUCTOR: '일반강사과정',
}

const levelToRole: Record<CourseLevel, string> = {
  초급: 'BEGINNER',
  중급: 'INTERMEDIATE',
  고급: 'ADVANCED',
  일반강사과정: 'INSTRUCTOR',
}

export default function OnlineEducationPage({ onBack }: OnlineEducationPageProps) {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [accessibleVideos, setAccessibleVideos] = useState<
    Array<{
      id: string
      title: string
      description?: string
      requiredRole: string
      durationSeconds?: number
      completed?: boolean
    }>
  >([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        setIsAuthenticated(true)
        setUserRole(user.role)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUserRole(null)
      })
      .finally(() => setAuthChecked(true))
  }, [])


  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    setIsLoadingVideos(true)
    fetchVideos()
      .then(({ videos }) => {
        setAccessibleVideos(videos)
      })
      .finally(() => setIsLoadingVideos(false))
  }, [isAuthenticated])

  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>('초급')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null)

  const allowedTabs = useMemo(() => {
    if (!userRole) {
      return []
    }

    if (userRole === 'ADMIN') {
      return levelTabs
    }

    const targetLevel = roleToLevel[userRole]
    return targetLevel ? levelTabs.filter((tab) => tab.level === targetLevel) : []
  }, [userRole])

  useEffect(() => {
    if (allowedTabs.length > 0) {
      setSelectedLevel(allowedTabs[0].level)
      setSelectedCourse(null)
      setSelectedLectureId(null)
      setSelectedVideoUrl(null)
    }
  }, [allowedTabs])

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) {
      return '00:00'
    }
    const minutes = Math.floor(seconds / 60)
    const remaining = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remaining
      .toString()
      .padStart(2, '0')}`
  }

  const videosForLevel = useMemo(() => {
    if (!selectedLevel) {
      return []
    }
    const requiredRole = levelToRole[selectedLevel]
    return accessibleVideos.filter((video) => video.requiredRole === requiredRole)
  }, [accessibleVideos, selectedLevel])

  const derivedCourse = useMemo<Course | null>(() => {
    if (!authChecked || !isAuthenticated) {
      return null
    }
    if (videosForLevel.length === 0) {
      return null
    }

    const lectures: Lecture[] = videosForLevel.map((video) => ({
      id: video.id,
      videoId: video.id,
      title: video.title,
      description: video.description || '',
      duration: formatDuration(video.durationSeconds),
      completed: Boolean(video.completed),
    }))

    const totalSeconds = videosForLevel.reduce(
      (sum, video) => sum + (video.durationSeconds || 0),
      0,
    )

    return {
      id: `course-${selectedLevel}`,
      title: `${selectedLevel} 과정`,
      level: selectedLevel,
      description: `${selectedLevel} 과정 온라인 강의 목록입니다.`,
      totalLectures: lectures.length,
      totalDuration: totalSeconds ? formatDuration(totalSeconds) : '준비중',
      lectures,
    }
  }, [authChecked, isAuthenticated, videosForLevel, selectedLevel])

  const currentLevelTab = levelTabs.find((tab) => tab.level === selectedLevel)
  const courseToShow = selectedCourse || derivedCourse
  const selectedLecture = useMemo(
    () => courseToShow?.lectures.find((lecture) => lecture.id === selectedLectureId) || null,
    [courseToShow, selectedLectureId],
  )

  const handleLectureClick = async (lecture: Lecture) => {
    if (!isAuthenticated) {
      return
    }
    setSelectedLectureId(lecture.id)
    setIsLoadingVideo(true)
    try {
      const result = await fetchVideo(lecture.videoId)
      setSelectedVideoUrl(result.video.signedUrl || null)
      if (typeof result.video.completed === 'boolean') {
        setAccessibleVideos((prev) =>
          prev.map((video) =>
            video.id === lecture.videoId
              ? { ...video, completed: result.video.completed }
              : video,
          ),
        )
      }
    } finally {
      setIsLoadingVideo(false)
    }
  }

  useEffect(() => {
    if (derivedCourse) {
      setSelectedCourse(derivedCourse)
    }
  }, [derivedCourse])

  const toggleCompletion = async (videoId: string, value: boolean) => {
    if (!isAuthenticated) {
      return
    }
    await updateVideoProgress(videoId, value)
    setAccessibleVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, completed: value } : video,
      ),
    )
  }

  const handleNextLecture = () => {
    if (!selectedCourse || !selectedLecture) {
      return
    }
    const index = selectedCourse.lectures.findIndex(
      (lecture) => lecture.id === selectedLecture.id,
    )
    if (index < 0 || index === selectedCourse.lectures.length - 1) {
      return
    }
    const nextLecture = selectedCourse.lectures[index + 1]
    void handleLectureClick(nextLecture)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`bg-gradient-to-r ${currentLevelTab?.color} p-8 text-white shadow-lg`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center gap-2">
            <Video size={32} />
            <h1 className="text-3xl font-bold">온라인 교육</h1>
          </div>
          <p className="text-white/90">SOCIONET 전문가 양성 온라인 강의</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-md">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-200 hover:cursor-pointer"
            type="button"
          >
            <Home size={18} />
            <span>홈으로</span>
          </button>
          {allowedTabs.map((tab) => (
            <button
              key={tab.level}
              onClick={() => {
                setSelectedLevel(tab.level)
                setSelectedCourse(null)
                setSelectedLectureId(null)
                setSelectedVideoUrl(null)
              }}
              className={`min-w-[150px] flex-1 rounded-lg px-6 py-3 font-bold transition-all ${
                selectedLevel === tab.level
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              type="button"
            >
              {tab.level}
            </button>
          ))}
        </div>

        {!authChecked ? (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-md">
            로그인 상태 확인 중입니다.
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-md">
            로그인 후 권한에 맞는 강의를 확인할 수 있습니다.
          </div>
        ) : isLoadingVideos ? (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-md">
            강의 목록 불러오는 중...
          </div>
        ) : !courseToShow ? (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-md">
            현재 수강 가능한 강의가 없습니다.
          </div>
        ) : courseToShow ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-xl bg-white p-4 shadow-md">
                <h3 className="mb-2 font-bold text-gray-800">
                  {courseToShow.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {courseToShow.description}
                </p>

                <div className="max-h-[600px] space-y-1 overflow-y-auto">
                  {courseToShow.lectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => {
                        void handleLectureClick(lecture)
                      }}
                      className={`w-full rounded-lg p-3 text-left transition-colors hover:cursor-pointer ${
                        selectedLecture?.id === lecture.id
                          ? `${currentLevelTab?.bgColor} ${currentLevelTab?.textColor} font-bold`
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      type="button"
                    >
                      <div className="flex items-start gap-2">
                        {lecture.completed ? (
                          <CheckCircle
                            size={18}
                            className="mt-0.5 flex-shrink-0 text-green-600"
                          />
                        ) : (
                          <Play
                            size={18}
                            className="mt-0.5 flex-shrink-0 text-gray-400"
                          />
                        )}
                        <div className="flex-1">
                          <div className="mb-1 text-sm font-bold">
                            {lecture.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-75">
                            <span>{lecture.duration}</span>
                            <span>
                              {lecture.completed ? '시청 완료' : '미시청'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedLecture ? (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-xl bg-white shadow-md">
                    <div className="flex aspect-video items-center justify-center bg-gray-900">
                      {selectedVideoUrl ? (
                        <video
                          src={selectedVideoUrl}
                          controls
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                            <Play size={40} className="ml-1 text-white" />
                          </div>
                          <p className="text-lg font-bold text-white">
                            {isLoadingVideo ? '영상 불러오는 중...' : selectedLecture.title}
                          </p>
                          <p className="mt-2 text-sm text-white/70">
                            {selectedLecture.duration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">
                      {selectedLecture.title}
                    </h2>
                    <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{selectedLecture.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedLecture.completed ? (
                          <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="font-bold text-green-600">
                              시청 완료
                            </span>
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            <span>미시청</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="mb-2 font-bold text-gray-800">
                        강의 설명
                      </h3>
                      <p className="leading-relaxed text-gray-600">
                        {selectedLecture.description || '설명이 없습니다.'}
                      </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        className="flex-1 rounded-lg bg-teal-600 px-6 py-3 font-bold text-white transition-colors hover:bg-teal-700"
                        onClick={() =>
                          toggleCompletion(
                            selectedLecture.videoId,
                            !selectedLecture.completed,
                          )
                        }
                        type="button"
                      >
                        {selectedLecture.completed ? '미시청으로 변경' : '시청 완료 표시'}
                      </button>
                      <button
                        className="rounded-lg bg-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-300"
                        onClick={handleNextLecture}
                        disabled={
                          !courseToShow ||
                          !selectedLecture ||
                          courseToShow.lectures.findIndex(
                            (lecture) => lecture.id === selectedLecture.id,
                          ) === courseToShow.lectures.length - 1
                        }
                        type="button"
                      >
                        다음 강의
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-12 text-center shadow-md">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Play size={40} className="text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    강의를 선택해주세요
                  </h3>
                  <p className="text-gray-600">
                    왼쪽 목록에서 원하는 강의를 선택하여 학습을 시작하세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-md">
            현재 수강 가능한 강의가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
