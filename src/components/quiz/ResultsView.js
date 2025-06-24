"use client";

import { CheckCircle, BookOpen, RotateCcw, Send, Check } from "lucide-react";

export default function ResultsView({
  questions,
  calculateScore,
  getScoreColor,
  getScoreMessage,
  getCorrectAnswersCount,
  getIncorrectAnswersCount,
  setShowReview,
  isSendingToDiscord,
  discordSent,
  resetQuiz,
  userComment,
  setUserComment,
  handleNameSubmit,
  uploadComment,
  isSendingToCommentDiscord,
  commentDiscordSent,
}) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
        <CheckCircle className="h-10 w-10 text-white" />
      </div>

      <h2 className="mb-6 text-3xl font-bold text-slate-800">퀴즈 완료!</h2>

      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <span
            className={`text-4xl font-bold ${getScoreColor(calculateScore())}`}
          >
            {Math.round(calculateScore())}점
          </span>
        </div>
        <p
          className={`text-xl font-semibold ${getScoreColor(calculateScore())}`}
        >
          {getScoreMessage(calculateScore())}
        </p>
      </div>

      <div className="mb-8 rounded-xl bg-slate-50 p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {questions.length}
            </p>
            <p className="text-sm text-slate-600">총 문제</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {getCorrectAnswersCount()}
            </p>
            <p className="text-sm text-slate-600">정답</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {getIncorrectAnswersCount()}
            </p>
            <p className="text-sm text-slate-600">오답</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-center gap-4 sm:flex-row">
        <button
          onClick={() => setShowReview(true)}
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <BookOpen className="h-4 w-4" />
          <span>오답 확인</span>
        </button>
      </div>

      {/* Discord Status */}
      <div className="mb-6">
        {isSendingToDiscord ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="font-medium text-blue-800">
                서버로 결과를 전송하고 있습니다...
              </span>
            </div>
          </div>
        ) : discordSent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-center space-x-3">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-800">
                서버로 결과가 전송되었습니다!
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-center space-x-3">
              <Send className="h-5 w-5 text-slate-600" />
              <span className="font-medium text-slate-800">
                잠시 후 서버로 자동 전송됩니다
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={resetQuiz}
        className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 px-8 py-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
      >
        <RotateCcw className="h-4 w-4" />
        <span>새로운 퀴즈</span>
      </button>
      <div className="mx-auto mb-8 flex max-w-md items-center gap-4 pt-12">
        <input
          type="text"
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          placeholder="의견이 있나요? 적어주세요"
          className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNameSubmit();
          }}
        />

        <button
          onClick={uploadComment}
          disabled={isSendingToCommentDiscord || commentDiscordSent}
          className={`inline-flex items-center space-x-2 rounded-xl px-5 py-3 text-white shadow-lg transition-all duration-200 active:scale-95 ${
            commentDiscordSent
              ? "cursor-not-allowed bg-gray-400"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 hover:shadow-xl"
          } `}
        >
          <Send className="h-4 w-4" />
          <span>{commentDiscordSent ? "완료~" : "보내기"}</span>
        </button>
      </div>
    </div>
  );
}
