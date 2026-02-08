import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { fetchPost, fetchPosts } from '../lib/api'

type PostCategory = 'NOTICE' | 'ACTIVITY'

const communityMenuItems = [
  { label: '커뮤니티 활동', value: '커뮤니티 활동' },
  { label: 'SOCIONET 연구모임', value: 'SOCIONET 연구모임' },
  { label: '일반상담 연구모임', value: '일반상담 연구모임' },
]

const communityRoutes = {
  '커뮤니티 활동': '/community/activity',
  'SOCIONET 연구모임': '/community/socionet-study',
  '일반상담 연구모임': '/community/counseling-study',
}

const newsMenuItems = [{ label: '공지사항', value: '공지사항' }]
const newsRoutes = { 공지사항: '/news/notice' }

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
    views?: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prevPostId, setPrevPostId] = useState<string | null>(null)
  const [nextPostId, setNextPostId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!post) {
      return
    }
    fetchPostList(post.category)
  }, [post?.category])

  const fetchPostList = (category: PostCategory) => {
    fetchPostsByCategory(category)
      .then((list) => {
        const sorted = [...list].sort((a, b) =>
          b.publishedAt.localeCompare(a.publishedAt),
        )
        const currentIndex = sorted.findIndex((item) => item.id === id)
        setPrevPostId(
          currentIndex > 0 ? sorted[currentIndex - 1].id : null,
        )
        setNextPostId(
          currentIndex >= 0 && currentIndex < sorted.length - 1
            ? sorted[currentIndex + 1].id
            : null,
        )
      })
      .catch(() => {
        setPrevPostId(null)
        setNextPostId(null)
      })
  }

  const renderContent = (value?: string) => {
    if (!value) {
      return '<p>내용이 없습니다.</p>'
    }
    if (value.includes('<')) {
      return value
    }
    return value.replace(/\n/g, '<br />')
  }

  const isActivity = post?.category === 'ACTIVITY'
  const currentSubPage = isActivity ? '커뮤니티 활동' : '공지사항'
  const pageTitle = isActivity ? '커뮤니티' : 'SOCIONET 소식'
  const menuItems = isActivity ? communityMenuItems : newsMenuItems
  const subPageRoutes = isActivity ? communityRoutes : newsRoutes

  const publishedLabel = post?.publishedAt
    ? post.publishedAt.replace('T', ' ').slice(2, 16)
    : ''

  return (
    <PageLayout
      title={pageTitle}
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={() => {}}
      bannerImage="banner"
      subPageRoutes={subPageRoutes}
    >
      <div className="max-w-5xl space-y-4">
        <div className="border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : post ? (
          <div className="space-y-4 border-y border-gray-200 bg-white px-4 py-6 sm:px-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>작성자 안이환</span>
                <span>{publishedLabel}</span>
                <span>조회 {post.views ?? 0}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                disabled={!prevPostId}
                onClick={() => {
                  if (prevPostId) {
                    navigate(`/community/posts/${prevPostId}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className="rounded border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전글
              </button>
              <button
                type="button"
                disabled={!nextPostId}
                onClick={() => {
                  if (nextPostId) {
                    navigate(`/community/posts/${nextPostId}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className="rounded border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음글
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = isActivity
                    ? communityRoutes['커뮤니티 활동']
                    : newsRoutes.공지사항
                  navigate(target)
                }}
                className="ml-auto rounded border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50"
              >
                목록
              </button>
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
const fetchPostsByCategory = async (
  category: PostCategory,
): Promise<Array<{ id: string; publishedAt: string }>> => {
  const { posts } = await fetchPosts(category)
  return posts.map((post) => ({ id: post.id, publishedAt: post.publishedAt }))
}
