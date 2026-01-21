import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'
import socionet1 from '../assets/socionet_1.png'
import socionet2 from '../assets/socionet_2.png'
import socionet3 from '../assets/socionet_3.png'
import socionet4 from '../assets/socionet_4.png'
import socionet5 from '../assets/socionet_5.png'
import socionet6 from '../assets/socionet_6.png'
import socionet7 from '../assets/socionet_7.png'
import socionet8 from '../assets/socionet_8.png'

interface UnderstandingPageProps {
  subPage?: string
}

const menuItems = [
  { label: 'SOCIONET에 대하여', value: 'SOCIONET에 대하여' },
  { label: 'SOCIOMETRY', value: 'SOCIOMETRY' },
  { label: 'SOCIAL NETWORK ANALYSIS', value: 'SOCIAL NETWORK ANALYSIS' },
  { label: '한국과 SOCIONET', value: '한국과 SOCIONET' },
  { label: 'SOCIONET 활용', value: 'SOCIONET 활용' },
]

const subPageRoutes = {
  'SOCIONET에 대하여': '/understanding/about',
  SOCIOMETRY: '/understanding/sociometry',
  'SOCIAL NETWORK ANALYSIS': '/understanding/sna',
  '한국과 SOCIONET': '/understanding/korea',
  'SOCIONET 활용': '/understanding/application',
}

const contentMap: Record<string, { title: string; text: string }> = {
  SOCIOMETRY: {
    title: 'SOCIOMETRY',
    text: `사회성측정법(sociomtric method)은 좋아함과 싫어함을 바탕으로 질문지를 만들고, 집단에 소속된 모든 구성원들이 N*N형태의 지명자와 피지명자가 되어 서로를 평가하는 방식으로 측정한다.\n\n이 방법은 사이코드라마의 창시자인 Moreno라는 학자에 의해서 처음 시도 되었으며, 이런 방법을 통하여 집단에 소속된 구성원들의 개인적 특징과 사회적 상호작용 및 심리적 역동성을 파악하는 것이 가능하게 되었다.`,
  },
  'SOCIAL NETWORK ANALYSIS': {
    title: 'SOCIAL NETWORK ANALYSIS',
    text: `아동의 친구관계망과 같은 소집단의 형성과 분석에 도움이 되는 사회학의 사회적 관계망 분석법(social network analysis)을 SOCIONET 심리검사에 도입하였다.\n\n이와 같은 관계망 분석법의 도입에 의해 친구관계 또는 각 집단에 소속된 하위집단의 속성을 밝히는 것이 가능하였다.`,
  },
  '한국과 SOCIONET': {
    title: '한국과 SOCIONET',
    text: `SOCIONET은 집단용 심리검사로써 사회성측정(sociometry)과 사회적관계망분석법(social network analysis)에 나타난 핵심 내용을 결합하고, 이를 심리검사의 도구로 확장시킨 것으로 한국에서 최초로 학술적으로 확립한 용어다.\n\nSOCIONET은 기존의 사회성측정에서 나타난 내용과 관계망의 분석을 통해서 나타난 내용을 조합하여 조직의 역동성으로 설명하는 체계를 구축함으로써 문제해결의 가능성을 확장시키는데 절대적인 영향력을 미쳤다.`,
  },
  'SOCIONET 활용': {
    title: 'SOCIONET 활용',
    text: `SOCIONET은 진단기능과 상담기능을 동시에 제공하는 도구다. 자기보고식(self-report) 검사가 진단기능만을 보여주었기 때문에 언제나 한계가 있었다.\n\nSOCIONET의 활용은 다음과 같다.\n\n① 개인별 접근을 통한 문제해결의 가능성 제공으로 예를 들면, 배척아동에 대한 문제해결의 방법을 제공하는 측면\n\n② 하위집단 접근으로 하위집단 가운데 갱집단의 출현을 선제적으로 제어하기\n\n③ 교사가 학급을 운영하거나 소대장이 소대원을 통솔하는 등의 학급운영이나 소대운영 등에 관한 정보제공\n\n④ 학급내 짝지 선정을 위한 자리 배치나 소대원의 자리이동 또는 직장내 재배치 등에 필요한 정보제공\n\n⑤ 검사자가 모두 집단검사에 참여 하였으므로 교사의 개인적 개입이 전혀 없기 때문에 학부모를 위한 객관적인 정보의 제공을 통한 학부모 상담이 가능함\n\n⑥ 학급, 소대, 직장에서 사회적 지원체계로 리퍼(refer)하는 것에 대한 정당성의 확보에 따라서 효과적인 사회적 지원체계의 이용 가능성이 높아짐 예를 들면, 학내의 Wee센터와의 협조적인 관계형성의 용이성 증가\n\n⑦ 교사, 직장내 리더, 소대장과 같은 리더들의 자신의 역량개발에 중요한 자료를 제공한다. 특히, 교사들에게는 생활지도의 역량개발에 중요한 시사점을 제공해 줄 수 있으며 다양한 리더들에게는 안정적인 리더십의 발휘가 가능해지도록 정보를 제공할 것이다.`,
  },
}

export default function UnderstandingPage({ subPage }: UnderstandingPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(
    subPage || 'SOCIOMETRY',
  )

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  const content = contentMap[currentSubPage] || contentMap.SOCIOMETRY

  return (
    <PageLayout
      title="SOCIONET 이해"
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={setCurrentSubPage}
      bannerImage="banner"
      subPageRoutes={subPageRoutes}
    >
      {currentSubPage === 'SOCIONET에 대하여' ? (
        <SocionetAboutSection />
      ) : (
        <TextSection title={content.title} text={content.text} />
      )}
    </PageLayout>
  )
}

function SocionetAboutSection() {
  const primarySections = [
    {
      id: 'socionet-overview',
      title: 'SOCIONET 검사 소개',
      description:
        'SOCIONET 검사의 핵심 개념과 검사 진행 흐름을 한눈에 보여주는 안내 자료입니다.',
      image: socionet1,
    },
    {
      id: 'socionet-process',
      title: '검사 진행 절차',
      description:
        '검사 단계별 체크 포인트와 평가 기준을 정리한 절차 안내입니다.',
      image: socionet2,
    },
    {
      id: 'socionet-report',
      title: 'SOCIONET 보고서 예시',
      description:
        '검사 결과가 보고서 형식으로 정리되는 방식과 항목 구성을 확인할 수 있습니다.',
      image: socionet3,
    },
    {
      id: 'socionet-analysis',
      title: '개인별 사회성 진단',
      description:
        '개인별 사회성 진단 문항과 점수 구조를 보여주는 예시 자료입니다.',
      image: socionet4,
    },
  ]

  const tableSections = [
    {
      id: 'socionet-table-1',
      title: '집단 분석표 1',
      description:
        '집단 내 상호작용을 수치화하여 비교할 수 있는 분석표 예시입니다.',
      image: socionet5,
    },
    {
      id: 'socionet-table-2',
      title: '집단 분석표 2',
      description:
        '집단의 관계 패턴을 확장 분석하는 심화 테이블 예시입니다.',
      image: socionet6,
    },
    {
      id: 'socionet-table-3',
      title: '집단 분석표 3',
      description:
        '검사 결과를 요약하여 리포트에 반영하는 표 구성 예시입니다.',
      image: socionet7,
    },
    {
      id: 'socionet-table-4',
      title: '집단 분석표 4',
      description:
        '추가 분석과 비교를 위해 활용되는 세부 표 형식 예시입니다.',
      image: socionet8,
    },
  ]

  const tabs = [
    ...primarySections.map((section) => ({
      id: section.id,
      label: section.title,
      type: 'single' as const,
    })),
    ...tableSections.map((section) => ({
      id: section.id,
      label: section.title,
      type: 'table' as const,
    })),
  ]

  const [selectedId, setSelectedId] = useState(tabs[0].id)
  const selectedPrimary = primarySections.find((section) => section.id == selectedId)
  const selectedTable = tableSections.find((section) => section.id == selectedId)
  const isTable = Boolean(selectedTable)
  const selected = selectedPrimary || selectedTable || primarySections[0]

  return (
    <div className="max-w-5xl space-y-10">
      <div className="space-y-4">
        <h1 className="border-b-2 border-gray-200 pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          SOCIONET에 대하여
        </h1>
        <p className="text-base leading-7 text-gray-700 sm:text-lg sm:leading-8">
          SOCIONET의 검사 흐름과 결과 보고 형식을 이해할 수 있도록 핵심
          자료를 정리했습니다. 아래 메뉴를 눌러 내용을 확인하세요.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs
            .filter((tab) => tab.type == 'single')
            .map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedId(tab.id)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:cursor-pointer ${
                  selectedId == tab.id
                    ? 'border-teal-500 bg-white text-teal-700 shadow-sm'
                    : 'border-teal-200 bg-white text-teal-700 hover:bg-teal-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tabs
            .filter((tab) => tab.type == 'table')
            .map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedId(tab.id)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:cursor-pointer ${
                  selectedId == tab.id
                    ? 'border-teal-500 bg-white text-teal-700 shadow-sm'
                    : 'border-teal-200 bg-white text-teal-700 hover:bg-teal-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {selected.title}
          </h2>
          <p className="text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            {selected.description}
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <div
            className={`w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-3 ${
              isTable ? 'max-w-[520px]' : 'max-w-[420px]'
            }`}
          >
            <img
              src={selected.image}
              alt={selected.title}
              className={`${isTable ? 'h-[760px]' : ''} w-full rounded-lg object-contain`}
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function TextSection({ title, text }: { title: string; text: string }) {
  const paragraphs = text.split('\n\n')
  const numberedPattern = /^[①②③④⑤⑥⑦⑧⑨⑩]/
  const blocks: Array<{ type: 'p' | 'list'; items: string[] }> = []

  const splitNumberedItem = (item: string) => {
    const match = item.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)$/)
    if (!match) {
      return { marker: '', body: item }
    }
    return { marker: match[1], body: match[2] }
  }

  paragraphs.forEach((paragraph) => {
    if (numberedPattern.test(paragraph)) {
      const lastBlock = blocks[blocks.length - 1]
      if (lastBlock?.type === 'list') {
        lastBlock.items.push(paragraph)
      } else {
        blocks.push({ type: 'list', items: [paragraph] })
      }
      return
    }

    blocks.push({ type: 'p', items: [paragraph] })
  })

  return (
    <div className="max-w-5xl">
      <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h1>
      <div className="space-y-5 text-gray-700">
        {blocks.map((block) =>
          block.type === 'p' ? (
            <p
              key={block.items[0]}
              className="text-base leading-7 sm:text-lg sm:leading-8"
            >
              {block.items[0]}
            </p>
          ) : (
            <ol
              key={block.items.join('|')}
              className="space-y-3 border-l-2 border-teal-200 pl-4 text-base leading-7 sm:text-lg sm:leading-8"
            >
              {block.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="shrink-0 font-semibold text-teal-700">
                    {splitNumberedItem(item).marker}
                  </span>
                  <span className="flex-1">
                    {splitNumberedItem(item).body}
                  </span>
                </li>
              ))}
            </ol>
          ),
        )}
      </div>
    </div>
  )
}
