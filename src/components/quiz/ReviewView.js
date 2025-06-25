"use client"; // 이 컴포넌트가 클라이언트 측에서 렌더링되어야 함을 나타내는 Next.js 지시문입니다.

// lucide-react 라이브러리에서 사용할 아이콘들을 가져옵니다.
import { BookOpen, X, Check, ArrowLeft, RotateCcw } from "lucide-react";

// ReviewView 컴포넌트를 정의합니다. 퀴즈 결과를 리뷰하는 UI를 담당합니다.
export default function ReviewView({
  questions, // 전체 질문 목록 배열
  getFilteredQuestions, // 현재 리뷰 모드(전체, 정답, 오답)에 따라 필터링된 질문 목록을 반환하는 함수
  reviewMode, // 현재 리뷰 모드 상태 ('all', 'correct', 'incorrect')
  setReviewMode, // 리뷰 모드를 변경하는 함수
  getCorrectAnswersCount, // 정답 개수를 반환하는 함수
  getIncorrectAnswersCount, // 오답 개수를 반환하는 함수
  setShowReview, // 리뷰 화면의 표시 여부를 제어하는 상태를 변경하는 함수
  selectedAnswers, // 사용자가 선택한 답안 목록 배열
  isAnswerCorrect, // 특정 질문 인덱스에 대해 정답 여부를 확인하는 함수
  resetQuiz, // 퀴즈를 리셋하고 새로운 문제를 시작하는 함수
}) {
  return (
    // 전체 리뷰 화면을 감싸는 최상위 div
    <div className="p-8">
      {/* 리뷰 화면 헤더 */}
      <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6">
        <div className="flex items-center justify-between">
          {/* 헤더 좌측: 아이콘과 제목 */}
          <div className="flex items-center space-x-3">
            {/* BookOpen 아이콘 */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            {/* 제목과 부가 정보 */}
            <div>
              <p className="font-medium text-slate-800">문제 리뷰</p>
              <p className="text-sm text-slate-500">
                {/* 현재 필터링된 질문의 개수를 표시합니다. */}
                {getFilteredQuestions().length}개 문제 •{" "}
                {/* 현재 리뷰 모드에 따라 '오답만', '정답만', '전체' 텍스트를 동적으로 표시합니다. */}
                {reviewMode === "incorrect"
                  ? "오답만"
                  : reviewMode === "correct"
                    ? "정답만"
                    : "전체"}
              </p>
            </div>
          </div>
          {/* 헤더 우측: 닫기 버튼 */}
          <button
            onClick={() => setShowReview(false)} // 클릭 시 리뷰 화면을 닫습니다.
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 리뷰 모드 선택 버튼 영역 */}
      <div className="border-b border-slate-200/50 p-6">
        <div className="flex flex-wrap gap-2">
          {/* '전체' 보기 버튼 */}
          <button
            onClick={() => setReviewMode("all")} // 클릭 시 리뷰 모드를 'all'로 설정합니다.
            // 현재 reviewMode가 'all'이면 활성화된 스타일(파란색 배경)을, 아니면 기본 스타일을 적용합니다.
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reviewMode === "all"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            전체 ({questions.length}) {/* 전체 질문 수를 표시합니다. */}
          </button>
          {/* '오답만' 보기 버튼 */}
          <button
            onClick={() => setReviewMode("incorrect")} // 클릭 시 리뷰 모드를 'incorrect'로 설정합니다.
            // 현재 reviewMode가 'incorrect'이면 활성화된 스타일(빨간색 배경)을, 아니면 기본 스타일을 적용합니다.
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reviewMode === "incorrect"
                ? "bg-red-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            오답만 ({getIncorrectAnswersCount()}) {/* 오답 개수를 표시합니다. */}
          </button>
          {/* '정답만' 보기 버튼 */}
          <button
            onClick={() => setReviewMode("correct")} // 클릭 시 리뷰 모드를 'correct'로 설정합니다.
            // 현재 reviewMode가 'correct'이면 활성화된 스타일(초록색 배경)을, 아니면 기본 스타일을 적용합니다.
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reviewMode === "correct"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            정답만 ({getCorrectAnswersCount()}) {/* 정답 개수를 표시합니다. */}
          </button>
        </div>
      </div>

      {/* 리뷰할 질문 목록 */}
      <div className="space-y-6 p-6">
        {/* 필터링된 질문 목록을 순회하며 각 질문을 렌더링합니다. */}
        {getFilteredQuestions().map((question, index) => {
          // 필터링된 배열이 아닌 원본 'questions' 배열에서의 인덱스를 찾습니다.
          // 이는 'selectedAnswers' 배열과 인덱스를 맞추기 위함입니다.
          const originalIndex = questions.indexOf(question);
          // 원본 인덱스를 사용하여 사용자의 답안을 가져옵니다.
          const userAnswer = selectedAnswers[originalIndex];
          // 원본 인덱스를 사용하여 해당 문제가 정답인지 확인합니다.
          const isCorrect = isAnswerCorrect(originalIndex);

          return (
            <div
              key={originalIndex} // React가 목록의 각 항목을 식별하기 위한 고유한 key
              className="rounded-xl border-2 p-6 transition-all hover:shadow-md"
              // 정답 여부에 따라 테두리 색상과 배경색을 동적으로 설정합니다.
              style={{
                borderColor: isCorrect ? "#10b981" : "#ef4444", // 정답이면 초록색, 오답이면 빨간색 테두리
                backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2", // 정답이면 연한 초록색, 오답이면 연한 빨간색 배경
              }}
            >
              {/* 질문 카드 헤더 */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* 문제 번호 */}
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      // 정답 여부에 따라 번호 배경색과 글자색을 다르게 설정합니다.
                      isCorrect
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {originalIndex + 1}
                  </span>
                  {/* 정답/오답 표시 */}
                  <div className="flex items-center space-x-2">
                    {/* 정답이면 체크 아이콘, 오답이면 X 아이콘을 표시합니다. */}
                    {isCorrect ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    {/* 정답/오답 텍스트를 표시합니다. */}
                    <span
                      className={`font-medium ${
                        isCorrect ? "text-emerald-800" : "text-red-800"
                      }`}
                    >
                      {isCorrect ? "정답" : "오답"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 질문 내용 */}
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                {question.question}
              </h3>

              {/* 선택지 목록 */}
              <div className="mb-4 space-y-3">
                {question.options.map((option, optionIndex) => {
                  // 현재 선택지가 사용자가 선택한 답안인지 확인합니다.
                  const isUserAnswer = userAnswer === option;
                  // 현재 선택지가 정답인지 확인합니다.
                  const isCorrectAnswer = question.correctAnswer === option;

                  return (
                    <div
                      key={optionIndex} // 각 선택지를 구별하기 위한 고유한 key
                      // 선택지의 상태(정답, 사용자가 선택한 오답, 그 외)에 따라 다른 스타일을 적용합니다.
                      className={`flex items-center rounded-lg border-2 p-3 transition-all ${
                        isCorrectAnswer
                          ? "border-emerald-500 bg-emerald-50" // 정답인 경우
                          : isUserAnswer && !isCorrectAnswer
                            ? "border-red-500 bg-red-50" // 사용자가 선택했지만 오답인 경우
                            : "border-slate-200 bg-white" // 그 외의 경우
                      }`}
                    >
                      {/* 선택지 앞의 원형 아이콘 영역 */}
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          isCorrectAnswer
                            ? "border-emerald-500 bg-emerald-500" // 정답
                            : isUserAnswer && !isCorrectAnswer
                              ? "border-red-500 bg-red-500" // 사용자가 선택한 오답
                              : "border-slate-300" // 그 외
                        }`}
                      >
                        {/* 정답인 경우 체크 아이콘 표시 */}
                        {isCorrectAnswer && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                        {/* 사용자가 선택한 오답인 경우 X 아이콘 표시 */}
                        {isUserAnswer && !isCorrectAnswer && (
                          <X className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {/* 선택지 텍스트 */}
                      <span
                        className={`${ 
                          isCorrectAnswer
                            ? "font-medium text-emerald-800" // 정답 텍스트 스타일
                            : isUserAnswer && !isCorrectAnswer
                              ? "font-medium text-red-800" // 사용자가 선택한 오답 텍스트 스타일
                              : "text-slate-700" // 기본 텍스트 스타일
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 답안 요약 (내 답안 / 정답) */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* 내가 선택한 답안 */}
                  <div>
                    <span className="font-medium text-slate-600">내 답안:</span>
                    <span
                      // 정답 여부에 따라 글자색을 다르게 표시
                      className={`ml-2 font-medium ${
                        isCorrect ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {userAnswer || "답안 없음"} {/* 답을 선택 안했으면 '답안 없음' 표시 */}
                    </span>
                  </div>
                  {/* 실제 정답 */}
                  <div>
                    <span className="font-medium text-slate-600">정답:</span>
                    <span className="ml-2 font-medium text-emerald-600">
                      {question.correctAnswer}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 리뷰 화면 푸터 */}
      <div className="border-t border-slate-200/50 p-6">
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {/* '결과로 돌아가기' 버튼 */}
          <button
            onClick={() => setShowReview(false)} // 클릭 시 리뷰 화면을 닫고 결과 화면으로 돌아갑니다.
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>결과로 돌아가기</span>
          </button>
          {/* '새로운 문제' 버튼 */}
          <button
            onClick={resetQuiz} // 클릭 시 퀴즈를 리셋합니다.
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>새로운 문제</span>
          </button>
        </div>
      </div>
    </div>
  );
}