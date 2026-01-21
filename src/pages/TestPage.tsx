import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'

interface TestPageProps {
  subPage?: string
}

const menuItems = [
  { label: '검사신청', value: '검사신청' },
  { label: '검사대상', value: '검사대상' },
  { label: '유의사항', value: '유의사항' },
  { label: '수련교육과정', value: '수련교육과정' },
  { label: '초급 SOCIONET', value: '초급 SOCIONET', indent: true },
  { label: '중급 SOCIONET', value: '중급 SOCIONET', indent: true },
  { label: '고급 SOCIONET', value: '고급 SOCIONET', indent: true },
  { label: '일반강사과정', value: '일반강사과정', indent: true },
]

const subPageRoutes = {
  '검사신청': '/test/application',
  '검사대상': '/test/target',
  '유의사항': '/test/notice',
  '수련교육과정': '/test/education',
  '초급 SOCIONET': '/test/education/beginner',
  '중급 SOCIONET': '/test/education/intermediate',
  '고급 SOCIONET': '/test/education/advanced',
  '일반강사과정': '/test/education/instructor',
}

const contentMap: Record<string, { title: string; text: string }> = {
  '검사신청': {
    title: '검사신청',
    text: `검사를 신청하는 방법은 검사의 신청에 필요한 소정의 교육을 수료한(선교육) 이후에 검사신청을 하거나 또는 선검사신청 이후 후교육의 조건으로 검사신청이 가능하다. 검사의 실시 및 해석에는 윤리적인 문제가 따르기 때문에 한국SOCIONET연구소와의 충분한 사전 협의를 거친 이후에 검사신청이 가능하다.`,
  },
  '검사대상': {
    title: '검사대상',
    text: `SOCIONET검사는 유치원, 초⋅중⋅고교, 회사, 군대 등과 같은 조직을 대상으로 실시한다. 문해력이 없는 유치원 아동을 대상으로 검사가 가능한 것이 SOCIONET검사의 큰 특징이다. 만일의 경우, 조직원의 인원수가 7명 이하인 경우 및 조직원의 인원수가 40명 이상일 경우에는 검사의 대상이 되지 못할 수도 있다.`,
  },
  '유의사항': {
    title: '유의사항',
    text: `1. 집단이 형성된지 4주 이하인 경우 검사를 실시하지 않는다.
2. 검사의 결과는 원칙적으로 PDF 파일로 전송된다. 실비로 프린트 아웃해서 제공할 때에는 칼라로 인쇄하여 제공한다.
3. 검사의 실시, 채점, 해석, 보관에 있어서 검사의 판매자와 구입자는 반드시 윤리규정을 준수하여야 한다.`,
  },
  '수련교육과정': {
    title: 'SOCIONET교육',
    text: `SOCIONET 교육의 대상자는 교육기관의 상담교사 및 현장교사, 각 조직 및 기관의 책임자, 상담관련 석사학위 이상인자, 연구소가 인정하는 자를 대상으로 교육을 실시한다. 교육의 시기는 봄 방학기간, 여름 방학기간, 겨울 방학기간, 수시공고를 통해서 실시된다. 교육장소는 서비스를 받는 기관이 지정하는 곳, 한국SOCIONET연구소가 지정하는 장소가 원칙이며, 교육의 시기 및 장소는 피교육자와 한국Socionet연구소와의 협의에 의한다. 필요할 경우, 온라인 교육으로 대체할 수도 있다. 교육의 과정은 3단계로 초급교육, 중급교육, 일반강사 교육과정으로 한다.`,
  },
  '초급 SOCIONET': {
    title: '초급 SOCIONET',
    text: `초급과정은 총 8시간으로 SOCIONET의 이론을 익히는 시간이다. 각급학교의 상담업무 종사자 및 상담교사, 그리고 초⋅중⋅고교 현직교사, 군대의 소대장 이상, 직장의 책임자급 이상자, 상담관련 석사학위 이상자에게는 4시간의 교육으로 교육과정(Ⅰ)을 인정할 수 있다. 초급교육을 이수한 사람부터 심리검사의 서비스를 제공하는 것을 원칙으로 한다.`,
  },
  '중급 SOCIONET': {
    title: '중급 SOCIONET',
    text: `중급과정은 총 16시간이다. 8시간에 걸친 이론의 심화시간에는 다양한 Socionet의 지표를 실제로 계산하고 연습해 보는 시간이다. 나머지 7시간은 도출된 지표를 바탕으로 검사의 결과를 다양하게 해석하는 시간이 7시간이다. 마지막 1시간은 검사의 윤리에 대한 교육시간이다. 중급 SOCIONET 교육 이후에는 간단한 과제가 부과될 수 있다.`,
  },
  '고급 SOCIONET': {
    title: '일반강사 과정',
    text: `일반강사 과정은 검사의 이론, 해석, 생활지도와 상담전략, 문제해결의 방법을 익히는 과정으로 총 24시간이다. 일반강사 과정에는 과제물과 시험이 부과될 수 있다. 자격증 과정이기 때문에 시험에 불합격할 경우 일반강사는 될 수 없다. 시험은 3번까지 기회를 제공하며, 시험과 관련된 추가 비용은 한국SOCIONET연구소가 감당하며 시험지 및 채점의 결과는 절대로 공개하지 않는 것을 원칙으로 한다. 일반강사가 된 이후에는 한국SOCIONET연구소가 주관하는 보수 교육에 반드시 일정한 시간 참석하여 일반강사로서의 유지 기간을 연장하여야 한다. 일반강사는 한국SOCIONET의 동의 및 협의 하에 SOCIONET 검사의 실시, 해석, 교육을 담당할 수 있다.`,
  },
  '일반강사과정': {
    title: '일반강사 과정',
    text: `일반강사 과정은 검사의 이론, 해석, 생활지도와 상담전략, 문제해결의 방법을 익히는 과정으로 총 24시간이다. 일반강사 과정에는 과제물과 시험이 부과될 수 있다. 자격증 과정이기 때문에 시험에 불합격할 경우 일반강사는 될 수 없다. 시험은 3번까지 기회를 제공하며, 시험과 관련된 추가 비용은 한국SOCIONET연구소가 감당하며 시험지 및 채점의 결과는 절대로 공개하지 않는 것을 원칙으로 한다. 일반강사가 된 이후에는 한국SOCIONET연구소가 주관하는 보수 교육에 반드시 일정한 시간 참석하여 일반강사로서의 유지 기간을 연장하여야 한다. 일반강사는 한국SOCIONET의 동의 및 협의 하에 SOCIONET 검사의 실시, 해석, 교육을 담당할 수 있다.`,
  },
}

export default function TestPage({ subPage }: TestPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(subPage || '검사신청')

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  const content = contentMap[currentSubPage] || contentMap['검사신청']

  return (
    <PageLayout
      title="SOCIONET 검사 및 교육"
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
  const numberedLine = /^\d+\.\s*/

  const splitNumberedLine = (line: string) => {
    const match = line.match(/^(\d+)\.\s*(.*)$/)
    if (!match) {
      return { marker: '', body: line }
    }
    return { marker: `${match[1]}.`, body: match[2] }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h1>
      <div className="space-y-5 text-gray-700">
        {paragraphs.map((paragraph) => {
          const lines = paragraph.split('\n').filter(Boolean)
          const isNumberedList =
            lines.length > 1 && lines.every((line) => numberedLine.test(line))

          if (isNumberedList) {
            return (
              <ol
                key={paragraph}
                className="space-y-3 border-l-2 border-teal-200 pl-4 text-base leading-7 sm:text-lg sm:leading-8"
              >
                {lines.map((line) => {
                  const { marker, body } = splitNumberedLine(line)
                  return (
                    <li key={line} className="flex gap-3">
                      <span className="shrink-0 font-semibold text-teal-700">
                        {marker}
                      </span>
                      <span className="flex-1">{body}</span>
                    </li>
                  )
                })}
              </ol>
            )
          }

          return (
            <p
              key={paragraph}
              className="text-base leading-7 sm:text-lg sm:leading-8"
            >
              {paragraph}
            </p>
          )
        })}
      </div>
    </div>
  )
}
