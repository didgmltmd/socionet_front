import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'

interface UnderstandingPageProps {
  subPage?: string
}

const menuItems = [
  { label: 'SOCIOMETRY', value: 'SOCIOMETRY' },
  { label: 'SOCIAL NETWORK ANALYSIS', value: 'SOCIAL NETWORK ANALYSIS' },
  { label: 'SOCIONET에 대하여', value: 'SOCIONET에 대하여' },
  { label: '한국과 SOCIONET', value: '한국과 SOCIONET' },
  { label: 'SOCIONET 활용', value: 'SOCIONET 활용' },
]

const subPageRoutes = {
  SOCIOMETRY: '/understanding/sociometry',
  'SOCIAL NETWORK ANALYSIS': '/understanding/sna',
  'SOCIONET에 대하여': '/understanding/about',
  '한국과 SOCIONET': '/understanding/korea',
  'SOCIONET 활용': '/understanding/application',
}

const contentMap: Record<string, { title: string; text: string }> = {
  SOCIOMETRY: {
    title: 'SOCIOMETRY',
    text: `사회성측정법(sociometric method)은 좋아함과 싫어함을 바탕으로 질문지를 만들고, 집단에 소속된 모든 구성원들이 N*N형태의 지명자와 피지명자가 되어 서로를 평가하는 방식으로 측정한다. 이 방법은 사이코드라마의 창시자인 Moreno라는 학자에 의해서 처음 시도 되었으며, 이런 방법을 통하여 집단에 소속된 구성원들의 개인적 특징과 사회적 상호작용 및 심리적 역동성을 파악하는 것이 가능하게 되었다.`,
  },
  'SOCIAL NETWORK ANALYSIS': {
    title: 'SOCIAL NETWORK ANALYSIS',
    text: `아동의 친구관계망과 같은 소집단의 형성과 분석에 도움이 되는 사회학의 사회적 관계망 분석법(social network analysis)을 SOCIONET 심리검사에 도입하였다. 이와 같은 관계망 분석법의 도입에 의해 친구관계 또는 각 집단에 소속된 하위집단의 속성을 밝히는 것이 가능하였다.`,
  },
  'SOCIONET에 대하여': {
    title: 'SOCIONET에 대하여',
    text: `SOCIONET이라는 용어는 사회성측정(sociometry)과 사회적관계망 분석(social network analysis)을 결합한 용어로 한국에서 최초로 학술적으로 정의된 용어다. 사회성측정을 통해서 집단 내 한 개인의 사회적 성격 특성을 측정한다. 이렇게 측정된 개인적 특성들이 하위집단(소집단)의 관계망 속에서는 어떻게 작용하고 있는지를 알아내서 하위집단의 특징, 예를 들면, 학습집단, 운동집단, 갱집단 등등으로 하위집단의 속성을 자세히 설명할 수 있게 된다. 따라서 SOCIONET은 한 개인과 다양한 형태의 하위집단에 대한 속성을 역동적으로 설명할 수 있는 체계적인 접근법이라고 할 수 있다.`,
  },
  '한국과 SOCIONET': {
    title: '한국과 SOCIONET',
    text: `SOCIONET은 집단용 심리검사로써 사회성측정(sociometry)과 사회적관계망분석법(social network analysis)에 나타난 핵심 내용을 결합하고, 이를 심리검사의 도구로 확장시킨 것으로 한국에서 최초로 학술적으로 확립한 용어다.\n\n안이환(2007)은 서양에서 시작된 사회성측정법(sociometry)을 총정리하여, 2008년도에 엑셀에 기반한 사회성측정의 전산프로그램을 개발하였다. 이후 2010년 미국의 일리노이 대학교 사범대학교에 교환교수(visiting scholar)로 있으면서 사회학에서 시작된 사회적관계망 분석법을 사회성측정에 결합하면 한 개인의 사회적 특성 뿐만 아니라, 다양한 하위집단의 성질을 역동적으로 설명할 수 있는 체계를 갖출 수 있다는 생각으로 SOCIONET의 필요성을 주장하였다. 이러한 생각에 따라 2025년 특허의 획득과 동시에 엑셀에 기반한 SOCIONET의 전산프로그램을 완성하였다(안재청, 2025).`,
  },
  'SOCIONET 활용': {
    title: 'SOCIONET 활용',
    text: `SOCIONET의 활용은 다음과 같다.\n\n①개인별 접근을 통한 문제해결의 가능성 제공으로 예를 들면, 배척아동에 대한 문제해결의 방법을 제시함\n\n②하위집단 접근법을 통하여 갱집단 등의 나쁜 집단 출현을 선제적으로 제어함\n\n③교사가 학급을 운영하거나 소대장이 소대원을 통솔하는 등의 학급운영이나 소대운영 등에 관한 정보제공\n\n④학급내 짝지 선정을 위한 자리 배치나 소대원의 자리이동 또는 직장내 재배치 등에 필요한 정보제공\n\n⑤검사자가 모두 집단검사에 참여 하였으므로 교사의 개인적 개입이 전혀 없기 때문에 학부모를 위한 객관적인 정보의 제공을 통한 학부모 상담이 가능함\n\n⑥학급, 소대, 직장에서 사회적 지원체계로 리퍼(refer)하는 것에 대한 정당성의 확보에 따라서 효과적인 사회적 지원체계의 이용 가능성이 높아짐. 예를 들면, 학내의 Wee센터와의 협조적인 관계형성의 용이성 증가\n\n⑦교사, 직장내 리더, 소대장과 같은 리더들의 자신의 역량개발에 중요한 자료를 제공. 특히, 교사들에게는 생활지도의 역량개발에 중요한 시사점을 제공해 줄 수 있으며 다양한 리더들에게는 안정적인 리더십의 발휘가 가능해지도록 정보를 제공함`,
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
      <TextSection title={content.title} text={content.text} />
    </PageLayout>
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
