// "use client" 지시어는 이 파일이 클라이언트 컴포넌트(Client Component)임을 명시합니다.
// Next.js 13버전 이상의 App Router에서는 기본적으로 모든 컴포넌트가 서버 컴포넌트(Server Component)로 동작합니다.
// 하지만 useState, useEffect, 이벤트 핸들러(onClick 등)와 같이 브라우저 환경에 의존적인 기능들은 클라이언트 컴포넌트에서만 사용할 수 있습니다.
// 이 컴포넌트는 사용자의 입력(state)과 클릭 이벤트(event handler)를 처리하므로 "use client"를 선언해야 합니다.
"use client";

// 'lucide-react'는 가볍고 일관성 있는 디자인의 SVG 아이콘을 제공하는 라이브러리입니다.
// 필요한 아이콘들을 개별적으로 import하여 사용합니다.
import {
  ArrowLeft, // '뒤로 가기' 버튼에 사용될 왼쪽 화살표 아이콘
  ArrowRight, // '다음' 버튼에 사용될 오른쪽 화살표 아이콘
  AlertCircle, // 오류 메시지를 표시할 때 사용될 경고 아이콘
  User, // 현재 입력 필드가 '이름'에 관한 것임을 나타내는 사용자 아이콘
} from "lucide-react";

// NameInput 컴포넌트를 정의하고 export 합니다. 이 컴포넌트는 외부에서 재사용될 수 있습니다.
// props로 5개의 값을 전달받습니다:
// - userName: 현재 입력된 사용자 이름의 값 (상태)
// - setUserName: 사용자 이름 상태를 업데이트하는 함수
// - onSubmit: '다음' 버튼을 클릭하거나 Enter 키를 눌렀을 때 실행될 함수
// - onBack: '뒤로' 버튼을 클릭했을 때 실행될 함수
// - error: 유효성 검사 실패 시 표시할 오류 메시지 문자열 (optional)
export default function NameInput({
  userName,
  setUserName,
  onSubmit,
  onBack,
  error,
}) {
  return (
    // 최상위 div 컨테이너입니다. 카드 형태의 UI를 구성합니다.
    // Tailwind CSS 클래스 설명:
    // - group: 자식 요소에서 group-hover와 같은 상태 의존적 스타일을 사용할 수 있게 해줍니다. 이 div에 마우스를 올리면 자식 요소들의 스타일이 바뀔 수 있습니다.
    // - relative: 자식 요소 중 absolute 포지션을 가진 요소의 기준점이 됩니다.
    // - overflow-hidden: 자식 요소가 이 div의 경계를 벗어날 경우, 벗어난 부분은 보이지 않게 처리합니다. rounded-2xl로 적용된 둥근 모서리 밖으로 내용이 삐져나가지 않도록 합니다.
    // - rounded-2xl: 매우 둥근 모서리를 적용합니다.
    // - bg-white/80: 80% 불투명도의 흰색 배경을 적용합니다.
    // - shadow-xl: 큰 그림자 효과를 적용하여 입체감을 줍니다.
    // - ring-1 ring-slate-200/50: 1px 두께의 연한 회색 테두리(ring)를 추가합니다.
    // - backdrop-blur-sm: 배경이 비치는 부분에 흐림(blur) 효과를 적용하여 유리 같은 느낌을 줍니다. (bg-white/80과 함께 사용)
    // - transition-all duration-500: 모든 CSS 속성 변경(예: 그림자, 테두리 색상)이 0.5초 동안 부드럽게 전환되도록 합니다.
    // - hover:shadow-2xl hover:ring-slate-300/50: 마우스를 올렸을 때(hover) 그림자를 더 진하게, 테두리 색상을 약간 더 어둡게 변경합니다.
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:ring-slate-300/50">
      {/* 이 div는 배경에 미묘한 그라데이션 효과를 주기 위해 존재합니다. */}
      {/* - absolute inset-0: 부모 요소(relative 속성을 가진)를 기준으로, 상하좌우 모든 방향으로 꽉 채워 위치합니다. */}
      {/* - bg-gradient-to-r from-blue-500/5 to-indigo-500/5: 오른쪽 방향으로 흐르는 미세한(5% 불투명도) 파란색 계열 그라데이션 배경을 적용합니다. */}
      {/* - opacity-0: 기본적으로는 투명하여 보이지 않습니다. */}
      {/* - transition-opacity duration-500: 투명도(opacity)가 0.5초에 걸쳐 부드럽게 변하도록 설정합니다. */}
      {/* - group-hover:opacity-100: 부모 요소(group 클래스를 가진)에 마우스를 올렸을 때, 이 div의 투명도를 100%로 만들어 그라데이션이 보이게 합니다. */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* 실제 컨텐츠가 담기는 부분입니다. */}
      {/* - relative: 배경 그라데이션 div 위에 컨텐츠가 오도록 z-index 스태킹 컨텍스트를 만듭니다. */}
      {/* - p-12: 모든 방향에 큰 패딩을 적용하여 내부 여백을 만듭니다. */}
      {/* - text-center: 내부 텍스트들을 중앙 정렬합니다. */}
      <div className="relative p-12 text-center">
        {/* 사용자 아이콘을 감싸는 섹션입니다. */}
        <div className="mb-8">
          {/* 사용자 아이콘을 담는 원형 배경 div입니다. */}
          {/* - mx-auto: 수평 중앙 정렬을 합니다. */}
          {/* - mb-6: 아래쪽에 마진을 추가합니다. */}
          {/* - flex ... items-center justify-center: 내부 아이콘을 수직, 수평 중앙에 위치시킵니다. */}
          {/* - h-20 w-20: 가로, 세로 크기를 20으로 고정합니다. */}
          {/* - rounded-2xl: 둥근 모서리를 적용합니다. */}
          {/* - bg-gradient-to-br ...: 오른쪽 아래 방향으로 흐르는 파란색-남색 그라데이션 배경을 적용합니다. */}
          {/* - shadow-lg: 큰 그림자 효과를 줍니다. */}
          {/* - transition-transform duration-300: transform 속성(예: scale)이 0.3초 동안 부드럽게 변하도록 합니다. */}
          {/* - group-hover:scale-110: 부모 카드(group)에 마우스를 올리면 이 아이콘 배경이 1.1배 커지는 효과를 줍니다. */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
            {/* User 아이콘 컴포넌트입니다. */}
            {/* - h-10 w-10: 아이콘의 크기를 설정합니다. */}
            {/* - text-white: 아이콘의 색상을 흰색으로 설정합니다. */}
            <User className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* 메인 질문 텍스트입니다. */}
        {/* - mb-4: 아래쪽 마진. */}
        {/* - text-2xl: 큰 글자 크기. */}
        {/* - font-semibold: 글자 두께를 보통보다 약간 두껍게. */}
        {/* - text-slate-800: 진한 회색 텍스트 색상. */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          이름을 입력해주세요
        </h2>
        {/* 보조 안내 텍스트입니다. */}
        {/* - mb-8: 아래쪽 마진. */}
        {/* - leading-relaxed: 줄 간격을 넓게 설정합니다. */}
        {/* - text-slate-600: 중간 톤의 회색 텍스트 색상. */}
        {/* - &apos;: JSX에서 아포스트로피(')를 안전하게 렌더링하기 위한 HTML 엔티티입니다. */}
        <p className="mb-8 leading-relaxed text-slate-600">
          WHAT&apos;S YOUR NAME?
        </p>

        {/* input 필드를 감싸는 div입니다. */}
        {/* - mx-auto: 수평 중앙 정렬. */}
        {/* - mb-8: 아래쪽 마진. */}
        {/* - max-w-md: 최대 너비를 중간 크기(md)로 제한하여 너무 넓어지는 것을 방지합니다. */}
        <div className="mx-auto mb-8 max-w-md">
          <input
            type="text" // 입력 필드의 타입을 텍스트로 지정합니다.
            value={userName} // input의 값을 부모로부터 받은 userName state와 동기화합니다(제어 컴포넌트).
            // 사용자가 입력할 때마다 호출되는 이벤트 핸들러입니다.
            // event 객체(e)에서 입력된 값(e.target.value)을 가져와
            // 부모로부터 받은 setUserName 함수를 호출하여 상태를 업데이트합니다.
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력하세요" // 입력 필드가 비어 있을 때 표시될 안내 문구입니다.
            // input 필드의 스타일을 지정하는 Tailwind CSS 클래스입니다.
            // - w-full: 컨테이너의 전체 너비를 차지합니다.
            // - rounded-xl: 둥근 모서리.
            // - border-2 border-slate-200: 2px 두께의 연한 회색 테두리.
            // - px-4 py-3: 수평, 수직 패딩.
            // - text-lg: 큰 글자 크기.
            // - transition-colors: 색상 관련 속성(예: border-color) 변경 시 부드러운 전환 효과를 줍니다.
            // - focus:border-blue-500: input에 포커스(클릭하여 활성화)되었을 때 테두리 색을 파란색으로 변경합니다.
            // - focus:outline-none: 브라우저가 기본으로 제공하는 포커스 테두리(outline)를 제거합니다.
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
            // 키보드 키가 눌렸을 때 발생하는 이벤트 핸들러입니다.
            onKeyPress={(e) => {
              // 만약 눌린 키가 'Enter' 키라면,
              if (e.key === "Enter") {
                // 부모로부터 받은 onSubmit 함수를 실행합니다.
                // 이를 통해 사용자는 버튼을 클릭하는 대신 Enter 키로도 폼을 제출할 수 있습니다.
                onSubmit();
              }
            }}
          />
        </div>

        {/* 오류 메시지 표시 영역입니다. */}
        {/* - {error && ...}: 'error' prop에 값이 있을 때(true일 때)만 이 JSX 블록을 렌더링합니다(조건부 렌더링). */}
        {error && (
          // 오류 메시지를 감싸는 컨테이너 div입니다.
          // - mb-6: 아래쪽 마진.
          // - rounded-xl: 둥근 모서리.
          // - border border-red-200: 연한 빨간색 테두리.
          // - bg-red-50: 매우 연한 빨간색 배경.
          // - p-4: 패딩.
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            {/* 아이콘과 텍스트를 나란히 배치하기 위한 flex 컨테이너입니다. */}
            {/* - flex items-start: 자식 요소들을 flexbox로 만들고, 수직 상단 정렬합니다. */}
            {/* - space-x-3: 자식 요소들 사이에 수평 간격을 줍니다. */}
            <div className="flex items-start space-x-3">
              {/* 오류 아이콘입니다. */}
              {/* - mt-0.5: 위쪽 마진을 약간 주어 텍스트와 정렬을 맞춥니다. */}
              {/* - h-5 w-5: 아이콘 크기. */}
              {/* - flex-shrink-0: 공간이 부족할 때 아이콘이 줄어들지 않도록 합니다. */}
              {/* - text-red-500: 아이콘 색상을 빨간색으로 지정합니다. */}
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                {/* 오류 제목 */}
                <h3 className="font-medium text-red-800">오류 발생</h3>
                {/* 실제 오류 메시지 내용. error prop으로 전달된 문자열이 여기에 표시됩니다. */}
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* '뒤로', '다음' 버튼을 담는 컨테이너입니다. */}
        {/* - flex items-center justify-center: 버튼들을 수직, 수평 중앙에 배치합니다. */}
        {/* - space-x-4: 버튼들 사이에 수평 간격을 줍니다. */}
        <div className="flex items-center justify-center space-x-4">
          {/* '뒤로' 버튼입니다. */}
          <button
            onClick={onBack} // 클릭 시 부모로부터 받은 onBack 함수를 실행합니다.
            // 버튼 스타일링 클래스입니다.
            // - inline-flex items-center: 내부 아이콘과 텍스트를 수직 중앙 정렬합니다.
            // - space-x-2: 아이콘과 텍스트 사이에 간격을 줍니다.
            // - rounded-xl, border-2, bg-white, px-6 py-3, text-slate-700, shadow-sm: 기본적인 버튼 스타일 (둥근 모서리, 테두리, 배경색, 패딩, 글자색, 그림자).
            // - transition-all duration-200: 모든 속성 변경이 0.2초 동안 부드럽게 전환됩니다.
            // - hover:border-slate-400 hover:bg-slate-50: 마우스를 올리면 테두리와 배경색이 약간 어두워집니다.
            // - active:scale-95: 버튼을 클릭하고 있는 동안(active) 크기를 95%로 약간 줄여 클릭 피드백을 줍니다.
            className="inline-flex items-center space-x-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> {/* 왼쪽 화살표 아이콘 */}
            <span>뒤로</span>
          </button>
          {/* '다음' 버튼 (메인 액션 버튼) */}
          <button
            onClick={onSubmit} // 클릭 시 부모로부터 받은 onSubmit 함수를 실행합니다.
            // 버튼 스타일링 클래스입니다.
            // - inline-flex ...: '뒤로' 버튼과 동일한 역할.
            // - rounded-xl, px-8 py-4, text-white, shadow-lg: 기본적인 스타일. '뒤로' 버튼보다 패딩이 더 크고, 그림자가 더 진합니다.
            // - bg-gradient-to-r from-blue-600 to-indigo-600: 파란색 계열의 그라데이션 배경을 적용하여 주요 버튼임을 강조합니다.
            // - transition-all duration-300: 모든 속성 변경이 0.3초 동안 전환됩니다.
            // - hover:scale-105 hover:shadow-xl: 마우스를 올리면 버튼이 1.05배 커지고 그림자가 더 진해집니다.
            // - active:scale-95: 클릭 시 크기를 줄여 피드백을 줍니다.
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <span className="font-medium">다음</span>
            <ArrowRight className="h-4 w-4" /> {/* 오른쪽 화살표 아이콘 */}
          </button>
        </div>
      </div>
    </div>
  );
}