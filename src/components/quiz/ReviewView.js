"use client";

import { BookOpen, X, Check, ArrowLeft, RotateCcw } from "lucide-react";

export default function ReviewView({
  questions,
  getFilteredQuestions,
  reviewMode,
  setReviewMode,
  getCorrectAnswersCount,
  getIncorrectAnswersCount,
  setShowReview,
  selectedAnswers,
  isAnswerCorrect,
  resetQuiz,
}) {
  return (
    <div className="p-8">
      {/* Review Header */}
      <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-800">문제 리뷰</p>
              <p className="text-sm text-slate-500">
                {getFilteredQuestions().length}개 문제 •{" "}
                {reviewMode === "incorrect"
                  ? "오답만"
                  : reviewMode === "correct"
                    ? "정답만"
                    : "전체"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReview(false)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Review Mode Selector */}
      <div className="border-b border-slate-200/50 p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReviewMode("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reviewMode === "all"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            전체 ({questions.length})
          </button>
          <button
            onClick={() => setReviewMode("incorrect")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reviewMode === "incorrect"
                ? "bg-red-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            오답만 ({getIncorrectAnswersCount()})
          </button>
          <button
            onClick={() => setReviewMode("correct")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reviewMode === "correct"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            정답만 ({getCorrectAnswersCount()})
          </button>
        </div>
      </div>

      {/* Review Questions */}
      <div className="space-y-6 p-6">
        {getFilteredQuestions().map((question, index) => {
          const originalIndex = questions.indexOf(question);
          const userAnswer = selectedAnswers[originalIndex];
          const isCorrect = isAnswerCorrect(originalIndex);

          return (
            <div
              key={originalIndex}
              className="rounded-xl border-2 p-6 transition-all hover:shadow-md"
              style={{
                borderColor: isCorrect ? "#10b981" : "#ef4444",
                backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2",
              }}
            >
              {/* Question Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {originalIndex + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
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

              {/* Question */}
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                {question.question}
              </h3>

              {/* Options */}
              <div className="mb-4 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isUserAnswer = userAnswer === option;
                  const isCorrectAnswer = question.correctAnswer === option;

                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-center rounded-lg border-2 p-3 transition-all ${
                        isCorrectAnswer
                          ? "border-emerald-500 bg-emerald-50"
                          : isUserAnswer && !isCorrectAnswer
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          isCorrectAnswer
                            ? "border-emerald-500 bg-emerald-500"
                            : isUserAnswer && !isCorrectAnswer
                              ? "border-red-500 bg-red-500"
                              : "border-slate-300"
                        }`}
                      >
                        {isCorrectAnswer && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                        {isUserAnswer && !isCorrectAnswer && (
                          <X className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`${
                          isCorrectAnswer
                            ? "font-medium text-emerald-800"
                            : isUserAnswer && !isCorrectAnswer
                              ? "font-medium text-red-800"
                              : "text-slate-700"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Answer Summary */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">내 답안:</span>
                    <span
                      className={`ml-2 font-medium ${
                        isCorrect ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {userAnswer || "답안 없음"}
                    </span>
                  </div>
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

      {/* Review Footer */}
      <div className="border-t border-slate-200/50 p-6">
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => setShowReview(false)}
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>결과로 돌아가기</span>
          </button>
          <button
            onClick={resetQuiz}
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
