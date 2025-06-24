"use client";

import { Upload, Info, AlertCircle, ArrowLeft } from "lucide-react";

export default function FileUpload({ onFileUpload, onBack, error }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:ring-slate-300/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      <div className="relative p-12 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Upload className="h-10 w-10 text-white" />
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          PDF 파일을 업로드하세요
        </h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          학습 자료를 PDF로 업로드하면 AI가 자동으로
          <br />
          맞춤형 문제를 생성해드립니다
        </p>

        {/* File Requirements */}
        <div className="mb-8 rounded-xl bg-slate-50 p-6 text-left">
          <div className="flex items-start space-x-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">파일 요구사항</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• 파일 형식: PDF만 지원</li>
                <li>
                  • 최대 파일 크기:{" "}
                  <span className="font-medium text-blue-600">10MB</span>
                </li>
                <li>• 텍스트가 포함된 PDF 파일 권장</li>
                <li>• 피그마 등 이미지 기반 PDF는 지원하지 않습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
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

        <label className="group/btn inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
          <span className="font-medium">PDF 선택하기</span>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            className="hidden"
          />
        </label>

        <div className="mt-6">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>뒤로</span>
          </button>
        </div>
      </div>
    </div>
  );
}
