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

const papersText = `1. 안이환(2025). 학생중심의 Socionet과 상담전략, 특강자료집. 평택대학교.
   <초등 및 중등 대상의 Socionet해석과 생활지도 방법>
2. 안이환(2023). 학생의 개인 특성과 학급집단역동을 통한 생활지도: Socionet을 중심으로.
   2023년도 한국초등상담교육학회 연차학술대회자료집, 서울교육대학교.
   <초등학생 대상의 Socionet해석과 생활지도 방법>
3. 안이환(2014). 집단역동의 새로운 분석 방법: SocioNet의 세계.
   한국학교심리학회 추계 워크숍자료집. 주최, 한국학교심리학회/한국학교상담학회, 부산대학교.
   <군인 대상의 Socionet결과 및 해석 방법>`

const publicationsText = `1. 안이환(2013). 학교와 SOCIONET. 경기: 서현사.
2. 안이환(2011). 교육자를 위한 학급집단역동의 컴퓨터분석 시스템. 경기: 서현사.
3. 안이환(2007). 사회성측정: 이론과 실제. 경기: 서현사.
   (2008년도 문화체육관광부 우수학술도서 선정)`

const booksText = `1. 김용학, 김영진(2016). 사회연결망 분석(4판). 서울: 박영사.
2. Cairns, R. B. (1979). The analysis of social interactions: Methods, issues, and illustrations. New Jersey: Lawrence erlbaum associates, Publishers.
3. Gronlund, N. E. (1959). Sociometry in the classroom. New York: Harper & Brothers.`

export default function ResourcesPage({ subPage }: ResourcesPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(subPage || '논문')

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  const renderContent = () => {
    if (currentSubPage === '논문') {
      return <TextSection title="논문" text={papersText} />
    }
    if (currentSubPage === '출판물') {
      return <TextSection title="출판물" text={publicationsText} />
    }
    if (currentSubPage === '추천도서') {
      return <TextSection title="추천도서" text={booksText} />
    }
    return <TextSection title="논문" text={papersText} />
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

function TextSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
        {title}
      </h1>
      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{text}</p>
    </div>
  )
}
