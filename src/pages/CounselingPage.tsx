import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'

interface CounselingPageProps {
  subPage?: string
}

const menuItems = [
  { label: '아동 심리검사', value: '아동 심리검사' },
  { label: '청소년 심리검사', value: '청소년 심리검사' },
  { label: '성인심리검사', value: '성인심리검사' },
  { label: '종합 심리검사', value: '종합 심리검사' },
  { label: '아동청소년 상담', value: '아동청소년 상담' },
  { label: '부부 및 가족상담', value: '부부 및 가족상담' },
  { label: '학습 진로상담', value: '학습 진로상담' },
  { label: '기업상담', value: '기업상담' },
  { label: '은퇴자 상담', value: '은퇴자 상담' },
  { label: '감수성 훈련', value: '감수성 훈련' },
]

const subPageRoutes = {
  '아동 심리검사': '/counseling/test/child',
  '청소년 심리검사': '/counseling/test/youth',
  '성인심리검사': '/counseling/test/adult',
  '종합 심리검사': '/counseling/test/general',
  '아동청소년 상담': '/counseling/youth',
  '부부 및 가족상담': '/counseling/family',
  '학습 진로상담': '/counseling/career',
  '기업상담': '/counseling/corporate',
  '은퇴자 상담': '/counseling/retiree',
  '감수성 훈련': '/counseling/tgroup',
}

const placeholderText = `2차수정때 내용 채워넣을 예정입니다`

export default function CounselingPage({ subPage }: CounselingPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(
    subPage || '아동청소년 상담',
  )

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  return (
    <PageLayout
      title="일반 검사 및 상담"
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={setCurrentSubPage}
      bannerImage="banner"
      subPageRoutes={subPageRoutes}
    >
      <TextSection title={currentSubPage} text={placeholderText} />
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
