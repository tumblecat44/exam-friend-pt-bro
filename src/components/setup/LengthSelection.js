// 이 파일은 클라이언트 컴포넌트임을 명시합니다.
// Next.js의 App Router 환경에서는 "use client" 선언이 없으면 서버 컴포넌트로 간주됩니다.
"use client";

// UI 아이콘을 위한 lucide-react에서 필요한 아이콘 컴포넌트를 가져옵니다.
import { ArrowLeft, ArrowRight, AlertCircle, BookOpen } from "lucide-react";

// LengthSelection 컴포넌트 정의
// props를 통해 외부에서 길이 옵션, 선택된 길이, 길이 선택 함수, 뒤로가기 및 제출 함수, 에러 메시지를 받아옵니다.
export default function LengthSelection({
  lengthOptions,        // 선택할 수 있는 문제 길이 옵션 목록 (예: 짧음, 중간, 김)
  selectedLength,       // 현재 선택된 길이 옵션의 ID
  setSelectedLength,    // 사용자가 길이를 선택할 때 상태를 업데이트하는 함수
  onSubmit,             // '다음' 버튼 클릭 시 실행되는 함수
  onBack,               // '뒤로' 버튼 클릭 시 실행되는 함수
  error,                // 유효하지 않은 입력 등에 대한 오류 메시지
}) {
  return (
    // 카드 형태의 UI 전체 컨테이너
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:ring-slate-300/50">
      
      {/* 배경에 은은한 그라데이션 효과 (hover 시 살짝 강조됨) */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* 콘텐츠 영역 */}
      <div className="relative p-12 text-center">
        
        {/* 상단 아이콘 (책 아이콘, 시각적으로 인상적인 요소) */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* 제목 */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          문제 길이를 선택해주세요
        </h2>

        {/* 간단한 설명 문구 */}
        <p className="mb-8 leading-relaxed text-slate-600">
          원하는 퀴즈 길이를 선택하세요.
        </p>

        {/* 길이 선택 버튼들 영역 */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {lengthOptions.map((option) => (
              <button
                key={option.id} // React에서 각 요소를 고유하게 식별하기 위한 key
                onClick={() => setSelectedLength(option.id)} // 클릭 시 선택된 길이로 설정
                className={`rounded-xl border-2 p-6 transition-all duration-200 hover:scale-105 ${
                  selectedLength === option.id
                    // 선택된 상태일 때 스타일 강조 (파란색 배경 + 텍스트 흰색)
                    ? `border-blue-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
                    // 선택되지 않은 상태일 때 기본 스타일
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="text-center">
                  {/* 옵션 제목 */}
                  <h3
                    className={`mb-2 text-lg font-semibold ${
                      selectedLength === option.id
                        ? "text-white"
                        : "text-slate-800"
                    }`}
                  >
                    {option.label}
                  </h3>
                  {/* 옵션 설명 */}
                  <p
                    className={`text-sm ${
                      selectedLength === option.id
                        ? "text-white/90"
                        : "text-slate-600"
                    }`}
                  >
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 표시 영역 (선택하지 않고 제출했을 경우 등) */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">오류 발생</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼: 뒤로 / 다음 */}
        <div className="flex items-center justify-center space-x-4">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>뒤로</span>
          </button>

          {/* 다음 단계로 이동 버튼 */}
          <button
            onClick={onSubmit}
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <span className="font-medium">다음</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
