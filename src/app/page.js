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
  AlertCircle,
  Info,
  X,
  Check,
  Eye,
  BookOpen,
  User,
  Send,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewMode, setReviewMode] = useState("all"); // "all", "incorrect", "correct"
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isSendingToDiscord, setIsSendingToDiscord] = useState(false);
  const [discordSent, setDiscordSent] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Check if user is in the middle of taking a quiz
  const isQuizInProgress =
    file && questions.length > 0 && !showResults && !isLoading;

  // Add beforeunload event listener to warn users when leaving during quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isQuizInProgress) {
        e.preventDefault();
        e.returnValue =
          "퀴즈 진행 중입니다. 페이지를 나가면 답안이 모두 사라집니다. 정말 나가시겠습니까?";
        return "퀴즈 진행 중입니다. 페이지를 나가면 답안이 모두 사라집니다. 정말 나가시겠습니까?";
      }
    };

    if (isQuizInProgress) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isQuizInProgress]);

  // Auto-send to Discord when results are shown
  useEffect(() => {
    if (showResults && !discordSent && userName && questions.length > 0) {
      // Auto-send to Discord after a short delay
      const timer = setTimeout(() => {
        sendToDiscord();
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [showResults, discordSent, userName, questions.length]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setError(""); // Clear previous errors

    if (!uploadedFile) return;

    // Check file type
    if (uploadedFile.type !== "application/pdf") {
      setError("PDF 파일만 업로드 가능합니다.");
      return;
    }

    // Check file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      const fileSizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(2);
      setError(`파일 크기가 10MB를 초과합니다. 현재 크기: ${fileSizeMB}MB`);
      return;
    }

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
        throw new Error(data.error || "문제 생성에 실패했습니다.");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error(
          "생성된 문제가 없습니다. 다른 PDF 파일을 시도해주세요.",
        );
      }

      setUploadProgress(100);
      setTimeout(() => {
        setQuestions(data.questions);
        setIsLoading(false);
        // Show name input after questions are generated
        setShowNameInput(true);
      }, 500);
    } catch (error) {
      console.error("Error:", error);

      // Clear the file and loading state
      setFile(null);
      setIsLoading(false);
      setUploadProgress(0);

      // Show user-friendly error message
      let errorMessage = error.message;

      // Handle specific error cases
      if (
        error.message.includes("피그마") ||
        error.message.includes("이미지 기반")
      ) {
        errorMessage =
          "피그마나 이미지 기반 PDF는 지원하지 않습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.";
      } else if (error.message.includes("텍스트를 추출할 수 없습니다")) {
        errorMessage =
          "PDF에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF 파일인지 확인해주세요.";
      } else if (error.message.includes("파일 크기")) {
        errorMessage = error.message; // Keep the original size error message
      } else if (error.message.includes("문제 생성에 실패")) {
        errorMessage =
          "문제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }

      setError(errorMessage);
    }
  };

  const handleStartQuiz = () => {
    if (!userName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setShowNameInput(false);
    setError("");
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

  const getCorrectAnswersCount = () => {
    return questions.filter(
      (_, index) => selectedAnswers[index] === questions[index].correctAnswer,
    ).length;
  };

  const getIncorrectAnswersCount = () => {
    return questions.length - getCorrectAnswersCount();
  };

  const isAnswerCorrect = (questionIndex) => {
    return (
      selectedAnswers[questionIndex] === questions[questionIndex].correctAnswer
    );
  };

  const getFilteredQuestions = () => {
    switch (reviewMode) {
      case "incorrect":
        return questions.filter((_, index) => !isAnswerCorrect(index));
      case "correct":
        return questions.filter((_, index) => isAnswerCorrect(index));
      default:
        return questions;
    }
  };

  const sendToDiscord = async () => {
    if (discordSent) return;

    setIsSendingToDiscord(true);
    try {
      const response = await fetch("/api/send-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          score: calculateScore(),
          totalQuestions: questions.length,
          correctAnswers: getCorrectAnswersCount(),
          incorrectAnswers: getIncorrectAnswersCount(),
          fileName: file.name,
        }),
      });

      if (response.ok) {
        setDiscordSent(true);
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending to Discord:", error);
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSendingToDiscord(false);
    }
  };

  const resetQuiz = () => {
    setFile(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowReview(false);
    setReviewMode("all");
    setError("");
    setUserName("");
    setShowNameInput(false);
    setDiscordSent(false);
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
            시험 친구 피티형
          </h1>
          <p className="text-lg text-slate-600">혼자서도 즐기는 문제 문답</p>
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

                {/* File Requirements */}
                <div className="mb-8 rounded-xl bg-slate-50 p-6 text-left">
                  <div className="flex items-start space-x-3">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800">
                        파일 요구사항
                      </h3>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• 파일 형식: PDF만 지원</li>
                        <li>
                          • 최대 파일 크기:{" "}
                          <span className="font-medium text-blue-600">
                            10MB
                          </span>
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
              {showNameInput ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="mb-6 text-3xl font-bold text-slate-800">
                    이름을 입력해주세요
                  </h2>
                  <p className="mb-8 text-slate-600">
                    당신의 이름은 무엇입니까?
                  </p>

                  <div className="mx-auto mb-8 max-w-md">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleStartQuiz();
                        }
                      }}
                    />
                  </div>

                  {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <div>
                          <h3 className="font-medium text-red-800">
                            오류 발생
                          </h3>
                          <p className="mt-1 text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStartQuiz}
                    className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    <span>퀴즈 시작하기</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : !showResults ? (
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
                          <p className="text-sm text-slate-500">
                            {(file.size / (1024 * 1024)).toFixed(2)}MB • PDF
                            문서 • {userName}
                          </p>
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
                      {/* Quiz Progress Warning */}
                      {isQuizInProgress && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                            <div>
                              <h3 className="font-medium text-amber-800">
                                퀴즈 진행 중
                              </h3>
                              <p className="mt-1 text-sm text-amber-600">
                                페이지를 나가면 답안이 모두 사라집니다. 퀴즈를
                                완료한 후 나가주세요.
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
              ) : !showReview ? (
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
                </div>
              ) : (
                <div className="p-8">
                  {/* Review Header */}
                  <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            문제 리뷰
                          </p>
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
                                    isCorrect
                                      ? "text-emerald-800"
                                      : "text-red-800"
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
                              const isCorrectAnswer =
                                question.correctAnswer === option;

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
                                <span className="font-medium text-slate-600">
                                  내 답안:
                                </span>
                                <span
                                  className={`ml-2 font-medium ${
                                    isCorrect
                                      ? "text-emerald-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {userAnswer || "답안 없음"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">
                                  정답:
                                </span>
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
                        <span>새로운 퀴즈</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
