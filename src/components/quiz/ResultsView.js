// "use client" 지시어는 이 컴포넌트가 서버가 아닌 클라이언트(사용자의 브라우저)에서 렌더링되고 실행되어야 함을 Next.js에 알립니다.
// 이를 통해 useState, useEffect와 같은 React 훅과 이벤트 핸들러(예: onClick)를 사용할 수 있습니다.
"use client";

// lucide-react 라이브러리에서 아이콘 컴포넌트들을 가져옵니다.
// 이 아이콘들은 SVG 기반으로 가볍고 커스터마이징이 쉽습니다.
import { CheckCircle, BookOpen, RotateCcw, Send, Check } from "lucide-react";

// ResultsView 컴포넌트를 정의합니다. 이 컴포넌트는 퀴즈 결과를 표시하는 UI를 담당합니다.
// 부모 컴포넌트로부터 여러 props(속성)를 전달받아 동적으로 화면을 구성하고 상호작용을 처리합니다.
export default function ResultsView({
  questions, // 퀴즈에 사용된 모든 질문 객체의 배열입니다. 총 문제 수를 계산하는 데 사용됩니다.
  calculateScore, // 최종 점수를 계산하는 함수입니다.
  getScoreColor, // 점수에 따라 다른 Tailwind CSS 색상 클래스를 반환하는 함수입니다 (예: 'text-green-500').
  getScoreMessage, // 점수에 따라 격려 메시지를 반환하는 함수입니다.
  getCorrectAnswersCount, // 정답 개수를 계산하여 반환하는 함수입니다.
  getIncorrectAnswersCount, // 오답 개수를 계산하여 반환하는 함수입니다.
  setShowReview, // 오답 확인 화면을 보여줄지 여부를 결정하는 상태를 변경하는 함수입니다.
  isSendingToDiscord, // 퀴즈 결과를 서버(Discord)로 전송 중인지 여부를 나타내는 boolean 값입니다.
  discordSent, // 퀴즈 결과가 서버(Discord)로 성공적으로 전송되었는지 여부를 나타내는 boolean 값입니다.
  resetQuiz, // 퀴즈를 초기화하고 새로운 문제로 다시 시작하는 함수입니다.
  userComment, // 사용자가 입력한 의견을 저장하는 상태 변수입니다.
  setUserComment, // userComment 상태를 업데이트하는 함수입니다.
  handleNameSubmit, // 사용자가 Enter 키를 눌렀을 때 의견을 제출하는 함수입니다. (주: 버튼의 onClick은 uploadComment를 사용)
  uploadComment, // '보내기' 버튼을 클릭했을 때 의견을 서버로 업로드하는 함수입니다.
  isSendingToCommentDiscord, // 사용자 의견을 서버로 전송 중인지 여부를 나타내는 boolean 값입니다.
  commentDiscordSent, // 사용자 의견이 성공적으로 전송되었는지 여부를 나타내는 boolean 값입니다.
}) {
  // 컴포넌트가 렌더링할 JSX를 반환합니다.
  return (
    // 전체 컨테이너 div 입니다.
    // p-12: 모든 방향으로 3rem (48px)의 패딩을 적용합니다.
    // text-center: 내부 텍스트를 중앙 정렬합니다.
    <div className="p-12 text-center">
      {/* 퀴즈 완료 아이콘 섹션 */}
      {/* 
        mx-auto: 수평 방향으로 중앙 정렬 (margin-left: auto; margin-right: auto;).
        mb-8: 아래쪽 마진을 2rem (32px) 줍니다.
        flex: Flexbox 레이아웃을 사용합니다.
        h-20 w-20: 높이와 너비를 각각 5rem (80px)으로 설정합니다.
        items-center: Flexbox 아이템들을 수직 중앙 정렬합니다.
        justify-center: Flexbox 아이템들을 수평 중앙 정렬합니다.
        rounded-full: 테두리를 완전히 둥글게 만들어 원 형태로 만듭니다.
        bg-gradient-to-br: 오른쪽 아래(bottom-right) 방향으로 그라데이션 배경을 적용합니다.
        from-emerald-500 to-teal-600: 그라데이션의 시작색(에메랄드)과 끝색(틸)을 지정합니다.
        shadow-lg: 큰 그림자 효과를 적용합니다.
      */}
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
        {/* CheckCircle 아이콘 */}
        {/* h-10 w-10: 높이와 너비를 2.5rem (40px)으로 설정합니다. */}
        {/* text-white: 아이콘 색상을 흰색으로 지정합니다. */}
        <CheckCircle className="h-10 w-10 text-white" />
      </div>

      {/* 퀴즈 완료 타이틀 */}
      {/* 
        mb-6: 아래쪽 마진을 1.5rem (24px) 줍니다.
        text-3xl: 폰트 크기를 1.875rem (30px)으로 설정합니다.
        font-bold: 폰트 두께를 굵게 설정합니다.
        text-slate-800: 텍스트 색상을 진한 회색으로 지정합니다.
      */}
      <h2 className="mb-6 text-3xl font-bold text-slate-800">퀴즈 완료!</h2>

      {/* 점수 표시 섹션 */}
      <div className="mb-8">
        {/* 점수 원형 배경 */}
        {/*
          mx-auto mb-4: 수평 중앙 정렬 및 아래쪽 마진 1rem(16px) 적용.
          h-32 w-32: 높이와 너비를 8rem(128px)으로 설정.
          items-center justify-center: 내부 컨텐츠를 수직/수평 중앙 정렬.
          rounded-full: 원형으로 만듦.
          bg-gradient-to-br from-blue-50 to-indigo-50: 매우 옅은 파란색 계열의 그라데이션 배경.
          shadow-lg: 큰 그림자 효과.
        */}
        <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          {/* 실제 점수 */}
          {/*
            className: 동적으로 클래스를 적용합니다.
            text-4xl font-bold: 폰트 크기 2.25rem(36px)과 굵은 글씨체.
            ${getScoreColor(calculateScore())}: calculateScore() 함수의 결과(점수)를 getScoreColor() 함수에 전달하여
            점수대에 맞는 색상 클래스(예: 'text-red-500')를 받아와 적용합니다.
          */}
          <span
            className={`text-4xl font-bold ${getScoreColor(calculateScore())}`}
          >
            {/* calculateScore() 함수로 계산된 점수를 Math.round()로 반올림하여 표시합니다. */}
            {Math.round(calculateScore())}점
          </span>
        </div>
        {/* 점수 메시지 */}
        {/*
          text-xl: 폰트 크기 1.25rem(20px).
          font-semibold: 폰트 두께를 semi-bold로 설정.
          ${getScoreColor(calculateScore())}: 점수와 동일한 색상 클래스를 적용하여 시각적 일관성을 줍니다.
        */}
        <p
          className={`text-xl font-semibold ${getScoreColor(calculateScore())}`}
        >
          {/* getScoreMessage() 함수를 호출하여 점수에 맞는 메시지를 표시합니다. */}
          {getScoreMessage(calculateScore())}
        </p>
      </div>

      {/* 정답/오답 통계 섹션 */}
      {/*
        mb-8: 아래쪽 마진 2rem(32px) 적용.
        rounded-xl: 테두리를 둥글게(xl 사이즈) 만듭니다.
        bg-slate-50: 배경색을 매우 옅은 회색으로 설정합니다.
        p-6: 모든 방향에 1.5rem(24px) 패딩을 적용합니다.
      */}
      <div className="mb-8 rounded-xl bg-slate-50 p-6">
        {/*
          grid grid-cols-3: CSS Grid 레이아웃을 사용하며, 3개의 동일한 너비의 열을 생성합니다.
          gap-4: 그리드 아이템 사이의 간격을 1rem(16px)으로 설정합니다.
          text-center: 내부 텍스트를 중앙 정렬합니다.
        */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* 총 문제 수 */}
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {questions.length} {/* questions 배열의 길이를 통해 총 문제 수를 표시합니다. */}
            </p>
            <p className="text-sm text-slate-600">총 문제</p> {/* 레이블 */}
          </div>
          {/* 정답 수 */}
          <div>
            <p className="text-2xl font-bold text-emerald-600"> {/* 정답 수는 초록색으로 표시 */}
              {getCorrectAnswersCount()} {/* 정답 수를 계산하는 함수를 호출하여 표시합니다. */}
            </p>
            <p className="text-sm text-slate-600">정답</p> {/* 레이블 */}
          </div>
          {/* 오답 수 */}
          <div>
            <p className="text-2xl font-bold text-red-600"> {/* 오답 수는 빨간색으로 표시 */}
              {getIncorrectAnswersCount()} {/* 오답 수를 계산하는 함수를 호출하여 표시합니다. */}
            </p>
            <p className="text-sm text-slate-600">오답</p> {/* 레이블 */}
          </div>
        </div>
      </div>

      {/* "오답 확인"과 "새로운 문제" 버튼 컨테이너 */}
      {/*
        mb-6: 아래쪽 마진 1.5rem(24px) 적용.
        flex flex-col: 모바일(기본)에서는 아이템들을 수직으로 쌓습니다.
        justify-center: 주 축(수직)의 중앙에 아이템들을 정렬합니다.
        gap-4: 아이템 사이의 간격을 1rem(16px)으로 설정합니다.
        sm:flex-row: 작은 화면(sm, 640px) 이상에서는 아이템들을 수평으로 배열합니다.
      */}
      <div className="mb-6 flex flex-col justify-center gap-4 sm:flex-row">
        {/* 오답 확인 버튼 */}
        <button
          // 버튼 클릭 시 setShowReview(true)를 호출하여 오답 확인 화면으로 전환합니다.
          onClick={() => setShowReview(true)}
          //
          // [스타일링 클래스 설명]
          // inline-flex items-center: 아이콘과 텍스트를 나란히 놓고 수직 중앙 정렬합니다.
          // space-x-2: 아이콘과 텍스트 사이의 수평 간격을 0.5rem(8px) 줍니다.
          // rounded-xl: 테두리를 둥글게(xl) 만듭니다.
          // bg-gradient-to-r ...: 오른쪽 방향의 파란색 계열 그라데이션 배경을 적용합니다.
          // px-8 py-4: 수평 2rem, 수직 1rem의 패딩을 적용합니다.
          // text-white: 글자색을 흰색으로 합니다.
          // shadow-lg: 큰 그림자 효과를 줍니다.
          // transition-all duration-200: 모든 속성 변경에 0.2초의 전환 효과를 적용합니다.
          // hover:scale-105: 마우스를 올리면 크기를 105%로 확대합니다.
          // hover:shadow-xl: 마우스를 올리면 그림자를 더 크게 만듭니다.
          // active:scale-95: 클릭하는 동안 크기를 95%로 축소하여 클릭 피드백을 줍니다.
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <BookOpen className="h-4 w-4" /> {/* 책 모양 아이콘 */}
          <span>오답 확인</span>
        </button>
      </div>

      {/* Discord 전송 상태 표시 섹션 */}
      {/* mb-6: 아래쪽 마진 1.5rem(24px) 적용 */}
      <div className="mb-6">
        {/* 조건부 렌더링: isSendingToDiscord가 true일 때 이 블록을 렌더링합니다. */}
        {isSendingToDiscord ? (
          // [전송 중 상태]
          // rounded-xl border border-blue-200 bg-blue-50 p-4: 둥근 모서리, 파란색 테두리, 옅은 파란색 배경, 패딩을 적용한 컨테이너.
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            {/* flex items-center justify-center space-x-3: 아이콘과 텍스트를 중앙에 나란히 배치하고 간격을 줍니다. */}
            <div className="flex items-center justify-center space-x-3">
              {/* 로딩 스피너 */}
              {/* h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent: 
                  크기 지정, spin 애니메이션 적용, 원형, 테두리 두께 및 색상 지정. 
                  border-t-transparent는 스피너의 한쪽을 투명하게 만들어 회전 효과를 만듭니다. */}
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              {/* font-medium text-blue-800: 중간 두께 폰트와 진한 파란색 텍스트 */}
              <span className="font-medium text-blue-800">
                서버로 결과를 전송하고 있습니다...
              </span>
            </div>
          </div>
        // isSendingToDiscord가 false이고 discordSent가 true일 때 이 블록을 렌더링합니다.
        ) : discordSent ? (
          // [전송 완료 상태]
          // rounded-xl border border-emerald-200 bg-emerald-50 p-4: 둥근 모서리, 초록색 테두리, 옅은 초록색 배경, 패딩.
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-center space-x-3">
              <Check className="h-5 w-5 text-emerald-600" /> {/* 초록색 체크 아이콘 */}
              <span className="font-medium text-emerald-800">
                서버로 결과가 전송되었습니다!
              </span>
            </div>
          </div>
        // isSendingToDiscord와 discordSent가 모두 false일 때 (초기 상태) 이 블록을 렌더링합니다.
        ) : (
          // [전송 대기 상태]
          // rounded-xl border border-slate-200 bg-slate-50 p-4: 둥근 모서리, 회색 테두리, 옅은 회색 배경, 패딩.
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-center space-x-3">
              <Send className="h-5 w-5 text-slate-600" /> {/* 회색 종이비행기 아이콘 */}
              <span className="font-medium text-slate-800">
                잠시 후 서버로 자동 전송됩니다
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 새로운 문제 시작 버튼 */}
      <button
        onClick={resetQuiz} // 클릭 시 resetQuiz 함수를 호출하여 퀴즈를 초기화합니다.
        // 스타일은 '오답 확인' 버튼과 유사하나, 회색 계열 그라데이션을 사용합니다.
        className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 px-8 py-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
      >
        <RotateCcw className="h-4 w-4" /> {/* 되돌리기 아이콘 */}
        <span>새로운 문제</span>
      </button>

      {/* 사용자 의견 입력 섹션 */}
      {/*
        mx-auto: 수평 중앙 정렬
        mb-8: 아래쪽 마진 2rem(32px)
        max-w-md: 최대 너비를 medium 사이즈(28rem, 448px)로 제한합니다.
        flex items-center: Flexbox를 사용하고 아이템들을 수직 중앙 정렬합니다.
        gap-4: 아이템(입력창, 버튼) 사이의 간격을 1rem(16px)으로 설정합니다.
        pt-12: 위쪽 패딩을 3rem(48px) 줍니다.
      */}
      <div className="mx-auto mb-8 flex max-w-md items-center gap-4 pt-12">
        {/* 의견 입력창 */}
        <input
          type="text" // 입력 타입을 텍스트로 지정
          value={userComment} // 입력창의 값은 userComment 상태와 연결(controlled component)
          onChange={(e) => setUserComment(e.target.value)} // 입력값이 변경될 때마다 setUserComment 함수를 호출하여 상태를 업데이트
          placeholder="의견이 있나요? 적어주세요" // 입력창이 비어있을 때 보여줄 안내 문구
          // [스타일링 클래스 설명]
          // flex-1: Flexbox 컨테이너 내에서 가능한 모든 여유 공간을 차지합니다.
          // rounded-xl: 테두리를 둥글게(xl) 만듭니다.
          // border-2 border-slate-200: 2px 두께의 옅은 회색 테두리를 적용합니다.
          // px-4 py-3: 수평 1rem, 수직 0.75rem 패딩을 적용합니다.
          // text-lg: 폰트 크기를 1.125rem(18px)으로 설정합니다.
          // transition-colors: 색상 변경에 전환 효과를 적용합니다.
          // focus:border-blue-500: 입력창에 포커스(클릭)되었을 때 테두리 색상을 파란색으로 변경합니다.
          // focus:outline-none: 포커스 시 기본으로 생기는 외곽선을 제거합니다.
          className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
          // 키보드 이벤트 핸들러
          onKeyDown={(e) => {
            // 만약 눌린 키가 'Enter'라면
            if (e.key === "Enter") handleNameSubmit(); // handleNameSubmit 함수를 호출합니다.
          }}
        />

        {/* 의견 보내기 버튼 */}
        <button
          onClick={uploadComment} // 클릭 시 uploadComment 함수를 호출합니다.
          // isSendingToCommentDiscord 또는 commentDiscordSent가 true이면 버튼을 비활성화합니다.
          disabled={isSendingToCommentDiscord || commentDiscordSent}
          // [동적 스타일링 클래스 설명]
          // 공통 스타일: inline-flex, items-center, space-x-2, rounded-xl, px-5, py-3, text-white, shadow-lg, transition-all, duration-200, active:scale-95
          // 조건부 스타일:
          //   - commentDiscordSent가 true이면: 'cursor-not-allowed bg-gray-400' (클릭 불가 커서, 회색 배경)
          //   - 그렇지 않으면(false이면): 'bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 hover:shadow-xl' (파란색 그라데이션 배경, 호버 효과)
          className={`inline-flex items-center space-x-2 rounded-xl px-5 py-3 text-white shadow-lg transition-all duration-200 active:scale-95 ${
            commentDiscordSent
              ? "cursor-not-allowed bg-gray-400"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 hover:shadow-xl"
          } `}
        >
          <Send className="h-4 w-4" /> {/* 보내기 아이콘 */}
          {/* commentDiscordSent 상태에 따라 버튼 텍스트를 "완료~" 또는 "보내기"로 변경합니다. */}
          <span>{commentDiscordSent ? "완료~" : "보내기"}</span>
        </button>
      </div>
    </div>
  );
}