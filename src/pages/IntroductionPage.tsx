import { useEffect, useMemo, useRef, useState } from 'react'
import { Bus, Car, MapPin, Train } from 'lucide-react'
import PageLayout from '../components/PageLayout'

interface IntroductionPageProps {
  subPage?: string
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => unknown
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => {
          setCenter: (coords: unknown) => void
          setLevel: (level: number) => void
          relayout: () => void
          addControl: (control: unknown, position: unknown) => void
        }
        Marker: new (options: { map: unknown; position: unknown }) => unknown
        InfoWindow: new (options: { content: string }) => { open: (map: unknown, marker: unknown) => void }
        ZoomControl: new () => unknown
        ControlPosition: {
          RIGHT: unknown
        }
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (result: Array<{ x: string; y: string }>, status: string) => void,
            ) => void
          }
          Status: {
            OK: string
          }
        }
      }
    }
  }
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined
const locationInfo = {
  name: '한국 SOCIONET 연구소',
  address: '부산광역시 해운대구 반송순환로 142, M동 9층 903호 (반송동, 영산대학교 해운대캠퍼스)',
}
const mapDefaults = {
  level: 3,
}

let kakaoMapScriptPromise: Promise<void> | null = null

const loadKakaoMapScript = () => {
  if (kakaoMapScriptPromise) {
    return kakaoMapScriptPromise
  }

  kakaoMapScriptPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve()
      return
    }

    const existingScript = document.getElementById('kakao-map-sdk') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Kakao map script')))
      return
    }

    if (!KAKAO_APP_KEY) {
      reject(new Error('Missing Kakao map app key'))
      return
    }

    const script = document.createElement('script')
    script.id = 'kakao-map-sdk'
    script.async = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Kakao map script'))
    document.head.appendChild(script)
  })

  return kakaoMapScriptPromise
}

const menuItems = [
  { label: '인사말', value: '인사말' },
  { label: '연혁', value: '연혁' },
  { label: '주요활동', value: '주요활동' },
  { label: '오시는 길', value: '오시는 길' },
]

const subPageRoutes = {
  '인사말': '/intro/greeting',
  '연혁': '/intro/history',
  '주요활동': '/intro/activities',
  '오시는 길': '/intro/location',
}

const contentMap: Record<string, { title: string; text: string }> = {
  '연구소 소개': {
    title: '연구소 소개',
    text: `(株)SOCIONET의 모태이자 부설 연구소인 한국SOCIONET연구소는 2004년부터 부산교육대학교를 중심으로 학교, 사회조직, 회사, 군대 집단을 대상으로 집단에 소속된 한 개인의 사회적 성격 뿐만 아니라, 집단내에서 일어나고 있는 관계성과 심리적 역동(dynamic)을 네트워크분석(network analysis)을 통하여 평가하고 연구하기 위한 연구소로 출범하였다. 그동안 연구의 결과를 지속적으로 학회에 보고하고 평가를 받으면서 현재에 이르고 있다. 한국SOCIONET연구소는 한국에서 최초로 SOCIONET의 핵심인 집단용 심리검사지의 개발과 측정의 전산화를 달성하였다. 20년 동안의 결과를 통해 2025년 특허를 획득하면서 현장과의 교류가 본격적으로 시작되었다.`,
  },
  '인사말': {
    title: '인사말',
    text: `존경하는 교직자 • 기업체 관련자 • 사회단체 관련자, 그리고 군대의 관계자 여러분께 인사 드립니다. 연구소와 인사를 나눈 분들이 아마 한국SOCIONET연구소를 가장 많이 이용하실 것으로 생각합니다.

저는 부산교육대학교에서 상담 및 심리검사를 가르치던 교수로 2024년에 정년을 하고 (株)SOCIONET을 창업하였습니다. 소시오넷(SOCIONET)은 한국에서 만들어진 집단용 심리검사 도구로 설문지의 제작에서 자료처리의 자동화까지 1개의 심리검사를 완성하는데 거의 20년에 걸쳐 만들어진 한국형 검사도구입니다. 검사의 내용과 성질 및 평가기능에 대해서는 SOCIONET의 이해에서 간략하게 설명을 드리겠습니다.

SOCIONET 집단용 심리검사는 현장에서 고민하는 교직자, 기업 및 사회단체 관련자, 군대의 간부들에게 현실적으로 많은 도움을 드릴 수 있다고 감히 말씀을 드립니다. 다양한 형태의 서양 심리검사가 국내에서 표준화 과정을 거쳐 많이 소개 되었습니다. 이러한 검사들은 거의 자기보고식 검사(self report)이므로 개인의 성격 특성을 주로 설명하고 있습니다. 현실적으로 많은 분들이 성격검사 및 진로검사를 통해서 큰 도움을 받지 못했다고 자주 말합니다. 심리검사를 통해서 설명하기에는 너무나 큰 인간의 세계가 따로 있음을 느낍니다. 그렇지만 SOCIONET 집단용 심리검사는 한 개인의 사회적 성격(social reality) 뿐만 아니라, 그가 속한 관계망(network)의 속성과 성질을 밝혀주고 설명하는 체계를 갖추었기에 기존의 여러 검사와는 달리 현실적으로 많은 도움이 될 것이라고 믿습니다.

진성성을 가지고 의미를 만들고 가치를 창조하는 연구소가 될 수 있도록 여러분들의 많은 성원과 질책을 바랍니다. 감사합니다.

2026년 1월

안 이 환 / 한국SOCIONET연구소 소장`,
  },
  '연혁': {
    title: '연혁',
    text: '',
  },
  '주요활동': {
    title: '주요활동',
    text: '',
  },
  '오시는 길': {
    title: '오시는 길',
    text: '',
  },
}

const historyTables = [
  {
    title: '저널중심',
    columns: [
      { key: 'no', label: '번', align: 'center' },
      { key: 'year', label: '년도', align: 'center' },
      { key: 'title', label: '제목' },
      { key: 'author', label: '저자' },
      { key: 'paper', label: '논문', align: 'center' },
      { key: 'journal', label: '저널', align: 'center' },
      { key: 'type', label: '구분', align: 'center' },
    ],
    rows: [
      {
        no: '1',
        year: '2009',
        title: '학급상담 전략이 배척아동의 대인문제 해결력 향상에 미치는 효과',
        author: '강하영, 안이환',
        paper: '○',
        journal: '■',
        type: '상담효과',
      },
      {
        no: '2',
        year: '2010',
        title: '초등학교 고학년 학생의 사회성측정 지위 유형과 동적학교생활그림검사(KSD)의 관계',
        author: '안이환',
        paper: '',
        journal: '■',
        type: '유사연구',
      },
      {
        no: '3',
        year: '2011',
        title: '초등학생의 또래하위집단 분류에 대한 사회인지도 분석의 적합성 연구',
        author: '안이환, 신민식',
        paper: '○',
        journal: '■',
        type: '측정연구',
      },
      {
        no: '4',
        year: '2011',
        title: '아동의 또래지위에 따른 교우관계문제',
        author: '정성철, 홍상황, 김종미(진주교대)',
        paper: '',
        journal: '■',
        type: '측정연구',
      },
      {
        no: '5',
        year: '2012',
        title: '초등학교 고학년 학생의 사회적 지위 유형과 학업성취도간의 관계',
        author: '안이환, 이창우',
        paper: '',
        journal: '■',
        type: '측정연구',
      },
      {
        no: '6',
        year: '2012',
        title: '지각 자료의 공유인접수와 심리적 선호도에 의한 또래관계 하위집단의 분류 방법에 대한 비교',
        author: '안이환',
        paper: '',
        journal: '■',
        type: '측정연구',
      },
      {
        no: '7',
        year: '2012',
        title: '사회성측정 지위 유형과 한국 아동 성격검사와의 관계',
        author: '이명숙, 안이환, 홍상황',
        paper: '',
        journal: '■',
        type: '측정연구',
      },
      {
        no: '8',
        year: '2013',
        title: '유아용 Socionet의 개발과 과제',
        author: '안이환',
        paper: '',
        journal: '■',
        type: '측정연구',
      },
      {
        no: '9',
        year: '2014',
        title: '통합학급의 학습장애 아동에 대한 사회성측정 특징 및 또래관계망 연구',
        author: '안이환',
        paper: '',
        journal: '■',
        type: '상담연구',
      },
      {
        no: '10',
        year: '2018',
        title: '생활지도를 위한 Socionet의 개발과 학급 적용',
        author: '안이환',
        paper: '',
        journal: '■',
        type: '상담연구',
      },
    ],
  },
  {
    title: '논문중심',
    columns: [
      { key: 'no', label: '번', align: 'center' },
      { key: 'year', label: '년도', align: 'center' },
      { key: 'title', label: '제목' },
      { key: 'author', label: '저자' },
      { key: 'paper', label: '논문', align: 'center' },
      { key: 'type', label: '구분', align: 'center' },
    ],
    rows: [
      {
        no: '1',
        year: '2007',
        title: '교사의 학급상담전략이 배척아동의 사회성에 미치는 효과',
        author: '박경나',
        paper: '■',
        journal: '',
        type: '상담전공 · 상담연구',
      },
      {
        no: '2',
        year: '2007',
        title: '또래상담자의 멘토 활동이 초등학교 배척아동의 또래관계에 미치는 효과',
        author: '정미혜',
        paper: '■',
        journal: '',
        type: '상담전공 · 상담연구',
      },
      {
        no: '3',
        year: '2012',
        title: '인기아동과 배척아동의 하위유형 분류 연구',
        author: '소정훈',
        paper: '■',
        journal: '',
        type: '상담전공 · 측정연구',
      },
      {
        no: '4',
        year: '2012',
        title: '초등학생의 사회성측정과 또래관계망에 나타난 또래관계 경향성연구',
        author: '김민주',
        paper: '■',
        journal: '',
        type: '상담전공 · 측정연구',
      },
      {
        no: '5',
        year: '2013',
        title: '초등학생의 사회적 지위 유형과 자기효능감 간의 관계',
        author: '이영주',
        paper: '■',
        journal: '',
        type: '상담전공 · 측정연구',
      },
      {
        no: '6',
        year: '2013',
        title: '공감훈련 프로그램이 초등학생의 사회적 지위 유형 변화에 미치는 영향',
        author: '이동현',
        paper: '■',
        journal: '',
        type: '상담전공 · 상담연구',
      },
      {
        no: '7',
        year: '2013',
        title: '초등학생의 사회적 지위 유형과 학업성취도간의 관계',
        author: '이창우',
        paper: '■',
        journal: '',
        type: '상담전공 · 측정연구',
      },
      {
        no: '8',
        year: '2015',
        title: '사회성측정 유형과 유아의 사회성발달 간의 관계',
        author: '이태순',
        paper: '■',
        journal: '',
        type: '유아과 대학원 · 측정연구',
      },
      {
        no: '9',
        year: '2016',
        title: '배척아동의 교우관계 형성과 교우관계문제의 관계',
        author: '정서영',
        paper: '■',
        journal: '',
        type: '상담전공 · 측정연구',
      },
    ],
  },
  {
    title: '저서',
    columns: [
      { key: 'no', label: '번', align: 'center' },
      { key: 'year', label: '년도', align: 'center' },
      { key: 'title', label: '제목' },
      { key: 'author', label: '저자' },
      { key: 'note', label: '출판/비고' },
    ],
    rows: [
      {
        no: '1',
        year: '2007',
        title: '사회성측정: 이론과 실제',
        author: '안이환',
        note: '서현사 / 문화체육관광부 우수 학술 도서 선정(2008)',
      },
      {
        no: '2',
        year: '2011',
        title: '교육자를 위한 학급집단역동의 컴퓨터분석 시스템',
        author: '안이환',
        note: '서현사 / 단독',
      },
      {
        no: '3',
        year: '2013',
        title: '학교와 SOCIONET',
        author: '안이환',
        note: '서현사 / 단독',
      },
      {
        no: '4',
        year: '2014',
        title: '(한국형)초등학교 생활지도 및 상담',
        author: '안이환(5장서술)',
        note: '학지사 / 전국초등상담교수연합',
      },
      {
        no: '5',
        year: '2025',
        title: '초등학교 생활지도 및 상담',
        author: '안이환(5장서술)',
        note: '학지사 / 전국초등상담교수연합',
      },
      {
        no: '6',
        year: '2026',
        title: '집단용 SOCIONET 검사 간편 해석집',
        author: '안이환⋅안재청',
        note: '작업중',
      },
    ],
  },
  {
    title: '학회 발표',
    columns: [
      { key: 'no', label: '번', align: 'center' },
      { key: 'year', label: '년도', align: 'center' },
      { key: 'title', label: '제목' },
      { key: 'presenter', label: '발표/장소' },
      { key: 'note', label: '비고' },
    ],
    rows: [
      {
        no: '1',
        year: '2006',
        title: '2006년 한국상담학회 연차대회(자료집) - 행렬매트릭스를 통한 학급집단의 심리 및 구조관찰',
        presenter: '안이환',
        note: 'pp100-107',
      },
      {
        no: '2',
        year: '2007',
        title: '2007년 한국초등상담교육학회 연차대회(자료집) - 또래집단상담을 통한 학급집단의 역동',
        presenter: '안이환',
        note: 'pp153-188',
      },
      {
        no: '3',
        year: '2018',
        title: '2017학년도 한국초등상담교육학회 연차학술대회(자료집) 주제발표: Socionet을 통한 학급운영과 아동지도',
        presenter: '안이환',
        note: 'pp75-94',
      },
      {
        no: '4',
        year: '2022',
        title: '2022년도 한국초등상담교육학회 연차학술대회(자료집) Socionet의 생활지도 활용 가능성에 대한 연구',
        presenter: '안이환',
        note: '광주교육대학교(on line)',
      },
      {
        no: '5',
        year: '2023',
        title: '2023년도 한국초등상담교육학회 연차학술대회(자료집) 학생의 개인 특성과 학급집단역동을 통한 생활지도: Socionet을 중심으로',
        presenter: '안이환',
        note: '서울교육대학교(on line)',
      },
    ],
  },
  {
    title: '기타 발표',
    columns: [
      { key: 'no', label: '번', align: 'center' },
      { key: 'year', label: '년도', align: 'center' },
      { key: 'title', label: '내용' },
      { key: 'note', label: '비고' },
    ],
    rows: [
      {
        no: '1',
        year: '2009',
        title: '부산 연서초등학교 인성시범학교 실시 / P/A/R/N/C 아동의 특성 검증',
        note: '교사 연수',
      },
      {
        no: '2',
        year: '2011',
        title: '아동의 또래지위에 따른 교우관계문제 <안이환의 사회성측정 검증> / 정성철, 홍상황, 김종미(진주교대)',
        note: 'P/A/R/N/C 특성 검증 / 초등상담연구, 10(2), pp167-184 / 피험자: 부산및울산초등생 / 대상: 초2-6까지 / 인원: 855명',
      },
      {
        no: '3',
        year: '2013',
        title: '한국동서정신과학회 제27차 춘계학술대회, 주제발표 한국형 Socionet를 이용한 개인 및 집단지도',
        note: '대구교육대학교 / pp3-21',
      },
      {
        no: '4',
        year: '2013',
        title: '경기도 연천 중•고교 전교생 대상 (Socionet 분석)',
        note: '학생 분석 및 교사 연수',
      },
      {
        no: '5',
        year: '2013',
        title: '2013년도 한국초등상담교육학회 연차학술대회(자료집) 학급집단 역동의 컴퓨터분석 시스템',
        note: '제주대학교 교육대학 별지참조',
      },
      {
        no: '6',
        year: '2014',
        title: '2014년도 한국초등상담교육학회 연차학술대회(자료집) 초등학급의 Socionet분석',
        note: '춘천교육대학교 / pp46-68',
      },
      {
        no: '7',
        year: '2014',
        title: '한국학교심리학회 추계 워크숍 집단역동의 새로운 분석 방법: SocioNet의 세계',
        note: '부산대학교 성학관(422동) 102호 / 주최 한국학교심리학회·한국학교상담학회 / 주관 한국학교심리학회 / 후원 한국심리학회·부산대학교',
      },
      {
        no: '8',
        year: '2014',
        title: '한국군상담학회 연차학술대회 군상담을 위한 Socionet의 활용',
        note: '서울대학교, 8월 14일(목) / 발표자: 안이환(부산교대)',
      },
      {
        no: '9',
        year: '2009-2016',
        title: '부산교육대학교 교육대학원 상담전공 심리검사수업 (2009-2016) 사회성측정과 또래관계망',
        note: '대학원 수업 7년간',
      },
      {
        no: '10',
        year: '2016',
        title: '명사초청 컨설팅 장학 울산 월봉초등학교 및 동평초등학교',
        note: '2개의 초등학교 전교생 Socionet분석 및 교사 대상 분석법 강의',
      },
      {
        no: '11',
        year: '2025',
        title: '진주교육대학교 상담대학원 현장전문가 특강',
        note: '학급의 구조와 Socionet의 세계(2025/11/3일/토)',
      },
      {
        no: '12',
        year: '2025',
        title: '평택대학교 상담대학원 특강',
        note: '학생중심의 Socionet과 담전략(2025/12/13일/토)',
      },
    ],
  },
]

const activityItems = [
  {
    year: '2023',
    description: '한국초등상담교육학회 22차 연차학술대회(23년 1월). Socionet 발표(광주교육대학교).',
  },
  {
    year: '2024',
    description: '한국초등상담교육학회 23차 연차학술대회(24년 1월). Socionet 발표(서울교육대학교).',
  },
  {
    year: '2025',
    description: '평택대학교 상담대학원 Socionet 특강 실시.',
  },
  {
    year: '2025',
    description: '진주교육대학교 상담대학원의 현장전문가 과정, Socionet 특강 실시.',
  },
  {
    year: '2025',
    description:
      '학급집단의 역동과 Socionet(제5장 서술). 학지사: 초등학교 생활지도 및 상담 (전국초등상담교수연합, 한국초등상담교육학회 편, 교재 집필).',
  },
]

export default function IntroductionPage({ subPage }: IntroductionPageProps) {
  const [currentSubPage, setCurrentSubPage] = useState(subPage || '인사말')
  const mapRef = useRef<unknown | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (subPage) {
      setCurrentSubPage(subPage)
    }
  }, [subPage])

  const handleResetMap = () => {
    if (!mapRef.current || !mapCenter || !window.kakao?.maps) {
      return
    }
    const { maps } = window.kakao
    const map = mapRef.current as { setCenter: (coords: unknown) => void; setLevel: (level: number) => void }
    map.setCenter(new maps.LatLng(mapCenter.lat, mapCenter.lng))
    map.setLevel(mapDefaults.level)
  }

  useEffect(() => {
    if (currentSubPage !== '오시는 길') {
      return
    }
    if (!KAKAO_APP_KEY) {
      return
    }

    let isActive = true

    const waitForContainer = (attempt = 0) => {
      if (!isActive) {
        return
      }
      const container = document.getElementById('kakao-map')
      if (container) {
        const rect = container.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          initializeMap()
          return
        }
      }

      if (attempt < 10) {
        requestAnimationFrame(() => {
          setTimeout(() => waitForContainer(attempt + 1), 50)
        })
      }
    }

    const initializeMap = () => {
      const container = document.getElementById('kakao-map')
      if (!container || !window.kakao?.maps || !isActive) {
        return
      }

      const { maps } = window.kakao
      const map = new maps.Map(container, {
        center: new maps.LatLng(35.194, 129.125),
        level: mapDefaults.level,
      })
      mapRef.current = map
      const zoomControl = new maps.ZoomControl()
      map.addControl(zoomControl, maps.ControlPosition.RIGHT)
      const geocoder = new maps.services.Geocoder()

      geocoder.addressSearch(locationInfo.address, (result, status) => {
        if (status !== maps.services.Status.OK || !result[0] || !isActive) {
          return
        }
        const lat = Number(result[0].y)
        const lng = Number(result[0].x)
        const coords = new maps.LatLng(lat, lng)
        const marker = new maps.Marker({ map, position: coords })
        const infoWindow = new maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;">${locationInfo.name}</div>`,
        })

        map.setCenter(coords)
        map.relayout()
        infoWindow.open(map, marker)
        setMapCenter({ lat, lng })
      })
    }

    loadKakaoMapScript()
        .then(() => {
          if (!isActive || !window.kakao?.maps) {
            return
          }
          window.kakao.maps.load(() => {
            waitForContainer()
          })
        })
        .catch(() => {
          // Fail silently to avoid breaking the page if the map script is blocked.
        })

      return () => {
        isActive = false
        mapRef.current = null
      }
    }, [currentSubPage])

  const content = contentMap[currentSubPage] || contentMap['연구소 소개']

  return (
    <PageLayout
      title="연구소 소개"
      menuItems={menuItems}
      currentSubPage={currentSubPage}
      onSubPageChange={setCurrentSubPage}
      bannerImage="intro"
      subPageRoutes={subPageRoutes}
    >
      {currentSubPage === '오시는 길' ? (
        <LocationSection mapCenter={mapCenter} onResetMap={handleResetMap} />
      ) : currentSubPage === '연혁' ? (
        <HistorySection />
      ) : currentSubPage === '주요활동' ? (
        <ActivitySection />
      ) : (
        <TextSection title={content.title} text={content.text} />
      )}
    </PageLayout>
  )
}

function TextSection({ title, text }: { title: string; text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean)

  return (
    <div className="max-w-5xl">
      <h1 className="mb-8 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
        {title}
      </h1>
      {paragraphs.length > 0 && (
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 sm:text-base">
          {paragraphs.map((paragraph, index) => (
            <p key={`${title}-${index}`} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function HistorySection() {
  return (
    <div className="max-w-6xl space-y-10">
      <div>
        <h1 className="mb-4 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
          연혁
        </h1>
        <p className="text-sm text-gray-600">2007-2026년까지의 SOCIONET 논문과 저널</p>
      </div>

      {historyTables.map((table) => {
        const displayColumns = table.columns.filter((column) => column.key !== 'no')
        return (
          <section key={table.title} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{table.title}</h2>

            <div className="space-y-4 sm:hidden">
              {table.rows.map((row, rowIndex) => (
                <div key={`${table.title}-mobile-${rowIndex}`} className="rounded-md border border-gray-200 bg-white p-4">
                  <div className="space-y-2 text-sm text-gray-700">
                    {displayColumns.map((column) => (
                      <div key={`${table.title}-${rowIndex}-${column.key}`} className="flex gap-3">
                        <span className="w-20 shrink-0 text-xs font-semibold text-gray-500">{column.label}</span>
                        <span className="flex-1">{row[column.key] ?? ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-md border border-gray-200 sm:block">
              <table className="min-w-full divide-y divide-gray-200 text-[13px]">
                <thead className="bg-gray-50">
                  <tr>
                    {displayColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700 ${
                          column.align === 'center' ? 'text-center' : ''
                        } ${
                          column.key === 'author' ? 'min-w-[160px]' : ''
                        } ${
                          column.key === 'type' && table.title === '저널중심' ? 'min-w-[120px]' : ''
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {table.rows.map((row, rowIndex) => (
                    <tr key={`${table.title}-${rowIndex}`}>
                      {displayColumns.map((column) => (
                        <td
                          key={`${table.title}-${rowIndex}-${column.key}`}
                          className={`px-4 py-3 align-top text-gray-700 ${
                            column.align === 'center' ? 'text-center' : ''
                          } ${
                            column.key === 'author' ? 'min-w-[160px]' : ''
                          } ${
                            column.key === 'type' && table.title === '저널중심' ? 'min-w-[120px]' : ''
                          }`}
                        >
                          {row[column.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ActivitySection() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="mb-4 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
          주요활동
        </h1>
        <p className="text-sm text-gray-600">2023-2025년까지 3년간</p>
      </div>

      <div className="hidden overflow-hidden rounded-md border border-gray-200 bg-white sm:block">
        <table className="min-w-full divide-y divide-gray-200 text-[13px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-20 whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                연도
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">내용</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activityItems.map((item, index) => (
              <tr key={`${item.year}-${index}`}>
                <td className="px-4 py-3 align-top text-gray-700">{item.year}</td>
                <td className="px-4 py-3 align-top text-gray-700">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {activityItems.map((item, index) => (
          <div key={`${item.year}-mobile-${index}`} className="rounded-md border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500">{item.year}</p>
            <p className="mt-2 text-sm text-gray-700">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LocationSection({
  mapCenter,
  onResetMap,
}: {
  mapCenter: { lat: number; lng: number } | null
  onResetMap: () => void
}) {
  const sections = useMemo(
    () => [
      {
        title: '자가이용',
        icon: Car,
        groups: [
          {
            label: '주요 경로',
            items: [
              '송정해수욕장 입구에서 기장 해안도로 용궁사 방향으로 좌회전 후 첫신호등 (CU편의점)에서 좌회전',
              '송정해수욕장 입구에서 기장 해안도로 용궁사 방향으로 좌회전 후 첫번째 신호등에서 좌회전(스타벅스 길 건너편)',
            ],
          },
          {
            label: '소요 시간',
            items: [
              '송정해수욕장 입구에서 걸어서 5분, 해운대 해수욕장에서 승용차로 10분, 광안리 해수욕장에서 승용차로 20분',
              '부산역에서 승용차로 40분, 남포동에서 승용차로 45분(광안대교 경유)',
              '부산김해공항에서 승용차로 50분, 부산종합버스터미널(노포동)에서 승용차로 40분',
            ],
          },
        ],
      },
      {
        title: '버스이용',
        icon: Bus,
        groups: [
          {
            label: '버스만 이용',
            items: [
              '100번, 181번, 185번 버스, 해운대 9번 마을버스 - 공수마을 버스 정류소 하차(정류장에서 영산대학교 해운대캠퍼스 안내 확인 가능)',
            ],
          },
          {
            label: '버스와 도보 이용',
            items: [
              '38번, 39번, 40번, 63번, 100-1번, 139번, 140번, 141번, 180번, 182번, 183번, 200번, 직행 1001번, 1003번, 1011번 버스',
              '송정1단지 혹은 송정해수욕장입구 정류소 하차 후 100번, 181번, 185번 환승 또는 10분 도보(택시 기본요금)',
            ],
          },
          {
            label: '해운대역 버스정류소에서 오시는 경우',
            items: [
              '택시 이용시 약 15분, 대략 6,000원',
              '버스 이용시 해운대역 7번 출구로 나와서 버스정류소에서 100번, 181번, 해운대구 9번 마을버스 승차 후 공수마을 하차',
            ],
          },
          {
            label: '부산종합버스터미널(노포동)에서 오시는 경우',
            items: [
              '택시 이용시 41분 소요, 대략 19,500원',
              '전철과 버스 이용시: 지하철 1호선(노포역) - 3호선(연산역) - 2호선(해운대역) 하차 - 해운대역 7번 출구',
              '해운대역 버스정류소에서 버스(100번, 181번, 해운대구 9번 마을버스) 승차 후 공수마을 버스정류소 하차',
            ],
          },
          {
            label: '사상(서부)시외버스터미널에서 오시는 경우',
            items: [
              '택시 이용시 48분 소요, 대략 22,600원',
              '전철과 버스 이용시: 지하철 2호선(사상역) - 2호선(해운대역) 하차 - 해운대역 7번 출구',
              '해운대역 버스정류소에서 버스(100번, 181번, 해운대구 9번 마을버스) 승차 후 공수마을 버스정류소 하차',
            ],
          },
        ],
      },
      {
        title: '열차이용',
        icon: Train,
        groups: [
          {
            label: '부산역',
            items: [
              '택시 이용시 약 39분, 대략 17,600원',
              '버스 이용시 40번, 141번, 1001번, 1003번 승차, 송정해수욕장입구 정류소 하차 후 (100번, 181번, 185번 버스) 환승, 공수마을 하차',
            ],
          },
          {
            label: '신해운대역',
            items: [
              '택시 이용시 약 5분, 대략 3,500원',
              '버스 이용시 청강리행 139번 승차, 송정1단지 버스정류소 하차 후 (100번, 181번, 185번 버스) 환승, 공수마을 하차',
            ],
          },
        ],
      },
    ],
    [],
  )

  const kakaoMapLink = useMemo(() => {
    if (mapCenter) {
      return `https://map.kakao.com/link/map/${encodeURIComponent(locationInfo.name)},${mapCenter.lat},${mapCenter.lng}`
    }
    return `https://map.kakao.com/link/search/${encodeURIComponent(locationInfo.address)}`
  }, [mapCenter])

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="mb-4 border-b-2 border-gray-200 pb-4 text-3xl font-bold text-gray-900">
          오시는 길
        </h1>
        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MapPin className="h-5 w-5 text-gray-700" />
            <span>{locationInfo.name}</span>
          </div>
          <p>{locationInfo.address}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-md border border-gray-200">
        <div id="kakao-map" className="h-80 w-full" />
        <button
          type="button"
          onClick={onResetMap}
          className="absolute right-3 top-3 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-300"
        >
          초기화
        </button>
      </div>
      <div>
        <a
          href={kakaoMapLink}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          카카오맵에서 위치 보기
        </a>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <section key={section.title} className="rounded-md border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="mt-4 space-y-4">
                {section.groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-sm font-semibold text-gray-900">{group.label}</p>
                    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-gray-700">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
