import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'

interface ResourcesPageProps {
  subPage?: string
}

const menuItems = [
  { label: '논문', value: '논문' },
  { label: '출판물', value: '출판물' },
  { label: '추천도서', value: '추천도서' },
]

const subPageRoutes = {
  '논문': '/resources/papers',
  '출판물': '/resources/publications',
  '추천도서': '/resources/books',
}

const papers = [
  {
    label: '안이환(2025).',
    body: '학생중심의 Socionet과 상담전략, 특강자료집. 평택대학교.',
    sub: '<초등 및 중등 대상의 Socionet해석과 생활지도 방법>',
  },
  {
    label: '안이환(2023).',
    body: '학생의 개인 특성과 학급집단역동을 통한 생활지도: Socionet을 중심으로. 2023년도 한국초등상담교육학회 연차학술대회자료집, 서울교육대학교.',
    sub: '<초등학생 대상의 Socionet해석과 생활지도 방법>',
  },
  {
    label: '안이환(2014).',
    body: '집단역동의 새로운 분석 방법: SocioNet의 세계. 한국학교심리학회 추계 워크숍자료집. 주최, 한국학교심리학회/한국학교상담학회, 부산대학교.',
    sub: '<군인 대상의 Socionet결과 및 해석 방법>',
  },
]

const publications = [
  {
    label: '안이환(2013).',
    body: '학교와 SOCIONET. 경기: 서현사.',
  },
  {
    label: '안이환(2011).',
    body: '교육자를 위한 학급집단역동의 컴퓨터분석 시스템. 경기: 서현사.',
  },
  {
    label: '안이환(2007).',
    body: '사회성측정: 이론과 실제. 경기: 서현사.',
    sub: '(2008년도 문화체육관광부 우수학술도서 선정)',
  },
]

const books = [
  {
    label: '김용학, 김영진(2016).',
    body: '사회연결망 분석(4판). 서울: 박영사.',
  },
  {
    label: 'Cairns, R. B. (1979).',
    body:
      'The analysis of social interactions: Methods, issues, and illustrations. New Jersey: Lawrence erlbaum associates, Publishers.',
  },
  {
    label: 'Gronlund, N. E. (1959).',
    body: 'Sociometry in the classroom. New York: Harper & Brothers.',
  },
]

export default function ResourcesPage({ subPage }: ResourcesPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(subPage || '논문')

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  const renderContent = () => {
    if (currentSubPage === '논문') {
      return <PapersSection />
    }
    if (currentSubPage === '출판물') {
      return <ListSection title="출판물" items={publications} />
    }
    if (currentSubPage === '추천도서') {
      return <ListSection title="추천도서" items={books} />
    }
    return <PapersSection />
  }

  return (
    <PageLayout
      title="자료실"
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={setCurrentSubPage}
      bannerImage="banner"
      subPageRoutes={subPageRoutes}
    >
      {renderContent()}
    </PageLayout>
  )
}

function PapersSection() {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
        논문
      </h1>
      <ol className="list-decimal space-y-4 pl-6 text-sm leading-relaxed text-gray-700">
        {papers.map((paper) => (
          <li key={paper.body} className="pl-1">
            <div className="grid grid-cols-[120px_1fr] gap-x-2">
              <span className="font-medium text-gray-800">{paper.label}</span>
              <span className="font-medium text-gray-800">{paper.body}</span>
              <span className="col-start-2 mt-1 text-gray-600">{paper.sub}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ListSection({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; body: string; sub?: string }>
}) {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
        {title}
      </h1>
      <ol className="list-decimal space-y-4 pl-6 text-sm leading-relaxed text-gray-700">
        {items.map((item) => (
          <li key={`${title}-${item.label}-${item.body}`} className="pl-1">
            <div className="grid grid-cols-[120px_1fr] gap-x-2">
              <span className="font-medium text-gray-800">{item.label}</span>
              <span className="font-medium text-gray-800">{item.body}</span>
              {item.sub && (
                <span className="col-start-2 mt-1 text-gray-600">{item.sub}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
