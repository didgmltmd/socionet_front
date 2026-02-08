import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { fetchPosts } from '../lib/api'

interface CommunityPageProps {
  subPage?: string
}

type CommunitySubPage = '커뮤니티 활동' | 'SOCIONET 연구모임' | '일반상담 연구모임'

const menuItems = [
  { label: '커뮤니티 활동', value: '커뮤니티 활동' },
  { label: 'SOCIONET 연구모임', value: 'SOCIONET 연구모임' },
  { label: '일반상담 연구모임', value: '일반상담 연구모임' },
]

const subPageRoutes: Record<CommunitySubPage, string> = {
  '커뮤니티 활동': '/community/activity',
  'SOCIONET 연구모임': '/community/socionet-study',
  '일반상담 연구모임': '/community/counseling-study',
}

const socionetStudyText = `SOCIONET 연구모임은 SOCIONET 검사 해석, 사례 적용, 연구자료 검토 등을 중심으로 진행합니다. 연구모임의 비용은 별도로 없으며, 3명 이상 참여 시 개설됩니다. 필요에 따라 영문 자료 강독을 병행할 수 있습니다. 모임은 여름방학·겨울방학 기간에 개설하는 것을 원칙으로 하며, 야간 모임은 진행하지 않습니다. 단, SOCIONET 연구 및 사례모임은 필요에 따라 연중 수시로 개설합니다.`

const counselingStudyText = `일반상담 연구모임은 상담 사례 이해와 상담기법 학습, 상담 흐름 점검을 중심으로 진행합니다. 연구모임의 비용은 별도로 없으며, 3명 이상 참여 시 개설됩니다. 필요하면 영문 자료 강독을 함께 진행할 수 있습니다. 모임은 여름방학·겨울방학 기간에 개설하는 것을 원칙으로 하며, 야간 모임은 진행하지 않습니다.`

const contentMap: Record<CommunitySubPage, string> = {
  '커뮤니티 활동': '',
  'SOCIONET 연구모임': socionetStudyText,
  '일반상담 연구모임': counselingStudyText,
}

export default function CommunityPage({ subPage }: CommunityPageProps) {
  const navigate = useNavigate()
  const [currentSubPage, setCurrentSubPage] = useState<CommunitySubPage>(
    (subPage as CommunitySubPage) || '커뮤니티 활동',
  )
  const [posts, setPosts] = useState<
    Array<{ id: string; title: string; publishedAt: string; views?: number; isPinned?: boolean }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage as CommunitySubPage)
    }
  }, [subPage])

  useEffect(() => {
    const isPostList = currentSubPage === '커뮤니티 활동'
    if (!isPostList) {
      setPosts([])
      setSearchQuery('')
      setCurrentPage(1)
      return
    }

    setIsLoading(true)
    fetchPosts('ACTIVITY')
      .then(({ posts: list }) => {
        setPosts(list)
      })
      .finally(() => setIsLoading(false))
  }, [currentSubPage])

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return posts
    }
    return posts.filter((post) => post.title.toLowerCase().includes(query))
  }, [posts, searchQuery])

  const oldestOrderedPosts = useMemo(
    () =>
      [...filteredPosts].sort((a, b) =>
        a.publishedAt.localeCompare(b.publishedAt),
      ),
    [filteredPosts],
  )

  const pinnedPosts = useMemo(
    () => filteredPosts.filter((post) => post.isPinned),
    [filteredPosts],
  )

  const unpinnedPosts = useMemo(
    () => filteredPosts.filter((post) => !post.isPinned),
    [filteredPosts],
  )

  const newestUnpinnedPosts = useMemo(
    () =>
      [...unpinnedPosts].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      ),
    [unpinnedPosts],
  )

  const totalPages = Math.max(1, Math.ceil(newestUnpinnedPosts.length / pageSize))

  const pagedPosts = useMemo(() => {
    if (currentPage === 1) {
      const firstPageItems = newestUnpinnedPosts.slice(
        0,
        Math.max(0, pageSize - pinnedPosts.length),
      )
      return [...pinnedPosts, ...firstPageItems]
    }

    const start = (currentPage - 1) * pageSize
    return newestUnpinnedPosts.slice(start, start + pageSize)
  }, [currentPage, newestUnpinnedPosts, pinnedPosts])

  const rows = useMemo(() => {
    const indexMap = new Map(
      oldestOrderedPosts.map((post, index) => [post.id, index]),
    )
    return pagedPosts.map((post) => {
      const indexInAll = indexMap.get(post.id) ?? 0
      return {
        ...post,
        number: indexInAll + 1,
      }
    })
  }, [pagedPosts, oldestOrderedPosts])

  const isPostList = currentSubPage === '커뮤니티 활동'

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
            <h1 className="text-2xl font-bold text-gray-900">{currentSubPage}</h1>
            <p className="mt-2 text-sm text-gray-500">Total {filteredPosts.length}건</p>
          </div>

          <div className="overflow-hidden rounded-none border-y border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="w-20 px-4 py-3 font-semibold">번호</th>
                  <th className="px-4 py-3 text-center font-semibold">제목</th>
                  <th className="w-28 px-4 py-3 font-semibold">글쓴이</th>
                  <th className="w-24 px-4 py-3 font-semibold">날짜</th>
                  <th className="w-20 px-4 py-3 font-semibold">조회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                      등록된 게시글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((post) => (
                    <tr
                      key={post.id}
                      onClick={() => navigate(`/community/posts/${post.id}`)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        post.isPinned ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {post.isPinned ? (
                          <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                            공지
                          </span>
                        ) : (
                          post.number
                        )}
                      </td>
                      <td className="px-4 py-3 text-left font-semibold text-gray-800">
                        {post.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">안이환</td>
                      <td className="px-4 py-3 text-gray-600">
                        {post.publishedAt.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{post.views ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-1 text-xs">
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <button
                    key={`page-${page}`}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`h-7 w-7 rounded border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 ${
                      page === currentPage ? 'bg-gray-800 text-white' : ''
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <select className="h-8 rounded border border-gray-200 bg-white px-2 text-xs text-gray-700">
                <option>제목</option>
              </select>
              <input
                className="h-8 w-40 rounded border border-gray-200 px-2 text-xs"
                placeholder="검색어 입력"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setCurrentPage(1)
                }}
              />
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="h-8 rounded border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                검색
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl">
          <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
            {currentSubPage}
          </h1>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
            {contentMap[currentSubPage]}
          </p>
        </div>
      )}
    </PageLayout>
  )
}
