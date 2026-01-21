import { useEffect, useMemo, useRef, useState } from 'react'
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
import { AnimatePresence, motion } from 'motion/react'
import { createPost, createPostImageUploadUrl, deletePost, deleteUser as deleteUserApi, deleteVideo as deleteVideoApi, fetchAdminPosts, fetchAdminVideos, fetchMe, fetchUsers, updatePost, updateUser, updateVideo, uploadVideo } from '../lib/api'

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

interface ConfirmModalState {
  isOpen: boolean
  type: 'approve' | 'reject' | 'save' | null
  userId: string | null
  userName: string
}

const courseOptions: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'INSTRUCTOR']
const courseLabels: Record<CourseLevel, string> = {
  BEGINNER: '\ucd08\uae09',
  INTERMEDIATE: '\uc911\uae09',
  ADVANCED: '\uace0\uae09',
  INSTRUCTOR: '\uc77c\ubc18\uac15\uc0ac\uacfc\uc815',
}

const initialUsers: User[] = []

const emptyConfirmModal: ConfirmModalState = {
  isOpen: false,
  type: null,
  userId: null,
  userName: '',
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('all')
  const [confirmModal, setConfirmModal] =
    useState<ConfirmModalState>(emptyConfirmModal)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<CourseLevel | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    fetchMe()
      .then(({ user }) => {
        if (user.role !== 'ADMIN') {
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
      .then(({ users }) => {
        setUsers(
          users.map((user) => ({
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
      .finally(() => {})
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
      alert(error instanceof Error ? error.message : '권한 저장에 실패했습니다.')
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
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, users])

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            승인 대기
          </span>
        )
      case 'APPROVED':
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            승인 완료
          </span>
        )
      case 'REJECTED':
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            승인 거부
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
          <p className="text-teal-50">{'\uD68C\uC6D0 \uAD00\uB9AC \uBC0F \uAD50\uC721/\uAC8C\uC2DC\uAE00 \uAD00\uB9AC'}</p>
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
              <Users className="mr-2 inline-block" size={20} /> {'\uD68C\uC6D0 \uAD00\uB9AC'}</button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'education'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } cursor-pointer`}
              type="button"
            >
              <Video className="mr-2 inline-block" size={20} /> {'\uAD50\uC721 \uAD00\uB9AC'}</button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'posts'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } cursor-pointer`}
              type="button"
            >
              <FileText className="mr-2 inline-block" size={20} /> {'\uAC8C\uC2DC\uAE00 \uAD00\uB9AC'}</button>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="이름 또는 이메일로 검색..."
                    className="w-full rounded-lg border-2 border-gray-200 py-3 pl-10 pr-4 transition-colors focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as 'all' | UserStatus,
                      )
                    }
                    className="rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors focus:border-teal-500 focus:outline-none"
                  >
                    <option value="all">전체 상태</option>
                    <option value="PENDING">승인 대기</option>
                    <option value="APPROVED">승인 완료</option>
                    <option value="REJECTED">승인 거부</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        이름
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        이메일
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        전화번호
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        신청일
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        강의 권한
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.phone || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.appliedDate || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4">
                          {editingUserId === user.id ? (
                            <select
                              value={editingRole || user.role}
                              onChange={(event) =>
                                setEditingRole(event.target.value as CourseLevel)
                              }
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            >
                              {courseOptions.map((course) => (
                                <option key={course} value={course}>
                                  {courseLabels[course]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="rounded bg-teal-100 px-2 py-1 text-xs text-teal-700">
                              {courseLabels[user.role]}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {editingUserId === user.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      isOpen: true,
                                      type: 'save',
                                      userId: user.id,
                                      userName: user.name,
                                    })
                                  }
                                  className="rounded-lg bg-teal-600 p-2 text-white transition-colors hover:bg-teal-700"
                                  title="저장"
                                  type="button"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => { setEditingUserId(null); setEditingRole(null) }}
                                  className="rounded-lg bg-gray-400 p-2 text-white transition-colors hover:bg-gray-500"
                                  title="취소"
                                  type="button"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handleEditRole(user.id, user.role)
                                  }
                                  className="rounded-lg bg-orange-500 p-2 text-white transition-colors hover:bg-orange-600"
                                  title="권한 편집"
                                  type="button"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {user.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() =>
                                        setConfirmModal({
                                          isOpen: true,
                                          type: 'approve',
                                          userId: user.id,
                                          userName: user.name,
                                        })
                                      }
                                      className="rounded-lg bg-green-500 p-2 text-white transition-colors hover:bg-green-600"
                                      title="승인"
                                      type="button"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setConfirmModal({
                                          isOpen: true,
                                          type: 'reject',
                                          userId: user.id,
                                          userName: user.name,
                                        })
                                      }
                                      className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                                      title="거부"
                                      type="button"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm('정말 삭제하시겠습니까?')) {
                                      void handleDeleteUser(user.id)
                                    }
                                  }}
                                  className="rounded-lg bg-gray-500 p-2 text-white transition-colors hover:bg-gray-600"
                                  title="삭제"
                                  type="button"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'education' && <EducationManagement />}
        {activeTab === 'posts' && <PostManagement />}
      </div>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setConfirmModal(emptyConfirmModal)}
          >
            <motion.div
              className="w-96 rounded-lg bg-white p-6 shadow-lg"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                {confirmModal.type === 'approve'
                  ? '승인 확인'
                  : confirmModal.type === 'reject'
                    ? '거부 확인'
                    : '저장 확인'}
              </h3>
              <p className="mb-6 text-gray-600">
                {confirmModal.type === 'approve'
                  ? '회원을 승인하시겠습니까?'
                  : confirmModal.type === 'reject'
                    ? '회원을 거부하시겠습니까?'
                    : '변경 사항을 저장하시겠습니까?'}
                <br />
                <span className="font-bold">{confirmModal.userName}</span>님의
                상태를 변경합니다.
              </p>
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setConfirmModal(emptyConfirmModal)}
                  className="rounded-lg bg-gray-400 px-4 py-2 text-white transition-colors hover:bg-gray-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                >
                  취소
                </motion.button>
                <motion.button
                  onClick={async () => {
                    if (confirmModal.type === 'approve' && confirmModal.userId) {
                      await handleApprove(confirmModal.userId)
                    } else if (
                      confirmModal.type === 'reject' &&
                      confirmModal.userId
                    ) {
                      await handleReject(confirmModal.userId)
                    } else if (confirmModal.type === 'save' && confirmModal.userId) {
                      await handleSaveRole(confirmModal.userId)
                    }
                    setConfirmModal(emptyConfirmModal)
                  }}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                >
                  확인
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [isPublished, setIsPublished] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingRole, setEditingRole] = useState<CourseLevel>('BEGINNER')
  const [editingPublished, setEditingPublished] = useState(true)
  const [editingDurationSeconds, setEditingDurationSeconds] = useState<number | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [videoFilter, setVideoFilter] = useState<CourseLevel | 'ALL'>('ALL')
  const roleLabels: Record<CourseLevel, string> = {
    BEGINNER: '\ucd08\uae09',
    INTERMEDIATE: '\uc911\uae09',
    ADVANCED: '\uace0\uae09',
    INSTRUCTOR: '\uc77c\ubc18\uac15\uc0ac\uacfc\uc815',
  }

  const loadVideos = () => {
    fetchAdminVideos()
      .then(({ videos }) => {
        setVideos(
          videos.map((video) => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            requiredRole: video.requiredRole as CourseLevel,
            storagePath: video.storagePath,
            isPublished: video.isPublished,
            durationSeconds: video.durationSeconds,
          })),
        )
      })
      .catch(() => setVideos([]))
  }

  useEffect(() => {
    loadVideos()
  }, [])

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

  const handleUpload = async () => {
    if (!file) {
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('requiredRole', requiredRole)
      formData.append('isPublished', String(isPublished))

      await uploadVideo(formData)

      setTitle('')
      setDescription('')
      setRequiredRole('BEGINNER')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setIsPublished(true)
      setDurationSeconds(null)
      loadVideos()
      alert('\uc601\uc0c1 \ub4f1\ub85d\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.')
    } catch (error) {
      alert(error instanceof Error ? error.message : '?????????? ???????????????.')
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
    isPublished: boolean
    durationSeconds?: number
  }) => {
    setEditingVideoId(video.id)
    setEditingTitle(video.title)
    setEditingDescription(video.description || '')
    setEditingRole(video.requiredRole)
    setEditingPublished(video.isPublished)
    setEditingDurationSeconds(
      typeof video.durationSeconds === 'number' ? video.durationSeconds : null,
    )
  }

  const handleUpdateVideo = async () => {
    if (!editingVideoId) {
      return
    }

    setIsSavingEdit(true)
    try {
      await updateVideo(editingVideoId, {
        title: editingTitle,
        description: editingDescription,
        requiredRole: editingRole,
        isPublished: editingPublished,
        durationSeconds: editingDurationSeconds ?? undefined,
      })
      await loadVideos()
      setEditingVideoId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '강의 수정에 실패했습니다.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold text-gray-800">영상 등록</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">제목</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
              placeholder="영상 제목을 입력하세요..."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">권한</label>
            <select
              value={requiredRole}
              onChange={(event) => setRequiredRole(event.target.value as CourseLevel)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
            >
              {courseOptions.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-gray-700">설명</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
              rows={3}
            />
          </div>
                    <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-gray-700">{'\uc601\uc0c1 \ud30c\uc77c'}</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0] || null
                  setFile(selected)
                  if (selected) {
                    extractDuration(selected)
                  } else {
                    setDurationSeconds(null)
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border-2 border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 hover:cursor-pointer"
              >
                {'\ud30c\uc77c \uc120\ud0dd'}
              </button>
              <span className="text-sm text-gray-600">
                {file ? file.name : '\ud30c\uc77c\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.'}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              재생시간(초)
            </label>
            <input
              type="number"
              min="0"
              value={durationSeconds ?? ''}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (Number.isFinite(value) && value >= 0) {
                  setDurationSeconds(Math.floor(value))
                } else {
                  setDurationSeconds(null)
                }
              }}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
              placeholder="자동으로 입력됩니다."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">즉시 공개</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!title || !file || isUploading}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2 font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {isUploading ? '업로드 중...' : '영상 등록'}
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold text-gray-800">등록된 영상</h3>
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
              } cursor-pointer`}
            >
              {role === 'ALL' ? '전체' : roleLabels[role]}
            </button>
          ))}
        </div>
        {(() => {
          const filtered = videos.filter(
            (video) => videoFilter === 'ALL' || video.requiredRole === videoFilter,
          )

          if (filtered.length === 0) {
            return (
              <p className="text-sm text-gray-500">
                등록된 영상이 없습니다.
              </p>
            )
          }

          return (
            <div className="space-y-3">
              {filtered.map((video) => (
              <div
                key={video.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-gray-800">{video.title}</p>
                  <p className="text-sm text-gray-500">
                    {roleLabels[video.requiredRole]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditVideo(video)}
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-bold text-white hover:cursor-pointer"
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('삭제하시겠습니까?')) {
                        void handleDeleteVideo(video.id)
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
          )
        })()}
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
              <h3 className="text-lg font-bold text-gray-800">강의 정보 수정</h3>
              <button
                type="button"
                onClick={() => setEditingVideoId(null)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="닫기"
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
                  권한
                </label>
                <select
                  value={editingRole}
                  onChange={(event) =>
                    setEditingRole(event.target.value as CourseLevel)
                  }
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                >
                  {courseOptions.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  설명
                </label>
                <textarea
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  재생시간(초)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingDurationSeconds ?? ''}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    if (Number.isFinite(value) && value >= 0) {
                      setEditingDurationSeconds(Math.floor(value))
                    } else {
                      setEditingDurationSeconds(null)
                    }
                  }}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2"
                  placeholder="비워두면 변경하지 않습니다."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPublished}
                  onChange={(event) => setEditingPublished(event.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">즉시 공개</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingVideoId(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleUpdateVideo()
                }}
                disabled={isSavingEdit || !editingTitle}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {isSavingEdit ? '저장 중...' : '저장'}
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
  const [tableRows, setTableRows] = useState('3')
  const [tableCols, setTableCols] = useState('3')
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingCategory, setEditingCategory] = useState<PostCategory>('NOTICE')
  const [editingPinned, setEditingPinned] = useState(false)
  const editingEditorRef = useRef<HTMLDivElement | null>(null)
  const editingImageInputRef = useRef<HTMLInputElement | null>(null)
  const editingHtmlRef = useRef('')

  const loadPosts = () => {
    setIsLoading(true)
    fetchAdminPosts()
      .then(({ posts: postList }) => {
        setPosts(postList)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleCreate = async () => {
    if (!title.trim()) {
      return
    }

    const html = contentEditorRef.current?.innerHTML?.trim() || contentHtmlRef.current.trim()
    await createPost({
      title: title.trim(),
      content: html || undefined,
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
    isPublished: boolean
    isPinned?: boolean
    publishedAt: string
  }) => {
    setEditingPostId(post.id)
    setEditingTitle(post.title)
    setEditingContent(post.content || '')
    editingHtmlRef.current = post.content || ''
    setEditingCategory(post.category)
    setEditingPinned(Boolean(post.isPinned))
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
    editingEditorRef.current.innerHTML = editingContent || ''
    editingHtmlRef.current = editingContent || ''
  }, [editingPostId, editingContent])

  const applyCommand = (command: string, value?: string) => {
    const target = contentEditorRef.current
    if (!target) {
      return
    }
    target.focus()
    document.execCommand(command, false, value)
    contentHtmlRef.current = target.innerHTML
  }

  const applyEditCommand = (command: string, value?: string) => {
    const target = editingEditorRef.current
    if (!target) {
      return
    }
    target.focus()
    document.execCommand(command, false, value)
    editingHtmlRef.current = target.innerHTML
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

  const handleDelete = async (id: string) => {
    await deletePost(id)
    loadPosts()
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
                    '<h3 data-block-id="__BLOCK_ID__" data-placeholder="소제목"></h3><p><br></p>',
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
                onClick={() => applyCommand('insertHorizontalRule')}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                구분선
              </button>
            </div>
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
                    {categoryLabels[post.category]} · {post.publishedAt.slice(0, 10)}
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
                        void handleDelete(post.id)
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
                aria-label="닫기"
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
                        '<h3 data-block-id="__BLOCK_ID__" data-placeholder="소제목"></h3><p><br></p>',
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
                    onClick={() => applyEditCommand('insertHorizontalRule')}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    구분선
                  </button>
                </div>
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
                저장
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
                aria-label="닫기"
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
