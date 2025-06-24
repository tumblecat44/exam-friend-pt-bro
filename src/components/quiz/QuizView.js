// "use client" 지시어는 이 파일이 Next.js의 클라이언트 컴포넌트임을 명시합니다.
// 즉, 이 컴포넌트는 사용자의 브라우저에서 렌더링되고 상호작용합니다.
"use client";

// 'lucide-react' 라이브러리에서 아이콘 컴포넌트들을 가져옵니다.
// 이 아이콘들은 UI를 시각적으로 풍부하게 만드는 데 사용됩니다.
import {
  FileText, // 파일 모양 아이콘
  ArrowLeft, // 왼쪽 화살표 아이콘
  ArrowRight, // 오른쪽 화살표 아이콘
  CheckCircle, // 체크 모양 원 아이콘
  AlertCircle, // 경고 모양 원 아이콘
} from "lucide-react";

// QuizView 컴포넌트를 정의하고 외부에서 사용할 수 있도록 export 합니다.
// 이 컴포넌트는 퀴즈 UI 전체를 렌더링하는 역할을 합니다.
export default function QuizView({
  file, // 퀴즈의 기반이 된 파일 정보 객체 (예: { name: '문서.pdf', size: 12345 })
  userName, // 퀴즈를 푸는 사용자의 이름
  questions, // 퀴즈 질문 목록을 담고 있는 배열
  currentQuestion, // 현재 표시되고 있는 질문의 인덱스(번호)
  setCurrentQuestion, // 현재 질문 인덱스를 변경하는 함수 (상태 업데이트 함수)
  selectedAnswers, // 각 질문에 대해 사용자가 선택한 답을 저장하는 배열
  handleAnswerSelect, // 사용자가 답을 선택했을 때 호출되는 함수
  setShowResults, // 퀴즈 결과를 표시할지 여부를 결정하는 상태를 변경하는 함수
  isLoading, // 퀴즈 문제를 생성 중인지 여부를 나타내는 boolean 값
  uploadProgress, // 문제 생성 진행률(%)을 나타내는 숫자
  isQuizInProgress, // 사용자가 퀴즈를 풀기 시작했는지 여부를 나타내는 boolean 값
}) {
  // 컴포넌트가 렌더링할 JSX를 반환합니다.
  return (
    // 전체 퀴즈 뷰를 감싸는 메인 컨테이너 div 입니다.
    // overflow-hidden: 자식 요소가 경계를 넘어가면 숨김
    // rounded-2xl: 모서리를 매우 둥글게 만듦
    // bg-white/80: 80% 불투명도의 흰색 배경
    // shadow-xl: 큰 그림자 효과 적용
    // ring-1 ring-slate-200/50: 50% 불투명도의 연한 회색 테두리 적용
    // backdrop-blur-sm: 배경을 약간 흐리게 만드는 효과 (프로스티드 글래스 효과)
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm">
      {/* React Fragment (<>)를 사용하여 여러 요소를 그룹화합니다. 불필요한 DOM 노드를 추가하지 않습니다. */}
      <>
        {/* 헤더 섹션: 파일 정보와 진행률을 표시합니다. */}
        {/* border-b border-slate-200/50: 아래쪽에 50% 불투명도의 연한 회색 테두리 추가 */}
        {/* bg-gradient-to-r from-slate-50 to-blue-50/50: 오른쪽으로 가는 그라데이션 배경 적용 */}
        {/* px-8 py-6: 좌우 패딩 8, 상하 패딩 6 적용 */}
        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6">
          {/* flex items-center justify-between: 자식 요소들을 가로로 배치하고, 수직 중앙 정렬하며, 양쪽 끝으로 분산시킴 */}
          <div className="flex items-center justify-between">
            {/* 왼쪽 영역: 파일 아이콘과 파일 정보를 표시합니다. */}
            {/* flex items-center space-x-3: 자식 요소들을 가로로 배치, 수직 중앙 정렬, 요소들 사이에 3단위 간격 추가 */}
            <div className="flex items-center space-x-3">
              {/* 파일 아이콘을 감싸는 div */}
              {/* h-10 w-10: 높이와 너비를 10으로 설정 */}
              {/* flex items-center justify-center: 자식 요소를 중앙에 배치 */}
              {/* rounded-lg: 모서리를 둥글게 만듦 */}
              {/* bg-gradient-to-br from-blue-500 to-indigo-600: 오른쪽 아래로 가는 그라데이션 배경 적용 */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                {/* FileText 아이콘 컴포넌트 */}
                {/* h-5 w-5: 높이와 너비를 5로 설정 */}
                {/* text-white: 아이콘 색상을 흰색으로 설정 */}
                <FileText className="h-5 w-5 text-white" />
              </div>
              {/* 파일 이름과 상세 정보를 담는 div */}
              <div>
                {/* 파일 이름을 표시하는 p 태그 */}
                {/* font-medium text-slate-800: 중간 굵기 폰트, 진한 회색 텍스트 */}
                <p className="font-medium text-slate-800">{file.name}</p>
                {/* 파일 크기, 종류, 사용자 이름을 표시하는 p 태그 */}
                {/* text-sm text-slate-500: 작은 폰트, 중간 회색 텍스트 */}
                <p className="text-sm text-slate-500">
                  {/* 파일 크기(byte)를 MB 단위로 변환하고 소수점 둘째 자리까지 표시 */}
                  {(file.size / (1024 * 1024)).toFixed(2)}MB • PDF 문서 •{" "}
                  {/* 사용자 이름 표시 */}
                  {userName}
                </p>
              </div>
            </div>
            {/* 오른쪽 영역: 퀴즈 진행률을 표시합니다. */}
            {/* text-right: 텍스트를 오른쪽으로 정렬 */}
            <div className="text-right">
              {/* '진행률' 레이블 */}
              {/* text-sm font-medium text-slate-600: 작은 폰트, 중간 굵기, 약간 연한 회색 텍스트 */}
              <p className="text-sm font-medium text-slate-600">진행률</p>
              {/* 실제 진행률 (예: "3 / 10") */}
              {/* text-lg font-semibold text-slate-800: 큰 폰트, 두꺼운 굵기, 진한 회색 텍스트 */}
              <p className="text-lg font-semibold text-slate-800">
                {/* 현재 질문 번호(인덱스+1)와 전체 질문 수를 표시 */}
                {currentQuestion + 1} / {questions.length}
              </p>
            </div>
          </div>
        </div>

        {/* 퀴즈 진행 상태를 시각적으로 보여주는 프로그레스 바 */}
        {/* h-1 bg-slate-100: 높이 1, 매우 연한 회색 배경 */}
        <div className="h-1 bg-slate-100">
          {/* 실제 진행률을 나타내는 바 */}
          {/* h-full: 부모 높이(1)를 꽉 채움 */}
          {/* bg-gradient-to-r ...: 그라데이션 배경 */}
          {/* transition-all duration-500 ease-out: 모든 속성 변경에 0.5초 동안 부드러운 전환 효과 적용 */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            // 인라인 스타일을 사용하여 너비를 동적으로 계산하고 설정합니다.
            // (현재 질문 번호 / 전체 질문 수) * 100%
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>

        {/* isLoading이 true일 경우 로딩 상태 UI를, false일 경우 퀴즈 내용을 표시 (삼항 연산자) */}
        {isLoading ? (
          // 로딩 중일 때 표시되는 UI
          // p-12 text-center: 패딩 12, 텍스트 중앙 정렬
          <div className="p-12 text-center">
            {/* 로딩 스피너 아이콘 */}
            {/* mx-auto: 좌우 마진 자동 (가로 중앙 정렬) */}
            {/* mb-6: 아래쪽 마진 6 */}
            {/* h-16 w-16: 높이와 너비 16 */}
            {/* animate-spin: 회전 애니메이션 적용 */}
            {/* rounded-full: 원 모양으로 만듦 */}
            {/* border-4 border-slate-200 border-t-blue-600: 두께 4의 테두리, 기본은 연회색, 위쪽만 파란색으로 설정하여 스피너 효과 생성 */}
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            {/* 로딩 메시지 제목 */}
            {/* mb-2: 아래쪽 마진 2 */}
            {/* text-xl font-semibold text-slate-800: 매우 큰 폰트, 두꺼운 굵기, 진한 회색 텍스트 */}
            <h3 className="mb-2 text-xl font-semibold text-slate-800">
              AI가 문제를 생성하고 있습니다
            </h3>
            {/* 로딩 메시지 부가 설명 */}
            {/* text-slate-600: 약간 연한 회색 텍스트 */}
            <p className="text-slate-600">잠시만 기다려주세요...</p>
            {/* 문제 생성 진행률 바 컨테이너 */}
            {/* mx-auto mt-6: 좌우 마진 자동, 위쪽 마진 6 */}
            {/* w-full max-w-xs: 너비 100%, 최대 너비는 xs(작은 크기)로 제한 */}
            <div className="mx-auto mt-6 w-full max-w-xs">
              {/* 진행률 바의 배경 */}
              {/* h-2 overflow-hidden rounded-full bg-slate-200: 높이 2, 자식 요소 숨김, 양 끝이 둥근 모양, 연회색 배경 */}
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                {/* 실제 진행률을 나타내는 바 */}
                {/* h-full: 부모 높이(2) 꽉 채움 */}
                {/* bg-gradient-to-r ...: 그라데이션 배경 */}
                {/* transition-all duration-300 ease-out: 모든 속성 변경에 0.3초 동안 부드러운 전환 효과 */}
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                  // 인라인 스타일로 너비를 'uploadProgress' prop 값에 따라 동적으로 설정
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {/* 진행률 텍스트 (예: "50% 완료") */}
              {/* mt-2 text-sm text-slate-500: 위쪽 마진 2, 작은 폰트, 중간 회색 텍스트 */}
              <p className="mt-2 text-sm text-slate-500">
                {uploadProgress}% 완료
              </p>
            </div>
          </div>
        ) : questions.length > 0 ? ( // 로딩이 끝났고, 생성된 질문이 하나 이상 있을 경우 퀴즈 UI를 표시
          // 퀴즈 콘텐츠 전체를 감싸는 div
          // p-8: 패딩 8 적용
          <div className="p-8">
            {/* isQuizInProgress가 true일 경우에만 경고 메시지를 표시합니다. */}
            {isQuizInProgress && (
              // 경고 메시지 박스
              // mb-6: 아래쪽 마진 6
              // rounded-xl border border-amber-200 bg-amber-50: 둥근 모서리, 호박색 테두리 및 배경
              // p-4: 패딩 4
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                {/* flex items-start space-x-3: 자식 요소들을 가로로 배치, 수직 상단 정렬, 요소 간 간격 3 */}
                <div className="flex items-start space-x-3">
                  {/* 경고 아이콘 */}
                  {/* mt-0.5: 위쪽 마진 0.5 */}
                  {/* h-5 w-5: 높이/너비 5 */}
                  {/* flex-shrink-0: 공간이 부족해도 아이콘 크기가 줄어들지 않도록 함 */}
                  {/* text-amber-500: 아이콘 색상을 호박색으로 설정 */}
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  {/* 경고 메시지 텍스트 컨테이너 */}
                  <div>
                    {/* 경고 제목 */}
                    {/* font-medium text-amber-800: 중간 굵기, 진한 호박색 텍스트 */}
                    <h3 className="font-medium text-amber-800">퀴즈 진행 중</h3>
                    {/* 경고 내용 */}
                    {/* mt-1 text-sm text-amber-600: 위쪽 마진 1, 작은 폰트, 중간 호박색 텍스트 */}
                    <p className="mt-1 text-sm text-amber-600">
                      페이지를 나가면 답안이 모두 사라집니다. 퀴즈를 완료한 후
                      나가주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 현재 질문을 표시하는 섹션 */}
            {/* mb-8: 아래쪽 마진 8 */}
            <div className="mb-8">
              {/* 질문 번호와 질문 텍스트를 담는 flex 컨테이너 */}
              {/* mb-4: 아래쪽 마진 4 */}
              {/* flex items-center space-x-2: 가로 배치, 수직 중앙 정렬, 요소 간 간격 2 */}
              <div className="mb-4 flex items-center space-x-2">
                {/* 질문 번호를 표시하는 원형 span */}
                {/* inline-flex h-6 w-6 ... : 인라인 플렉스, 높이/너비 6, 중앙 정렬 */}
                {/* rounded-full: 원 모양 */}
                {/* bg-blue-100 text-xs font-semibold text-blue-600: 연한 파란 배경, 매우 작은 폰트, 두꺼운 굵기, 파란색 텍스트 */}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  {currentQuestion + 1}
                </span>
                {/* 질문 텍스트 */}
                {/* text-xl font-semibold text-slate-800: 매우 큰 폰트, 두꺼운 굵기, 진한 회색 텍스트 */}
                <h3 className="text-xl font-semibold text-slate-800">
                  {questions[currentQuestion].question}
                </h3>
              </div>
            </div>

            {/* 선택지(답안) 목록을 표시하는 섹션 */}
            {/* mb-8 space-y-3: 아래쪽 마진 8, 자식 요소들 사이에 수직 간격 3 추가 */}
            <div className="mb-8 space-y-3">
              {/* 현재 질문의 선택지 배열을 map 함수로 순회하며 각 선택지를 렌더링 */}
              {questions[currentQuestion].options.map((option, index) => (
                // 각 선택지를 감싸는 label 태그. 클릭하면 연결된 input이 선택됨.
                // key={index}: React가 목록의 각 항목을 식별하기 위한 고유 키
                // className: 조건부 스타일링 적용
                <label
                  key={index}
                  // group: 자식 요소에서 부모(group)의 상태(예: hover)에 따라 스타일을 변경할 수 있게 함
                  // relative: 자식 요소의 absolute 위치 기준이 됨
                  // flex cursor-pointer ...: 플렉스, 포인터 커서, 둥근 모서리, 테두리, 패딩, 전환 효과 등 기본 스타일
                  // hover:shadow-md: 마우스를 올리면 중간 크기 그림자 효과
                  className={`group relative flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    // 삼항 연산자를 사용해 현재 선택된 답변인지 여부에 따라 다른 스타일을 적용
                    selectedAnswers[currentQuestion] === option
                      ? "border-blue-500 bg-blue-50/50 shadow-md" // 선택된 경우: 파란 테두리, 반투명 파란 배경, 그림자
                      : "border-slate-200 hover:border-slate-300" // 선택되지 않은 경우: 연회색 테두리, 마우스 올리면 조금 더 진한 회색 테두리
                    }`}
                >
                  {/* 실제 라디오 버튼 input. 시각적으로는 숨겨짐. */}
                  <input
                    type="radio" // 라디오 버튼 타입
                    name={`question-${currentQuestion}`} // 같은 name을 가진 라디오 버튼 중 하나만 선택 가능
                    checked={selectedAnswers[currentQuestion] === option} // 현재 선택지와 사용자가 선택한 답이 같으면 체크됨
                    onChange={() => handleAnswerSelect(currentQuestion, option)} // 변경(선택) 시 handleAnswerSelect 함수 호출
                    className="sr-only" // 스크린 리더에서는 인식되지만 화면에는 보이지 않도록 숨김
                  />
                  {/* 커스텀 라디오 버튼 모양을 만드는 div */}
                  <div
                    // mr-4: 오른쪽 마진 4
                    // flex h-5 w-5 ...: 플렉스, 높이/너비 5, 중앙 정렬, 원형, 테두리, 전환 효과
                    className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      // 선택 여부에 따라 다른 스타일 적용
                      selectedAnswers[currentQuestion] === option
                        ? "border-blue-500 bg-blue-500" // 선택된 경우: 파란 테두리, 파란 배경
                        : "border-slate-300 group-hover:border-blue-400" // 선택되지 않은 경우: 회색 테두리, 부모(group)에 마우스 올리면 파란 테두리
                      }`}
                  >
                    {/* 선택되었을 때만 내부 원을 표시 */}
                    {selectedAnswers[currentQuestion] === option && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  {/* 선택지 텍스트 */}
                  {/* text-slate-700: 진한 회색 텍스트 */}
                  <span className="text-slate-700">{option}</span>
                </label>
              ))}
            </div>

            {/* 이전/다음 버튼 네비게이션 섹션 */}
            {/* flex items-center justify-between: 가로 배치, 수직 중앙 정렬, 양쪽 끝으로 분산 */}
            <div className="flex items-center justify-between">
              {/* '이전' 버튼 */}
              <button
                // 클릭 시 현재 질문 인덱스를 1 감소시킴
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                // 현재 질문이 첫 번째(인덱스 0)일 경우 버튼을 비활성화
                disabled={currentQuestion === 0}
                // flex items-center space-x-2: 가로 배치, 수직 중앙 정렬, 요소 간 간격 2
                // rounded-xl px-6 py-3: 둥근 모서리, 좌우/상하 패딩
                // text-slate-600: 텍스트 색상
                // transition-all duration-200: 전환 효과
                // hover:bg-slate-100: 마우스 올리면 배경색 변경
                // disabled:cursor-not-allowed disabled:opacity-50: 비활성화 시 커서 및 불투명도 변경
                className="flex items-center space-x-2 rounded-xl px-6 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {/* 왼쪽 화살표 아이콘 */}
                <ArrowLeft className="h-4 w-4" />
                {/* 버튼 텍스트 */}
                <span>이전</span>
              </button>

              {/* 현재 질문이 마지막 질문인지 여부에 따라 '결과 확인' 또는 '다음' 버튼을 표시 */}
              {currentQuestion === questions.length - 1 ? (
                // '결과 확인' 버튼 (마지막 질문일 경우)
                <button
                  // 클릭 시 결과 페이지를 표시하도록 상태 변경
                  onClick={() => setShowResults(true)}
                  // bg-gradient-to-r from-emerald-500 to-teal-600: 초록 계열 그라데이션 배경
                  // px-8 py-3 text-white shadow-lg: 패딩, 흰색 텍스트, 큰 그림자
                  // transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95: 마우스 올리면 커지고 그림자 커짐, 클릭하면 작아지는 효과
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  <span>결과 확인</span>
                  {/* 체크 아이콘 */}
                  <CheckCircle className="h-4 w-4" />
                </button>
              ) : (
                // '다음' 버튼 (마지막 질문이 아닐 경우)
                <button
                  // 클릭 시 현재 질문 인덱스를 1 증가시킴
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  // bg-gradient-to-r from-blue-500 to-indigo-600: 파란 계열 그라데이션 배경
                  // 스타일은 '결과 확인' 버튼과 유사
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  <span>다음</span>
                  {/* 오른쪽 화살표 아이콘 */}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : null} {/* 로딩 중도 아니고 질문도 없으면 아무것도 렌더링하지 않음 */}
      </>
    </div>
  );
}