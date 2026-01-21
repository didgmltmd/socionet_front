export default function Footer() {
  return (
    <footer className="border-t-4 border-teal-600 bg-gray-800 text-gray-300">
      <div className="mx-auto w-full max-w-[90rem] px-6">
        <div className="py-8 sm:py-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div>
              <h3 className="text-lg font-bold text-white lg:text-xl">
                (주) SOCIONET / 한국 SOCIONET 연구소
              </h3>
              <p className="mt-3 text-sm text-gray-300">
                안이환 CEO/소장
              </p>
              <p className="text-sm text-gray-400">
                (전) 부산교육대학교 상담교육학과 교수
              </p>
              <p className="mt-4 text-sm text-gray-400">
                (현) (주) SOCIONET 부설 / 한국 SOCIONET 연구소
              </p>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white lg:mb-4 lg:text-xl">
                <span className="h-6 w-1 bg-teal-500"></span>
                연락처
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>M. 010-6563-7308</p>
                <p>E. ksocionet@gmail.com / ksocionet@naver.com</p>
                <p>https://www.ksocionet.com</p>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                48015 부산광역시 해운대구 반송순환로 142, M동 9층 903호
                (반송동, 영산대학교 해운대캠퍼스)
              </p>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white lg:mb-4 lg:text-xl">
                <span className="h-6 w-1 bg-orange-500"></span>
                심리검사 및 상담
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  심리검사: Socionet집단검사, 성격검사, 투사, 지능검사,
                  진로검사
                </p>
                <p>
                  심리상담: 개인, 집단상담, 가족, 청소년상담, 미술상담,
                  진로, 은퇴상담
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-700 pt-4 text-center lg:mt-8 lg:pt-6">
            <p className="text-xs text-gray-400 sm:text-sm">
              © 2026 SOCIONET. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
