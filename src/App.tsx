import { useEffect, useState } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Footer from './components/Footer'
import { fetchMe } from './lib/api'
import SignupPage from './pages/SignupPage'
import OnlineEducationPage from './pages/OnlineEducationPage'
import IntroductionPage from './pages/IntroductionPage'
import UnderstandingPage from './pages/UnderstandingPage'
import TestPage from './pages/TestPage'
import CommunityPage from './pages/CommunityPage'
import CommunityPostPage from './pages/CommunityPostPage'
import CounselingPage from './pages/CounselingPage'
import ResourcesPage from './pages/ResourcesPage'
import AdminPage from './pages/AdminPage'
import logoSrc from './assets/logo.avif'
import sidebarLogoSrc from './assets/Logo_2.png'

function DefaultLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto w-full max-w-[90rem] px-6">
        <div className="grid gap-6 lg:grid-cols-[clamp(8rem,12vw,10rem)_minmax(0,1fr)]">
          <aside className="hidden lg:block lg:-ml-6">
            <div className="sticky top-28">
              <Sidebar logoSrc={sidebarLogoSrc} />
            </div>
          </aside>
          <div className="min-w-0 pb-10">
            <Header
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              logoSrc={logoSrc}
            />
            <div className="mb-4">
              <Navigation
                isMobileMenuOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </div>
            <main className="min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function OnlineEducationRoute() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'blocked'>(
    'checking',
  )

  useEffect(() => {
    let isMounted = true
    fetchMe()
      .then(() => {
        if (isMounted) {
          setAuthStatus('authorized')
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthStatus('blocked')
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (authStatus === 'blocked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900">{'\ub85c\uadf8\uc778 \ud544\uc694'}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {'\uc628\ub77c\uc778 \uad50\uc721\uc740 \ub85c\uadf8\uc778 \ud6c4 \uc774\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-5 w-full rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            {'\ud648\uc73c\ub85c'}
          </button>
        </div>
      </div>
    )
  }

  if (authStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">{'\ud655\uc778 \uc911...'} </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <OnlineEducationPage onBack={() => navigate('/')} />
    </div>
  )
}

function SignupRoute() {
  const navigate = useNavigate()
  return <SignupPage onBack={() => navigate('/')} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route index element={<MainContent currentPage="" currentSubPage="" />} />
          <Route path="intro" element={<IntroductionPage subPage="인사말" />} />
          <Route path="intro/greeting" element={<IntroductionPage subPage="인사말" />} />
          <Route path="intro/history" element={<IntroductionPage subPage="연혁" />} />
          <Route path="intro/activities" element={<IntroductionPage subPage="주요활동" />} />
          <Route path="intro/location" element={<IntroductionPage subPage="오시는 길" />} />
          <Route path="understanding" element={<UnderstandingPage subPage="SOCIOMETRY" />} />
          <Route path="understanding/sociometry" element={<UnderstandingPage subPage="SOCIOMETRY" />} />
          <Route path="understanding/about" element={<UnderstandingPage subPage="SOCIONET에 대하여" />} />
          <Route path="understanding/sna" element={<UnderstandingPage subPage="SOCIAL NETWORK ANALYSIS" />} />
          <Route path="understanding/korea" element={<UnderstandingPage subPage="한국과 SOCIONET" />} />
          <Route path="understanding/application" element={<UnderstandingPage subPage="SOCIONET 활용" />} />
          <Route path="test" element={<TestPage subPage="검사신청" />} />
          <Route path="test/application" element={<TestPage subPage="검사신청" />} />
          <Route path="test/target" element={<TestPage subPage="검사대상" />} />
          <Route path="test/notice" element={<TestPage subPage="유의사항" />} />
          <Route path="test/education" element={<TestPage subPage="수련교육과정" />} />
          <Route path="test/education/beginner" element={<TestPage subPage="초급 SOCIONET" />} />
          <Route path="test/education/intermediate" element={<TestPage subPage="중급 SOCIONET" />} />
          <Route path="test/education/advanced" element={<TestPage subPage="고급 SOCIONET" />} />
          <Route path="test/education/instructor" element={<TestPage subPage="일반강사과정" />} />
          <Route path="community" element={<CommunityPage subPage="공지사항" />} />
          <Route path="community/notice" element={<CommunityPage subPage="공지사항" />} />
          <Route path="community/activity" element={<CommunityPage subPage="커뮤니티 활동" />} />
          <Route path="community/open" element={<CommunityPage subPage="열린마당" />} />
          <Route path="community/faq" element={<CommunityPage subPage="Q & A / FAQ" />} />
          <Route path="community/socionet-study" element={<CommunityPage subPage="SOCIONET 연구모임" />} />
          <Route path="community/counseling-study" element={<CommunityPage subPage="일반상담 연구모임" />} />
          <Route path="community/posts/:id" element={<CommunityPostPage />} />
          <Route path="counseling" element={<CounselingPage subPage="아동청소년 상담" />} />
          <Route path="counseling/test/child" element={<CounselingPage subPage="아동 심리검사" />} />
          <Route path="counseling/test/youth" element={<CounselingPage subPage="청소년 심리검사" />} />
          <Route path="counseling/test/adult" element={<CounselingPage subPage="성인심리검사" />} />
          <Route path="counseling/test/general" element={<CounselingPage subPage="종합 심리검사" />} />
          <Route path="counseling/youth" element={<CounselingPage subPage="아동청소년 상담" />} />
          <Route path="counseling/family" element={<CounselingPage subPage="부부 및 가족상담" />} />
          <Route path="counseling/career" element={<CounselingPage subPage="학습 진로상담" />} />
          <Route path="counseling/corporate" element={<CounselingPage subPage="기업상담" />} />
          <Route path="counseling/retiree" element={<CounselingPage subPage="은퇴자 상담" />} />
          <Route path="counseling/tgroup" element={<CounselingPage subPage="감수성 훈련" />} />
          <Route path="resources" element={<ResourcesPage subPage="논문" />} />
          <Route path="resources/papers" element={<ResourcesPage subPage="논문" />} />
          <Route path="resources/publications" element={<ResourcesPage subPage="출판물" />} />
          <Route path="resources/books" element={<ResourcesPage subPage="추천도서" />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="online-education" element={<OnlineEducationRoute />} />
        <Route path="signup" element={<SignupRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
