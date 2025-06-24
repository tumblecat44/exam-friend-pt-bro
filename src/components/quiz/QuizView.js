"use client";

import {
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function QuizView({
  file,
  userName,
  questions,
  currentQuestion,
  setCurrentQuestion,
  selectedAnswers,
  handleAnswerSelect,
  setShowResults,
  isLoading,
  uploadProgress,
  isQuizInProgress,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm">
      <>
        {/* Header */}
        <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)}MB • PDF 문서 •{" "}
                  {userName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">진행률</p>
              <p className="text-lg font-semibold text-slate-800">
                {currentQuestion + 1} / {questions.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <h3 className="mb-2 text-xl font-semibold text-slate-800">
              AI가 문제를 생성하고 있습니다
            </h3>
            <p className="text-slate-600">잠시만 기다려주세요...</p>
            <div className="mx-auto mt-6 w-full max-w-xs">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {uploadProgress}% 완료
              </p>
            </div>
          </div>
        ) : questions.length > 0 ? (
          <div className="p-8">
            {/* Quiz Progress Warning */}
            {isQuizInProgress && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div>
                    <h3 className="font-medium text-amber-800">퀴즈 진행 중</h3>
                    <p className="mt-1 text-sm text-amber-600">
                      페이지를 나가면 답안이 모두 사라집니다. 퀴즈를 완료한 후
                      나가주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="mb-4 flex items-center space-x-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  {currentQuestion + 1}
                </span>
                <h3 className="text-xl font-semibold text-slate-800">
                  {questions[currentQuestion].question}
                </h3>
              </div>
            </div>

            <div className="mb-8 space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className={`group relative flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    selectedAnswers[currentQuestion] === option
                      ? "border-blue-500 bg-blue-50/50 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={selectedAnswers[currentQuestion] === option}
                    onChange={() => handleAnswerSelect(currentQuestion, option)}
                    className="sr-only"
                  />
                  <div
                    className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      selectedAnswers[currentQuestion] === option
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300 group-hover:border-blue-400"
                    }`}
                  >
                    {selectedAnswers[currentQuestion] === option && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-slate-700">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 rounded-xl px-6 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>이전</span>
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowResults(true)}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  <span>결과 확인</span>
                  <CheckCircle className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  <span>다음</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : null}
      </>
    </div>
  );
}
