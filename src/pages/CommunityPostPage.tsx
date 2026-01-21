import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { fetchPost } from '../lib/api'

type PostCategory = 'NOTICE' | 'ACTIVITY'

const menuItems = [
  { label: '공지사항', value: '공지사항' },
  { label: '커뮤니티 활동', value: '커뮤니티 활동' },
  { label: '열린마당', value: '열린마당' },
  { label: 'Q & A / FAQ', value: 'Q & A / FAQ' },
  { label: 'SOCIONET 연구모임', value: 'SOCIONET 연구모임' },
  { label: '일반상담 연구모임', value: '일반상담 연구모임' },
]

const subPageRoutes = {
  공지사항: '/community/notice',
  '커뮤니티 활동': '/community/activity',
  열린마당: '/community/open',
  'Q & A / FAQ': '/community/faq',
  'SOCIONET 연구모임': '/community/socionet-study',
  '일반상담 연구모임': '/community/counseling-study',
}

export default function CommunityPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const didLoadRef = useRef<string | null>(null)
  const [post, setPost] = useState<{
    id: string
    title: string
    content?: string
    category: PostCategory
    publishedAt: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }
    const storageKey = `socionet_post_view_${id}`
    const lastViewed = sessionStorage.getItem(storageKey)
    const now = Date.now()
    const recentlyViewed = lastViewed && now - Number(lastViewed) < 3000
    if (didLoadRef.current === id && recentlyViewed) {
      return
    }
    didLoadRef.current = id
    sessionStorage.setItem(storageKey, String(now))
    setIsLoading(true)
    fetchPost(id, !recentlyViewed)
      .then(({ post: fetched }) => {
        setPost(fetched)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const renderContent = (value?: string) => {
    if (!value) {
      return '<p>내용이 없습니다.</p>'
    }
    if (value.includes('<')) {
      return value
    }
    return value.replace(/\n/g, '<br />')
  }

  const currentSubPage =
    post?.category === 'ACTIVITY' ? '커뮤니티 활동' : '공지사항'

  return (
    <PageLayout
      title="커뮤니티"
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={() => {}}
      bannerImage="banner"
      subPageRoutes={subPageRoutes}
    >
      <div className="max-w-4xl">
        <button
          type="button"
          onClick={() => {
            const target =
              currentSubPage === '커뮤니티 활동'
                ? subPageRoutes['커뮤니티 활동']
                : subPageRoutes.공지사항
            navigate(target)
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 hover:cursor-pointer"
        >
          ← 목록으로
        </button>

        {isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : post ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {post.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{post.publishedAt.slice(0, 10)}</span>
                <span>조회 {post.views ?? 0}</span>
              </div>
            </div>
            <div
              className="editor-surface text-gray-700"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">게시글을 찾을 수 없습니다.</p>
        )}
      </div>
    </PageLayout>
  )
}
