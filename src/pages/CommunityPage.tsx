import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { fetchPosts } from '../lib/api'

interface CommunityPageProps {
  subPage?: string
}

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

const placeholderText = `2차수정때 내용 채워넣을 예정입니다`

export default function CommunityPage({ subPage }: CommunityPageProps) {
  const navigate = useNavigate()
  const [currentSubPage, setCurrentSubPage] = useState(subPage || '공지사항')
  const [posts, setPosts] = useState<
    Array<{ id: string; title: string; publishedAt: string; views?: number; isPinned?: boolean }>
  >([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  useEffect(() => {
    const isPostList =
      currentSubPage === '공지사항' || currentSubPage === '커뮤니티 활동'
    if (!isPostList) {
      setPosts([])
      return
    }

    const category = currentSubPage === '커뮤니티 활동' ? 'ACTIVITY' : 'NOTICE'
    setIsLoading(true)
    fetchPosts(category)
      .then(({ posts: list }) => {
        setPosts(list)
      })
      .finally(() => setIsLoading(false))
  }, [currentSubPage])

  const rows = useMemo(
    () =>
      posts.map((post, index) => ({
        ...post,
        number: posts.length - index,
      })),
    [posts],
  )

  const isPostList =
    currentSubPage === '공지사항' || currentSubPage === '커뮤니티 활동'

  return (
    <PageLayout
      title="커뮤니티"
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={setCurrentSubPage}
      bannerImage="banner"
      subPageRoutes={subPageRoutes}
    >
      {isPostList ? (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentSubPage}
            </h1>
            <p className="mt-2 text-sm text-gray-500">Total {posts.length}건</p>
          </div>

          <div className="border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">번호</th>
                  <th className="px-4 py-3 font-semibold">제목</th>
                  <th className="px-4 py-3 font-semibold">날짜</th>
                  <th className="px-4 py-3 font-semibold">조회</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={4}
                    >
                      불러오는 중...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={4}
                    >
                      등록된 게시글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((post) => (
                    <tr
                      key={post.id}
                      onClick={() => navigate(`/community/posts/${post.id}`)}
                      className={`border-t border-gray-100 hover:bg-gray-50 hover:cursor-pointer ${
                        post.isPinned ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {post.isPinned ? (
                          <span className="rounded bg-amber-200 px-2 py-1 text-xs font-bold text-amber-800">
                            공지
                          </span>
                        ) : (
                          post.number
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {post.title}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {post.publishedAt.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {post.views ?? 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl">
          <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
            {currentSubPage}
          </h1>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
            {placeholderText}
          </p>
        </div>
      )}
    </PageLayout>
  )
}
