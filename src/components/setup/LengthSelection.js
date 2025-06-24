"use client";

import { ArrowLeft, ArrowRight, AlertCircle, BookOpen } from "lucide-react";

export default function LengthSelection({
  lengthOptions,
  selectedLength,
  setSelectedLength,
  onSubmit,
  onBack,
  error,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:ring-slate-300/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      <div className="relative p-12 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          문제 길이를 선택해주세요
        </h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          원하는 퀴즈 길이를 선택하세요.
        </p>

        <div className="mx-auto mb-8 max-w-2xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {lengthOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedLength(option.id)}
                className={`rounded-xl border-2 p-6 transition-all duration-200 hover:scale-105 ${
                  selectedLength === option.id
                    ? `border-blue-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="text-center">
                  <h3
                    className={`mb-2 text-lg font-semibold ${
                      selectedLength === option.id
                        ? "text-white"
                        : "text-slate-800"
                    }`}
                  >
                    {option.label}
                  </h3>
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

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>뒤로</span>
          </button>
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
