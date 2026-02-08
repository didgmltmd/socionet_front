import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'

interface CounselingPageProps {
  subPage?: string
}

const menuItems = [
  { label: '검사', value: '검사' },
  { label: '아동 심리검사', value: '아동 심리검사', indent: true },
  { label: '청소년 심리검사', value: '청소년 심리검사', indent: true },
  { label: '성인심리검사', value: '성인심리검사', indent: true },
  { label: '종합 심리검사', value: '종합 심리검사', indent: true },
  { label: '상담', value: '상담' },
  { label: '아동청소년 상담', value: '아동청소년 상담', indent: true },
  { label: '부부 및 가족상담', value: '부부 및 가족상담', indent: true },
  { label: '학습 진로상담', value: '학습 진로상담', indent: true },
  { label: '기업상담', value: '기업상담', indent: true },
  { label: '은퇴자 상담', value: '은퇴자 상담', indent: true },
  { label: '진로상담', value: '진로상담', indent: true },
  { label: '감수성훈련', value: '감수성훈련', indent: true },
  { label: '집단상담', value: '집단상담', indent: true },
  { label: '미술상담', value: '미술상담', indent: true },
]

const subPageRoutes = {
  '검사': '/counseling/test',
  '상담': '/counseling/counsel',
  '아동 심리검사': '/counseling/test/child',
  '청소년 심리검사': '/counseling/test/youth',
  '성인심리검사': '/counseling/test/adult',
  '종합 심리검사': '/counseling/test/general',
  '아동청소년 상담': '/counseling/youth',
  '부부 및 가족상담': '/counseling/family',
  '학습 진로상담': '/counseling/career',
  '기업상담': '/counseling/corporate',
  '은퇴자 상담': '/counseling/retiree',
  '진로상담': '/counseling/career-guidance',
  '감수성훈련': '/counseling/tgroup',
  '집단상담': '/counseling/group',
  '미술상담': '/counseling/art',
}

const introText = `일반 검사 및 상담에서는 다양한 검사의 종류별로 또한, 다양한 상담의 종류별로 나누어 설명하지 않았다. 현재의 연구소에서 다룰 수 있는 일반 검사의 종류와 상담의 종류를 나열하였다. 연구소를 이용하고 싶은 사람은 현재, 각각의 영역이 이용 가능한지를 확인하면 된다. 부득이한 연구소의 사정으로 검사나 상담이 힘들 경우 타 기관에 의뢰 할 수 있다.`

const testText = `검사신청 방법: 연구소와 전화 또는 메일로 검사와 관련된 확약을 받는다.\n검사의 종류: 아동심리검사, 청소년심리검사, 성인심리검사, 종합심리검사, 진로심리검사 등`

const counselingText = `상담신청 방법: 연구소와 전화 또는 메일로 상담과 관련된 확약을 받는다.\n상담의 종류: 아동청소년 상담, 부부 및 가족 상담, 학습 및 진로 상담, 기업상담, 은퇴자 상담, 진로상담, 감수성훈련, 집단상담, 미술상담`

const testPages = new Set([
  '검사',
  '아동 심리검사',
  '청소년 심리검사',
  '성인심리검사',
  '종합 심리검사',
])

const counselingPages = new Set([
  '상담',
  '아동청소년 상담',
  '부부 및 가족상담',
  '학습 진로상담',
  '기업상담',
  '은퇴자 상담',
  '진로상담',
  '감수성훈련',
  '집단상담',
  '미술상담',
])

export default function CounselingPage({ subPage }: CounselingPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(
    subPage || '검사',
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
      <div className="space-y-8">
        <TextSection title="일반 검사 및 상담" text={introText} />
        {testPages.has(currentSubPage) && (
          <TextSection title="일반검사" text={testText} />
        )}
        {counselingPages.has(currentSubPage) && (
          <TextSection title="상담" text={counselingText} />
        )}
      </div>
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
