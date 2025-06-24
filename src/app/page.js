"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setIsLoading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", uploadedFile);

      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate questions");
        }

        if (!data.questions || data.questions.length === 0) {
          throw new Error("No questions were generated");
        }

        setUploadProgress(100);
        setTimeout(() => {
          setQuestions(data.questions);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error:", error);
        alert(`문제 생성 중 오류가 발생했습니다: ${error.message}`);
        setFile(null);
        setIsLoading(false);
      }
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "완벽합니다!";
    if (score >= 70) return "잘했어요!";
    if (score >= 50) return "노력이 필요해요";
    return "더 공부해보세요";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-white shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            시험 친구
          </h1>
          <p className="text-lg text-slate-600">AI가 만드는 맞춤형 학습 경험</p>
        </div>

        {!file ? (
          <div className="mx-auto max-w-2xl">
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

                <label className="group/btn inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
                  <span className="font-medium">PDF 선택하기</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm">
              {!showResults ? (
                <>
                  {/* Header */}
                  <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {file.name}
                          </p>
                          <p className="text-sm text-slate-500">PDF 문서</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">
                          진행률
                        </p>
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
                        {questions[currentQuestion].options.map(
                          (option, index) => (
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
                                checked={
                                  selectedAnswers[currentQuestion] === option
                                }
                                onChange={() =>
                                  handleAnswerSelect(currentQuestion, option)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                                  selectedAnswers[currentQuestion] === option
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300 group-hover:border-blue-400"
                                }`}
                              >
                                {selectedAnswers[currentQuestion] ===
                                  option && (
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-slate-700">{option}</span>
                            </label>
                          ),
                        )}
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
                            onClick={() =>
                              setCurrentQuestion((prev) => prev + 1)
                            }
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
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="mb-6 text-3xl font-bold text-slate-800">
                    퀴즈 완료!
                  </h2>

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
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-slate-800">
                          {questions.length}
                        </p>
                        <p className="text-sm text-slate-600">총 문제</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">
                          {
                            questions.filter(
                              (_, index) =>
                                selectedAnswers[index] ===
                                questions[index].correctAnswer,
                            ).length
                          }
                        </p>
                        <p className="text-sm text-slate-600">정답</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFile(null);
                      setQuestions([]);
                      setCurrentQuestion(0);
                      setSelectedAnswers({});
                      setShowResults(false);
                    }}
                    className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>다시 시작</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
