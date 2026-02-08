import { useEffect, useMemo, useRef, useState } from 'react'
import * as tus from 'tus-js-client'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  Search,
  Filter,
  Video,
  Trash2,
  FileText,
} from 'lucide-react'
import { createPost, createPostImageUploadUrl, createTusToken, deletePost, deleteUser as deleteUserApi, deleteVideo as deleteVideoApi, encodeUploadedVideo, fetchAdminPosts, fetchAdminVideos, fetchEncodeStatus, fetchMe, fetchUsers, fetchVideo, updatePost, updateUser, updateVideo } from '../lib/api'

type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'INSTRUCTOR'
type AdminTab = 'users' | 'education' | 'posts'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: UserStatus
  role: CourseLevel
  appliedDate?: string
}


const courseOptions: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'INSTRUCTOR']
const courseLabels: Record<CourseLevel, string> = {
  BEGINNER: '\ucd08\uae09',
  INTERMEDIATE: '\uc911\uae09',
  ADVANCED: '\uace0\uae09',
  INSTRUCTOR: '\uc77c\ubc18\uac15\uc0ac\uacfc\uc815',
}

const initialUsers: User[] = []

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<CourseLevel | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (user.role != 'ADMIN') {
          navigate('/')
          return
        }
        setIsAdminUser(true)
      })
      .catch(() => navigate('/'))
  }, [navigate])

  useEffect(() => {
    if (!isAdminUser) {
      return
    }
    fetchUsers()
      .then(({ users: userList }) => {
        setUsers(
          userList.map((user) => ({
            id: user.id,
            name: user.name || '이름 없음',
            email: user.email,
            phone: user.phone,
            status: user.status as UserStatus,
            role: user.role as CourseLevel,
            appliedDate: new Date(user.createdAt).toISOString().slice(0, 10),
          })),
        )
      })
      .catch(() => {})
  }, [isAdminUser])

  const handleApprove = async (userId: string) => {
    try {
      const { user } = await updateUser(userId, { status: 'APPROVED' })
      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId ? { ...item, status: user.status as UserStatus } : item,
        ),
      )
    } catch (error) {
      alert(error instanceof Error ? error.message : '승인 처리에 실패했습니다.')
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const { user } = await updateUser(userId, { status: 'REJECTED' })
      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId ? { ...item, status: user.status as UserStatus } : item,
        ),
      )
    } catch (error) {
      alert(error instanceof Error ? error.message : '거절 처리에 실패했습니다.')
    }
  }

  const handleEditRole = (userId: string, currentRole: CourseLevel) => {
    setEditingUserId(userId)
    setEditingRole(currentRole)
  }

  const handleSaveRole = async (userId: string) => {
    if (!editingRole) {
      return
    }
    try {
      const { user } = await updateUser(userId, { role: editingRole })
      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId ? { ...item, role: user.role as CourseLevel } : item,
        ),
      )
      setEditingUserId(null)
      setEditingRole(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '권한 변경에 실패했습니다.')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserApi(userId)
      setUsers((prev) => prev.filter((item) => item.id !== userId))
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    }
  }

  const filteredUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
      const matchesStatus = statusFilter == 'all' || user.status == statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, users])

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            {'\uC2B9\uC778 \uB300\uAE30'}
          </span>
        )
      case 'APPROVED':
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            {'\uC2B9\uC778 \uC644\uB8CC'}
          </span>
        )
      case 'REJECTED':
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            {'\uC2B9\uC778 \uAC70\uC808'}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white shadow-lg">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold">{'\uAD00\uB9AC\uC790 \uD398\uC774\uC9C0'}</h1>
          <p className="text-teal-50">
            {'\uD68C\uC6D0 \uAD00\uB9AC \uBC0F \uAD50\uC721/\uAC8C\uC2DC\uAE00 \uAD00\uB9AC'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'users'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } cursor-pointer`}
              type="button"
            >
              <Users className="mr-2 inline-block" size={20} />{' '}
              {'\uD68C\uC6D0 \uAD00\uB9AC'}
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'education'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } cursor-pointer`}
              type="button"
            >
              <Video className="mr-2 inline-block" size={20} />{' '}
              {'\uAD50\uC721 \uAD00\uB9AC'}
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'posts'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } cursor-pointer`}
              type="button"
            >
              <FileText className="mr-2 inline-block" size={20} />{' '}
              {'\uAC8C\uC2DC\uAE00 \uAD00\uB9AC'}
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={'\uC774\uB984 \uB610\uB294 \uC774\uBA54\uC77C\uB85C \uAC80\uC0C9\uD558\uC138\uC694.'}
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={18} />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as 'all' | UserStatus)
                    }
                    className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="all">{'\uC804\uCCB4'}</option>
                    <option value="PENDING">{'\uC2B9\uC778 \uB300\uAE30'}</option>
                    <option value="APPROVED">{'\uC2B9\uC778 \uC644\uB8CC'}</option>
                    <option value="REJECTED">{'\uC2B9\uC778 \uAC70\uC808'}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white shadow-md">
              <table className="w-full min-w-[920px] table-auto">
                <thead className="bg-gray-50 text-left text-sm font-bold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">{'\uC774\uB984'}</th>
                    <th className="px-4 py-3">{'\uC774\uBA54\uC77C'}</th>
                    <th className="px-4 py-3">{'\uC804\uD654\uBC88\uD638'}</th>
                    <th className="px-4 py-3">{'\uC2E0\uCCAD\uC77C'}</th>
                    <th className="px-4 py-3">{'\uC0C1\uD0DC'}</th>
                    <th className="px-4 py-3">{'\uAC15\uC758 \uAD8C\uD55C'}</th>
                    <th className="px-4 py-3">{'\uC791\uC5C5'}</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                        {'\uB4F1\uB85D\uB41C \uD68C\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="px-4 py-3 font-semibold">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.phone || '-'}</td>
                        <td className="px-4 py-3">{user.appliedDate || '-'}</td>
                        <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                        <td className="px-4 py-3">
                          {editingUserId == user.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editingRole || user.role}
                                onChange={(event) =>
                                  setEditingRole(event.target.value as CourseLevel)
                                }
                                className="rounded-lg border-2 border-gray-200 px-2 py-1 text-sm"
                              >
                                {courseOptions.map((role) => (
                                  <option key={role} value={role}>
                                    {courseLabels[role]}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleSaveRole(user.id)}
                                className="rounded-lg bg-teal-600 px-3 py-1 text-xs font-bold text-white hover:cursor-pointer"
                              >
                                <Save size={14} className="inline-block" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700">
                                {courseLabels[user.role]}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleEditRole(user.id, user.role)}
                                className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600 hover:cursor-pointer"
                              >
                                <Edit2 size={14} className="inline-block" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {user.status == 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(user.id)}
                                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:cursor-pointer"
                                >
                                  <CheckCircle size={14} className="mr-1 inline-block" />
                                  {'\uC2B9\uC778'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(user.id)}
                                  className="rounded-lg bg-orange-500 px-3 py-1 text-xs font-bold text-white hover:cursor-pointer"
                                >
                                  <XCircle size={14} className="mr-1 inline-block" />
                                  {'\uAC70\uC808'}
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('\uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) {
                                  void handleDeleteUser(user.id)
                                }
                              }}
                              className="rounded-lg bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700 hover:cursor-pointer"
                            >
                              <Trash2 size={14} className="mr-1 inline-block" />
                              {'\uC0AD\uC81C'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'education' && <EducationManagement />}

        {activeTab === 'posts' && <PostManagement />}
      </div>
    </div>
  )
}

function EducationManagement() {
  const [videos, setVideos] = useState<
    Array<{
      id: string
      title: string
      description?: string
      requiredRole: CourseLevel
      storagePath: string
      isPublished: boolean
      durationSeconds?: number
    }>
  >([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requiredRole, setRequiredRole] = useState<CourseLevel>('BEGINNER')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMessage, setUploadMessage] = useState('')
  const [isEncoding, setIsEncoding] = useState(false)
  const [encodingProgress, setEncodingProgress] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [videoFilter, setVideoFilter] = useState<CourseLevel | 'ALL'>('ALL')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingRole, setEditingRole] = useState<CourseLevel>('BEGINNER')
  const [editingDurationSeconds, setEditingDurationSeconds] = useState<number | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const loadVideos = async () => {
    try {
      const { videos: videoList } = await fetchAdminVideos()
      setVideos(
        videoList.map((video) => ({
          id: video.id,
          title: video.title,
          description: video.description || '',
          requiredRole: video.requiredRole as CourseLevel,
          storagePath: video.storagePath,
          isPublished: video.isPublished,
          durationSeconds: video.durationSeconds,
        })),
      )
    } catch {
      setVideos([])
    }
  }

  useEffect(() => {
    void loadVideos()
  }, [])

  useEffect(() => {
    if (!isEncoding) {
      setEncodingProgress(0)
      return
    }

    setEncodingProgress(3)
    const timer = window.setInterval(() => {
      setEncodingProgress((prev) => {
        if (prev >= 95) {
          return prev
        }
        const next = prev + Math.max(1, Math.round((100 - prev) * 0.04))
        return Math.min(next, 95)
      })
    }, 1200)

    return () => window.clearInterval(timer)
  }, [isEncoding])

  const extractDuration = (videoFile: File) => {
    const url = URL.createObjectURL(videoFile)
    const media = document.createElement('video')
    media.preload = 'metadata'
    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      const seconds = Math.floor(media.duration)
      if (Number.isFinite(seconds) && seconds > 0) {
        setDurationSeconds(seconds)
      }
    }
    media.onerror = () => {
      URL.revokeObjectURL(url)
      setDurationSeconds(null)
    }
    media.src = url
  }

  const handleFileSelect = (selected: File | null) => {
    setFile(selected)
    if (selected) {
      extractDuration(selected)
    } else {
      setDurationSeconds(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      return
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    if (!supabaseUrl || !supabaseAnonKey) {
      alert('Supabase 환경변수가 설정되지 않았습니다.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadMessage('')
    setIsEncoding(false)
    setEncodingProgress(0)
    try {
      const safeName = file.name
        ? file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        : `video-${Date.now()}.mp4`
      const storagePath = `videos/${Date.now()}-${safeName}`

      const { token: tusToken } = await createTusToken()

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: `${supabaseUrl.replace(/\/$/, '')}/storage/v1/upload/resumable`,
          headers: {
            authorization: `Bearer ${tusToken}`,
            apikey: supabaseAnonKey,
          },
          metadata: {
            bucketName: 'videos',
            objectName: storagePath,
            contentType: file.type || 'video/mp4',
          },
          chunkSize: 50 * 1024 * 1024,
          onError: (error) => {
            reject(error)
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            if (bytesTotal > 0) {
              setUploadProgress(Math.round((bytesUploaded / bytesTotal) * 100))
            }
          },
          onSuccess: () => {
            setUploadProgress(100)
            resolve()
          },
        })

        upload.start()
      })

      setIsEncoding(true)
      setEncodingProgress(0)
      setUploadMessage('인코딩 준비 중...')

      const encodeController = new AbortController()
      const encodeTimeout = window.setTimeout(() => {
        encodeController.abort()
      }, 60 * 60 * 1000)

      try {
        const { jobId } = await encodeUploadedVideo(
          {
            title: title.trim(),
            description: description.trim() || undefined,
            requiredRole,
            isPublished: true,
            storagePath,
          },
          undefined,
          encodeController.signal,
        )

        await new Promise<void>((resolve, reject) => {
          const startedAt = Date.now()
          const interval = window.setInterval(async () => {
            if (encodeController.signal.aborted) {
              window.clearInterval(interval)
              reject(new Error('인코딩 시간이 초과되었습니다. 다시 시도해주세요.'))
              return
            }

            try {
              const { job } = await fetchEncodeStatus(jobId)
              if (typeof job.progress === 'number') {
                const nextProgress = Math.max(0, Math.min(100, Number(job.progress)))
                setEncodingProgress((prev) => Math.max(prev, nextProgress))
              }
              if (job.message) {
                setUploadMessage(job.message)
              }
              if (job.status === 'done') {
                window.clearInterval(interval)
                setEncodingProgress(100)
                resolve()
                return
              }
              if (job.status === 'error') {
                window.clearInterval(interval)
                reject(new Error(job.message || '인코딩에 실패했습니다.'))
                return
              }
              if (Date.now() - startedAt > 60 * 60 * 1000) {
                window.clearInterval(interval)
                reject(new Error('인코딩 시간이 초과되었습니다. 다시 시도해주세요.'))
              }
            } catch (pollError) {
              window.clearInterval(interval)
              reject(pollError)
            }
          }, 3000)
        })
      } finally {
        window.clearTimeout(encodeTimeout)
      }

      setIsEncoding(false)
      setEncodingProgress(100)
      setUploadMessage('업로드되었습니다!')

      setTitle('')
      setDescription('')
      setRequiredRole('BEGINNER')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setDurationSeconds(null)
      setVideoFilter('ALL')
      await loadVideos()
    } catch (error) {
      setIsEncoding(false)
      setEncodingProgress(0)
      const message =
        error instanceof Error
          ? error.name === 'AbortError'
            ? '인코딩 시간이 초과되었습니다. 다시 시도해주세요.'
            : error.message
          : '영상 등록에 실패했습니다.'
      setUploadMessage(message)
      alert(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteVideo = async (id: string) => {
    await deleteVideoApi(id)
    setVideos((prev) => prev.filter((video) => video.id !== id))
  }

  const handleEditVideo = (video: {
    id: string
    title: string
    description?: string
    requiredRole: CourseLevel
    durationSeconds?: number
  }) => {
    setEditingVideoId(video.id)
    setEditingTitle(video.title)
    setEditingDescription(video.description || '')
    setEditingRole(video.requiredRole)
    setEditingDurationSeconds(
      typeof video.durationSeconds === 'number' ? video.durationSeconds : null,
    )
    setPreviewUrl(null)
    setPreviewError(null)
    setIsPreviewLoading(true)
    fetchVideo(video.id)
      .then(({ video: detail }) => {
        if (detail.signedUrl) {
          setPreviewUrl(detail.signedUrl)
        } else {
          setPreviewError('영상 미리보기를 불러올 수 없습니다.')
        }
      })
      .catch(() => setPreviewError('영상 미리보기에 실패했습니다.'))
      .finally(() => setIsPreviewLoading(false))
  }

  const handleUpdateVideo = async () => {
    if (!editingVideoId) {
      return
    }

    setIsSavingEdit(true)
    try {
      await updateVideo(editingVideoId, {
        title: editingTitle.trim(),
        description: editingDescription.trim() || undefined,
        requiredRole: editingRole,
      })
      await loadVideos()
      setEditingVideoId(null)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '영상 수정에 실패했습니다.',
      )
    } finally {
      setIsSavingEdit(false)
    }
  }

  const filteredVideos = videos.filter(
    (video) => videoFilter === 'ALL' || video.requiredRole === videoFilter,
  )

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold text-gray-800">{'\uC601\uC0C1 \uB4F1\uB85D'}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC81C\uBAA9'}</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
              placeholder={'\uC601\uC0C1 \uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694.'}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">{'\uAD8C\uD55C'}</label>
            <select
              value={requiredRole}
              onChange={(event) => setRequiredRole(event.target.value as CourseLevel)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
            >
              {courseOptions.map((role) => (
                <option key={role} value={role}>
                  {courseLabels[role]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC124\uBA85'}</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC601\uC0C1 \uD30C\uC77C'}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] || null
                handleFileSelect(selected)
              }}
            />
            <div
              className="flex flex-col gap-3 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 p-4 text-center text-sm text-gray-600 transition-colors hover:border-teal-400"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const dropped = event.dataTransfer.files?.[0] || null
                if (dropped) {
                  handleFileSelect(dropped)
                }
              }}
            >
              <p className="font-semibold text-teal-700">
                {'\uD30C\uC77C\uC744 \uB4DC\uB798\uADF8\uD574\uC11C \uC62C\uB9AC\uAC70\uB098 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto rounded-lg border-2 border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 hover:cursor-pointer"
              >
                {'\uD30C\uC77C \uC120\uD0DD'}
              </button>
              <span className="text-xs text-gray-500">
                {file ? file.name : '\uD30C\uC77C\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.'}
              </span>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC7AC\uC0DD\uC2DC\uAC04(\uCD08)'}</label>
            <input
              type="number"
              min="0"
              value={durationSeconds ?? ''}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2 text-gray-500"
              placeholder={'\uC790\uB3D9\uC73C\uB85C \uC124\uC815\uB429\uB2C8\uB2E4.'}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!title || !file || isUploading}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2 font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {isUploading ? '\uC5C5\uB85C\uB4DC \uC911...' : '\uC601\uC0C1 \uB4F1\uB85D'}
        </button>

        {isUploading || uploadProgress > 0 || uploadMessage || isEncoding ? (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-teal-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-orange-400 transition-all"
                style={{ width: `${isEncoding ? encodingProgress : 0}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {isUploading
                ? `업로드 중... ${uploadProgress}%`
                : isEncoding
                  ? `인코딩 중... ${encodingProgress}%`
                  : uploadMessage}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold text-gray-800">{'\uB4F1\uB85D\uB41C \uC601\uC0C1'}</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['ALL', ...courseOptions] as Array<CourseLevel | 'ALL'>).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setVideoFilter(role)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                videoFilter === role
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } hover:cursor-pointer`}
            >
              {role === 'ALL' ? '\uC804\uCCB4' : courseLabels[role]}
            </button>
          ))}
        </div>
        {filteredVideos.length === 0 ? (
          <p className="text-sm text-gray-500">{'\uB4F1\uB85D\uB41C \uC601\uC0C1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.'}</p>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-gray-800">{video.title}</p>
                  <p className="text-sm text-gray-500">{courseLabels[video.requiredRole]}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditVideo(video)}
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-bold text-white hover:cursor-pointer"
                  >
                    {'\uD3B8\uC9D1'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('\uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) {
                        void handleDeleteVideo(video.id)
                      }
                    }}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:cursor-pointer"
                  >
                    {'\uC0AD\uC81C'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditingVideoId(null)
            }
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{'\uAC15\uC758 \uC815\uBCF4 \uC218\uC815'}</h3>
              <button
                type="button"
                onClick={() => setEditingVideoId(null)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                aria-label={'\uB2EB\uAE30'}
              >
                <XCircle size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC81C\uBAA9'}</label>
                <input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">{'\uAD8C\uD55C'}</label>
                <select
                  value={editingRole}
                  onChange={(event) => setEditingRole(event.target.value as CourseLevel)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                >
                  {courseOptions.map((role) => (
                    <option key={role} value={role}>
                      {courseLabels[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC124\uBA85'}</label>
                <textarea
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">{'\uC7AC\uC0DD\uC2DC\uAC04(\uCD08)'}</label>
                <input
                  type="number"
                  min="0"
                  value={editingDurationSeconds ?? ''}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2 text-gray-500"
                  placeholder={'\uC790\uB3D9\uC73C\uB85C \uC124\uC815\uB429\uB2C8\uB2E4.'}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  {'\uC601\uC0C1 \uBBF8\uB9AC\uBCF4\uAE30'}
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  {isPreviewLoading ? (
                    <p className="text-sm text-gray-500">
                      {'\uBBF8\uB9AC\uBCF4\uAE30\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...'}
                    </p>
                  ) : previewUrl ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full rounded-md bg-black"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {previewError || '\uBBF8\uB9AC\uBCF4\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingVideoId(null)
                  setPreviewUrl(null)
                  setPreviewError(null)
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:cursor-pointer"
              >
                {'\uCDE8\uC18C'}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleUpdateVideo()
                }}
                disabled={isSavingEdit || !editingTitle}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 hover:cursor-pointer"
              >
                {isSavingEdit ? '\uC800\uC7A5 \uC911...' : '\uC800\uC7A5'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PostManagement() {
  type PostCategory = 'NOTICE' | 'ACTIVITY'

  const categoryLabels: Record<PostCategory, string> = {
    NOTICE: '공지사항',
    ACTIVITY: '커뮤니티 활동',
  }

  const [posts, setPosts] = useState<
    Array<{
      id: string
      title: string
      content?: string
      category: PostCategory
      isPublished: boolean
      isPinned: boolean
      views: number
      publishedAt: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PostCategory>('NOTICE')
  const [isPinned, setIsPinned] = useState(false)
  const contentEditorRef = useRef<HTMLDivElement | null>(null)
  const contentImageInputRef = useRef<HTMLInputElement | null>(null)
  const contentHtmlRef = useRef('')
  const selectionRangeRef = useRef<Range | null>(null)
  const [activeModal, setActiveModal] = useState<{
    type: 'link' | 'table'
    mode: 'create' | 'edit'
  } | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingCategory, setEditingCategory] = useState<PostCategory>('NOTICE')
  const [editingPinned, setEditingPinned] = useState(false)
  
  const editingEditorRef = useRef<HTMLDivElement | null>(null)
  const editingImageInputRef = useRef<HTMLInputElement | null>(null)
  const editingHtmlRef = useRef('')
  const [tableRows, setTableRows] = useState('3')
  const [tableCols, setTableCols] = useState('3')

  const loadPosts = () => {
    setIsLoading(true)
    fetchAdminPosts()
      .then(({ posts: postList }) => {
        setPosts(
          postList.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category as PostCategory,
            isPublished: post.isPublished,
            isPinned: Boolean(post.isPinned),
            views: post.views ?? 0,
            publishedAt: post.publishedAt,
          })),
        )
      })
      .catch(() => {
        setPosts([])
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleCreate = async () => {
    const html = contentEditorRef.current?.innerHTML?.trim() || contentHtmlRef.current.trim()
    const formatted = html || undefined
    await createPost({
      title: title.trim(),
      content: formatted,
      category,
      isPinned,
    })
    setTitle('')
    setCategory('NOTICE')
    setIsPinned(false)
    contentHtmlRef.current = ''
    if (contentEditorRef.current) {
      contentEditorRef.current.innerHTML = ''
    }
    loadPosts()
  }

  const handleEdit = (post: {
    id: string
    title: string
    content?: string
    category: PostCategory
    isPinned: boolean
  }) => {
    setEditingPostId(post.id)
    setEditingTitle(post.title)
    setEditingCategory(post.category)
    setEditingPinned(Boolean(post.isPinned))
    editingHtmlRef.current = post.content || ''
  }

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId)
    loadPosts()
  }

  const handleUpdate = async () => {
    if (!editingPostId) {
      return
    }
    const html = editingEditorRef.current?.innerHTML?.trim() || editingHtmlRef.current.trim()
    await updatePost(editingPostId, {
      title: editingTitle.trim(),
      content: html || undefined,
      category: editingCategory,
      isPinned: editingPinned,
    })
    setEditingPostId(null)
    loadPosts()
  }

  useEffect(() => {
    if (!editingPostId || !editingEditorRef.current) {
      return
    }
    editingEditorRef.current.innerHTML = editingHtmlRef.current || ''
  }, [editingPostId])

  const formatPlainTextToHtml = (raw: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (!lines.length) {
      return ''
    }

    const blocks: string[] = []
    const datePattern = /\d{4}\s*년?\s*\d{1,2}\s*월?\s*\d{1,2}/

    const pushParagraph = (text: string) => {
      blocks.push(`<p>${text}</p>`)
    }

    const parseScheduleTable = (tableLines: string[]) => {
      const headerLabels = ['날짜', '시간', '발표자', '참관자', '인정학회']
      const headerIndex = tableLines.findIndex((line) => headerLabels.includes(line))

      if (headerIndex === -1) {
        tableLines.forEach((line) => pushParagraph(line))
        return
      }

      const header = tableLines.slice(headerIndex, headerIndex + headerLabels.length)
      const dataLines = tableLines.slice(headerIndex + header.length)
      const rows: string[][] = []
      let current: string[] | null = null

      dataLines.forEach((line) => {
        if (datePattern.test(line)) {
          if (current) {
            rows.push(current)
          }
          current = [line]
          return
        }

        if (!current) {
          current = [line]
          return
        }

        current.push(line)
      })

      if (current) {
        rows.push(current)
      }

      const rowHtml = rows
        .map((row) => {
          const cells = Array.from({ length: header.length }, () => '')
          row.forEach((value, index) => {
            if (index < cells.length) {
              cells[index] = value
            } else {
              cells[cells.length - 1] += `<br>${value}`
            }
          })
          return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
        })
        .join('')

      blocks.push(
        `<table><thead><tr>${header
          .map((cell) => `<th>${cell}</th>`)
          .join('')}</tr></thead><tbody>${rowHtml}</tbody></table>`,
      )
    }

    let index = 0
    while (index < lines.length) {
      const line = lines[index]

      if (line.startsWith('[') && line.endsWith(']')) {
        blocks.push(
          `<h3 style="text-align:center;">${line.replace(/^\[|\]$/g, '')}</h3>`,
        )
        index += 1
        continue
      }

      if (line.startsWith('(') && line.endsWith(')')) {
        blocks.push(`<p style="text-align:center;">${line}</p>`)
        index += 1
        continue
      }

      if (
        line.startsWith('*일정') ||
        line.startsWith('*일 정') ||
        line.startsWith('▲일정') ||
        line.startsWith('▲일 정')
      ) {
        blocks.push(`<h3>${line.replace(/^[*▲\s]+/, '')}</h3>`)
        index += 1
        const tableLines: string[] = []
        while (index < lines.length) {
          const nextLine = lines[index]
          if (nextLine.startsWith('*') || nextLine.startsWith('▲')) {
            break
          }
          tableLines.push(nextLine)
          index += 1
        }
        if (tableLines.length) {
          parseScheduleTable(tableLines)
        }
        continue
      }

      if (line.startsWith('*') || line.startsWith('▲')) {
        blocks.push(`<h3>${line.replace(/^[*▲\s]+/, '')}</h3>`)
        index += 1
        continue
      }

      if (line.startsWith('-')) {
        const items: string[] = []
        while (index < lines.length && lines[index].startsWith('-')) {
          items.push(lines[index].replace(/^-\s*/, ''))
          index += 1
        }
        blocks.push(
          `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`,
        )
        continue
      }

      pushParagraph(line)
      index += 1
    }

    return blocks.join('')
  }

  const applyAutoFormat = (mode: 'create' | 'edit') => {
    const editorRef = mode === 'create' ? contentEditorRef : editingEditorRef
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    const target = editorRef.current
    if (!target) {
      return
    }
    const rawText = target.innerText || ''
    const formatted = formatPlainTextToHtml(rawText)
    target.innerHTML = formatted || rawText
    htmlRef.current = target.innerHTML
  }

  const applyCommand = (command: string, value?: string) => {
    const target = contentEditorRef.current
    if (!target) {
      return
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(command, false, value)
    contentHtmlRef.current = target.innerHTML
  }

  const applyEditCommand = (command: string, value?: string) => {
    const target = editingEditorRef.current
    if (!target) {
      return
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(command, false, value)
    editingHtmlRef.current = target.innerHTML
  }

  const applyFontFamily = (mode: 'create' | 'edit', value: string) => {
    const target = mode === 'create' ? contentEditorRef.current : editingEditorRef.current
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    if (!target) {
      return
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('fontName', false, value)
    htmlRef.current = target.innerHTML
  }

  const applyFontSize = (mode: 'create' | 'edit', size: string) => {
    const target = mode === 'create' ? contentEditorRef.current : editingEditorRef.current
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    if (!target) {
      return
    }
    const sizeMap: Record<string, string> = {
      '12': '2',
      '14': '3',
      '16': '4',
      '18': '5',
      '20': '5',
      '24': '6',
      '28': '7',
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('fontSize', false, sizeMap[size] ?? '3')
    htmlRef.current = target.innerHTML
  }

  const applyTextColor = (mode: 'create' | 'edit', color: string) => {
    const target = mode === 'create' ? contentEditorRef.current : editingEditorRef.current
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    if (!target) {
      return
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('foreColor', false, color)
    htmlRef.current = target.innerHTML
  }

  const applyHighlight = (mode: 'create' | 'edit', color: string) => {
    const target = mode === 'create' ? contentEditorRef.current : editingEditorRef.current
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    if (!target) {
      return
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('hiliteColor', false, color)
    htmlRef.current = target.innerHTML
  }

  const applyAlignment = (mode: 'create' | 'edit', command: string) => {
    if (mode === 'create') {
      applyCommand(command)
      return
    }
    applyEditCommand(command)
  }

  const toggleBlockquote = (mode: 'create' | 'edit') => {
    const editorRef = mode === 'create' ? contentEditorRef : editingEditorRef
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    const target = editorRef.current
    if (!target) {
      return
    }
    target.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('formatBlock', false, 'blockquote')
    htmlRef.current = target.innerHTML
  }

  const insertChecklist = (mode: 'create' | 'edit') => {
    const editorRef = mode === 'create' ? contentEditorRef : editingEditorRef
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    insertBlock(
      editorRef,
      '<ul><li data-block-id="__BLOCK_ID__" data-placeholder="체크 항목"></li></ul><p><br></p>',
      htmlRef,
    )
  }

  const applyCellBackground = (mode: 'create' | 'edit', color: string) => {
    const editorRef = mode === 'create' ? contentEditorRef : editingEditorRef
    const htmlRef = mode === 'create' ? contentHtmlRef : editingHtmlRef
    const target = editorRef.current
    if (!target) {
      return
    }
    const selection = window.getSelection()
    const node =
      selection?.anchorNode?.nodeType === 1
        ? (selection.anchorNode as HTMLElement)
        : selection?.anchorNode?.parentElement
    const cell = node?.closest('td, th')
    if (cell) {
      cell.setAttribute('style', `${cell.getAttribute('style') || ''}; background-color: ${color};`)
      htmlRef.current = target.innerHTML
    }
  }

  const renderRibbon = (mode: 'create' | 'edit') => {
    const applyCmd = mode === 'create' ? applyCommand : applyEditCommand
    return (
      <div className="mb-3 space-y-2 rounded-2xl border border-gray-100 bg-gray-50/80 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">글꼴</span>
            <select
              onChange={(event) => applyFontFamily(mode, event.target.value)}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
              defaultValue="맑은 고딕"
            >
              <option value="맑은 고딕">맑은 고딕</option>
              <option value="나눔고딕">나눔고딕</option>
              <option value="굴림">굴림</option>
              <option value="바탕">바탕</option>
            </select>
            <select
              onChange={(event) => applyFontSize(mode, event.target.value)}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
              defaultValue="16"
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="28">28</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">서식</span>
            <button
              type="button"
              onClick={() => applyCmd('bold')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              굵게
            </button>
            <button
              type="button"
              onClick={() => applyCmd('italic')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              기울임            </button>
            <button
              type="button"
              onClick={() => applyCmd('underline')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              밑줄
            </button>
            <button
              type="button"
              onClick={() =>
                insertBlock(
                  mode === 'create' ? contentEditorRef : editingEditorRef,
                  '<h2 data-block-id="__BLOCK_ID__" data-placeholder="제목"></h2><p><br></p>',
                  mode === 'create' ? contentHtmlRef : editingHtmlRef,
                )
              }
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              제목
            </button>
            <button
              type="button"
              onClick={() =>
                insertBlock(
                  mode === 'create' ? contentEditorRef : editingEditorRef,
                  '<h3 data-block-id="__BLOCK_ID__" data-placeholder="소제목"></h3><p><br></p>',
                  mode === 'create' ? contentHtmlRef : editingHtmlRef,
                )
              }
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              소제목            </button>
            <button
              type="button"
              onClick={() => toggleBlockquote(mode)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              인용문            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">색상</span>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              글자              <input
                type="color"
                onChange={(event) => applyTextColor(mode, event.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-gray-200"
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              배경
              <input
                type="color"
                onChange={(event) => applyHighlight(mode, event.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-gray-200"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">정렬</span>
            <button
              type="button"
              onClick={() => applyAlignment(mode, 'justifyLeft')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              좌            </button>
            <button
              type="button"
              onClick={() => applyAlignment(mode, 'justifyCenter')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              가운데
            </button>
            <button
              type="button"
              onClick={() => applyAlignment(mode, 'justifyRight')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              우
            </button>
            <button
              type="button"
              onClick={() => applyAlignment(mode, 'justifyFull')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              양쪽
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">들여쓰기</span>
            <button
              type="button"
              onClick={() => applyCmd('indent')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              들여쓰기
            </button>
            <button
              type="button"
              onClick={() => applyCmd('outdent')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              내어쓰기
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">목록</span>
            <button
              type="button"
              onClick={() =>
                insertBlock(
                  mode === 'create' ? contentEditorRef : editingEditorRef,
                  '<ul><li data-block-id="__BLOCK_ID__" data-placeholder="목록 항목"></li></ul><p><br></p>',
                  mode === 'create' ? contentHtmlRef : editingHtmlRef,
                )
              }
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              목록
            </button>
            <button
              type="button"
              onClick={() =>
                insertBlock(
                  mode === 'create' ? contentEditorRef : editingEditorRef,
                  '<ol><li data-block-id="__BLOCK_ID__" data-placeholder="목록 항목"></li></ol><p><br></p>',
                  mode === 'create' ? contentHtmlRef : editingHtmlRef,
                )
              }
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              번호 목록
            </button>
            <button
              type="button"
              onClick={() => insertChecklist(mode)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              체크리스트            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-500">삽입</span>
            <button
              type="button"
              onClick={() => openLinkModal(mode)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              링크
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode === 'create') {
                  contentImageInputRef.current?.click()
                } else {
                  editingImageInputRef.current?.click()
                }
              }}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              이미지
            </button>
            <button
              type="button"
              onClick={() => openTableModal(mode)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              표
            </button>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              표 배경
              <input
                type="color"
                onChange={(event) => applyCellBackground(mode, event.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-gray-200"
              />
            </label>
            <button
              type="button"
              onClick={() => applyCmd('insertHorizontalRule')}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              구분선            </button>
            <button
              type="button"
              onClick={() => applyAutoFormat(mode)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              자동 정리
            </button>
          </div>
        </div>
      </div>
    )
  }

  const insertBlock = (
    editorRef: React.RefObject<HTMLDivElement | null>,
    html: string,
    htmlRef: React.MutableRefObject<string>,
  ) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    const blockId = `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const htmlWithId = html.replace(/__BLOCK_ID__/g, blockId)

    editor.focus()
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      const wrapper = document.createElement('div')
      wrapper.innerHTML = htmlWithId
      const fragment = document.createDocumentFragment()
      let node: ChildNode | null = null
      let lastNode: ChildNode | null = null
      while ((node = wrapper.firstChild)) {
        lastNode = node
        fragment.appendChild(node)
      }
      range.insertNode(fragment)
      if (lastNode) {
        const newRange = document.createRange()
        newRange.setStartAfter(lastNode)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    } else {
      editor.insertAdjacentHTML('beforeend', htmlWithId)
    }

    const target = editor.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)
    if (target) {
      const range = document.createRange()
      range.selectNodeContents(target)
      const nextSelection = window.getSelection()
      nextSelection?.removeAllRanges()
      nextSelection?.addRange(range)
    }

    htmlRef.current = editor.innerHTML
  }

  const insertTable = (
    editorRef: React.RefObject<HTMLDivElement | null>,
    htmlRef: React.MutableRefObject<string>,
    rows: number,
    cols: number,
  ) => {
    if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows <= 0 || cols <= 0) {
      return
    }
    const clampedRows = Math.min(Math.floor(rows), 20)
    const clampedCols = Math.min(Math.floor(cols), 10)
    const headerCells = Array.from({ length: clampedCols }, () => '<th>항목</th>').join('')
    const bodyRows = Array.from({ length: clampedRows }, (_row, rowIndex) => {
      return `<tr>${Array.from({ length: clampedCols }, (_col, colIndex) => {
        const cellAttrs =
          rowIndex === 0 && colIndex === 0
            ? ' data-block-id="__BLOCK_ID__" data-placeholder="내용"'
            : ' data-placeholder="내용"'
        return `<td${cellAttrs}></td>`
      }).join('')}</tr>`
    }).join('')
    const tableHtml = `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
    insertBlock(editorRef, tableHtml, htmlRef)
  }

  const storeSelection = (mode: 'create' | 'edit') => {
    const editor =
      mode === 'create' ? contentEditorRef.current : editingEditorRef.current
    if (!editor) {
      selectionRangeRef.current = null
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      selectionRangeRef.current = null
      return
    }
    const range = selection.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer)) {
      selectionRangeRef.current = null
      return
    }
    selectionRangeRef.current = range.cloneRange()
  }

  const restoreSelection = (editor: HTMLDivElement | null) => {
    if (!editor) {
      return
    }
    editor.focus()
    if (!selectionRangeRef.current) {
      return
    }
    const selection = window.getSelection()
    if (!selection) {
      return
    }
    selection.removeAllRanges()
    selection.addRange(selectionRangeRef.current)
  }

  const openLinkModal = (mode: 'create' | 'edit') => {
    storeSelection(mode)
    setLinkUrl('')
    setActiveModal({ type: 'link', mode })
  }

  const openTableModal = (mode: 'create' | 'edit') => {
    storeSelection(mode)
    setTableRows('3')
    setTableCols('3')
    setActiveModal({ type: 'table', mode })
  }

  const handleLinkSubmit = () => {
    if (!activeModal || activeModal.type !== 'link') {
      return
    }
    const url = linkUrl.trim()
    if (!url) {
      return
    }
    const editorRef = activeModal.mode === 'create' ? contentEditorRef : editingEditorRef
    const htmlRef = activeModal.mode === 'create' ? contentHtmlRef : editingHtmlRef
    restoreSelection(editorRef.current)
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      document.execCommand('createLink', false, url)
      htmlRef.current = editorRef.current?.innerHTML || ''
    } else {
      insertBlock(
        editorRef,
        `<p><a href="${url}" target="_blank" rel="noopener noreferrer" data-block-id="__BLOCK_ID__" data-placeholder="링크 텍스트"></a></p>`,
        htmlRef,
      )
    }
    setActiveModal(null)
    selectionRangeRef.current = null
  }

  const handleTableSubmit = () => {
    if (!activeModal || activeModal.type !== 'table') {
      return
    }
    const rows = Number(tableRows)
    const cols = Number(tableCols)
    if (!Number.isFinite(rows) || !Number.isFinite(cols)) {
      return
    }
    const editorRef = activeModal.mode === 'create' ? contentEditorRef : editingEditorRef
    const htmlRef = activeModal.mode === 'create' ? contentHtmlRef : editingHtmlRef
    restoreSelection(editorRef.current)
    insertTable(editorRef, htmlRef, rows, cols)
    setActiveModal(null)
    selectionRangeRef.current = null
  }

  const sanitizeFileName = (name: string) =>
    name.replace(/[^a-zA-Z0-9._-]/g, '-')

  const handleImageUpload = async (file: File, onInsert: (url: string) => void) => {
    const filePath = `posts/${Date.now()}-${sanitizeFileName(file.name)}`
    let uploadUrl: string
    let publicUrl: string

    try {
      const response = await createPostImageUploadUrl(filePath)
      uploadUrl = response.uploadUrl
      publicUrl = response.publicUrl
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '이미지 업로드 URL을 만들지 못했습니다.'
      throw new Error(message)
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      let details = ''
      try {
        details = await uploadResponse.text()
      } catch {
        details = ''
      }
      const suffix = details ? ` (${details})` : ''
      throw new Error(`이미지 업로드에 실패했습니다.${suffix}`)
    }

    onInsert(publicUrl)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold text-gray-800">게시글 등록</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              제목
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
              placeholder="게시글 제목을 입력하세요."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              카테고리
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as PostCategory)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
            >
              <option value="NOTICE">공지사항</option>
              <option value="ACTIVITY">커뮤니티 활동</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              내용
            </label>
            {renderRibbon('create')}
            {/*
            <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-gray-50/80 p-2">
              <button
                type="button"
                onClick={() => applyCommand('bold')}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                굵게
              </button>
              <button
                type="button"
                onClick={() => applyCommand('italic')}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                기울임
              </button>
              <button
                type="button"
                onClick={() => applyCommand('underline')}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                밑줄
              </button>
              <button
                type="button"
                onClick={() =>
                  insertBlock(
                    contentEditorRef,
                    '<h2 data-block-id="__BLOCK_ID__" data-placeholder="제목"></h2><p><br></p>',
                    contentHtmlRef,
                  )
                }
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                제목
              </button>
              <button
                type="button"
                onClick={() =>
                  insertBlock(
                    contentEditorRef,
                    '<h3 data-block-id="__BLOCK_ID__" data-placeholder="소제목"</h3><p><br></p>',
                    contentHtmlRef,
                  )
                }
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                소제목
              </button>
              <button
                type="button"
                onClick={() =>
                  insertBlock(
                    contentEditorRef,
                    '<ul><li data-block-id="__BLOCK_ID__" data-placeholder="목록 항목"></li></ul><p><br></p>',
                    contentHtmlRef,
                  )
                }
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                목록
              </button>
              <button
                type="button"
                onClick={() =>
                  insertBlock(
                    contentEditorRef,
                    '<ol><li data-block-id="__BLOCK_ID__" data-placeholder="목록 항목"></li></ol><p><br></p>',
                    contentHtmlRef,
                  )
                }
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                번호 목록
              </button>
              <button
                type="button"
                onClick={() => openLinkModal('create')}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                링크
              </button>
              <button
                type="button"
                onClick={() => {
                  if (contentImageInputRef.current) {
                    contentImageInputRef.current.value = ''
                    contentImageInputRef.current.click()
                  }
                }}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                이미지
              </button>
                <button
                  type="button"
                  onClick={() => openTableModal('create')}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                >
                  표
                </button>
                <button
                  type="button"
                  onClick={() => applyAutoFormat('create')}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                >
                  자동 정리
                </button>
                <button
                  type="button"
                  onClick={() => applyCommand('insertHorizontalRule')}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                >
                  구분선
                </button>
            */}
            <div
              ref={contentEditorRef}
              contentEditable
              onInput={(event) => {
                contentHtmlRef.current = event.currentTarget.innerHTML
              }}
              className="editor-surface min-h-[420px] w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none"
              suppressContentEditableWarning
              lang="ko"
            />
            <input
              ref={contentImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }
                try {
                  await handleImageUpload(file, (url) => {
                    applyCommand('insertImage', url)
                  })
                } catch (error) {
                  alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">상단 고정</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={!title.trim()}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2 font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          게시글 등록
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold text-gray-800">게시글 목록</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 게시글이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`flex flex-col gap-3 border border-gray-200 p-4 md:flex-row md:items-center md:justify-between ${
                  post.isPinned ? 'bg-amber-50/60' : ''
                }`}
              >
                <div>
                  <p className="font-bold text-gray-800">{post.title}</p>
                  <p className="text-sm text-gray-500">
                    {categoryLabels[post.category]}  ·  {post.publishedAt.slice(0, 10)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-bold text-white hover:cursor-pointer"
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('삭제하시겠습니까?')) {
                        void handleDeletePost(post.id)
                      }
                    }}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingPostId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditingPostId(null)
            }
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">게시글 수정</h3>
              <button
                type="button"
                onClick={() => setEditingPostId(null)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="?リ린"
              >
                <XCircle size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  제목
                </label>
                <input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  카테고리
                </label>
                <select
                  value={editingCategory}
                  onChange={(event) =>
                    setEditingCategory(event.target.value as PostCategory)
                  }
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                >
                  <option value="NOTICE">공지사항</option>
                  <option value="ACTIVITY">커뮤니티 활동</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  내용
                </label>
                {renderRibbon('edit')}
                {/*
                <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-gray-50/80 p-2">
                  <button
                    type="button"
                    onClick={() => applyEditCommand('bold')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    굵게
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEditCommand('italic')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    기울임
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEditCommand('underline')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    밑줄
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertBlock(
                        editingEditorRef,
                        '<h2 data-block-id="__BLOCK_ID__" data-placeholder="제목"></h2><p><br></p>',
                        editingHtmlRef,
                      )
                    }
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    제목
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertBlock(
                        editingEditorRef,
                        '<h3 data-block-id="__BLOCK_ID__" data-placeholder="소제목"</h3><p><br></p>',
                        editingHtmlRef,
                      )
                    }
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    소제목
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertBlock(
                        editingEditorRef,
                        '<ul><li data-block-id="__BLOCK_ID__" data-placeholder="목록 항목"></li></ul><p><br></p>',
                        editingHtmlRef,
                      )
                    }
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    목록
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertBlock(
                        editingEditorRef,
                        '<ol><li data-block-id="__BLOCK_ID__" data-placeholder="목록 항목"></li></ol><p><br></p>',
                        editingHtmlRef,
                      )
                    }
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    번호 목록
                  </button>
                  <button
                    type="button"
                    onClick={() => openLinkModal('edit')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    링크
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingImageInputRef.current) {
                        editingImageInputRef.current.value = ''
                        editingImageInputRef.current.click()
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    이미지
                  </button>
                  <button
                    type="button"
                    onClick={() => openTableModal('edit')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    표
                  </button>
                  <button
                    type="button"
                    onClick={() => applyAutoFormat('edit')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    자동 정리
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEditCommand('insertHorizontalRule')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    구분선
                  </button>
                */}
                <div
                  ref={editingEditorRef}
                  contentEditable
                  onInput={(event) => {
                    editingHtmlRef.current = event.currentTarget.innerHTML
                  }}
                  className="editor-surface min-h-[420px] w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none"
                  suppressContentEditableWarning
                  lang="ko"
                />
                <input
                  ref={editingImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) {
                      return
                    }
                    try {
                      await handleImageUpload(file, (url) => {
                        applyEditCommand('insertImage', url)
                      })
                    } catch (error) {
                      alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPinned}
                  onChange={(event) => setEditingPinned(event.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">상단 고정</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPostId(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleUpdate()}
                disabled={!editingTitle.trim()}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                ???
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveModal(null)
              selectionRangeRef.current = null
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800">
                {activeModal.type === 'link' ? '링크 추가' : '표 만들기'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  selectionRangeRef.current = null
                }}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="?リ린"
              >
                <XCircle size={18} />
              </button>
            </div>
            {activeModal.type === 'link' ? (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  링크 주소
                </label>
                <input
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://"
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    행 개수
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(event) => setTableRows(event.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    열 개수
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(event) => setTableCols(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  selectionRangeRef.current = null
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeModal.type === 'link') {
                    handleLinkSubmit()
                  } else {
                    handleTableSubmit()
                  }
                }}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
