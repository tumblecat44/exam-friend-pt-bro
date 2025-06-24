"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import Welcome from "@/components/setup/Welcome";
import NameInput from "@/components/setup/NameInput";
import LengthSelection from "@/components/setup/LengthSelection";
import FileUpload from "@/components/setup/FileUpload";
import QuizView from "@/components/quiz/QuizView";
import ResultsView from "@/components/quiz/ResultsView";
import ReviewView from "@/components/quiz/ReviewView";

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
  const [userComment, setUserComment] = useState("");
  const [showHome, setShowHome] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false); // Start with name input
  const [showLengthSelection, setShowLengthSelection] = useState(false);
  const [selectedLength, setSelectedLength] = useState("");
  const [isSendingToDiscord, setIsSendingToDiscord] = useState(false);
  const [discordSent, setDiscordSent] = useState(false);
  const [commentDiscordSent, setCommentDiscordSent] = useState(false);
  const [isSendingToCommentDiscord, setIsSendingToCommentDiscord] =
    useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Question length options
  const lengthOptions = [
    {
      id: "short",
      label: "짧게",
      description: "5-7문제",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "medium",
      label: "적당히",
      description: "8-10문제",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "long",
      label: "길게",
      description: "10-15문제",
      color: "from-purple-500 to-pink-600",
    },
  ];

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

  const handleHomeSubmit = () => {
    setShowHome(false);
    setShowNameInput(true);
    setError("");
  };

  const handleNameSubmit = () => {
    if (!userName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setShowNameInput(false);
    setShowLengthSelection(true);
    setError("");
  };

  const handleLengthSelection = () => {
    if (!selectedLength) {
      setError("문제 길이를 선택해주세요.");
      return;
    }
    setShowLengthSelection(false);
    setError("");
  };

  const handleBackToHome = () => {
    setShowHome(true);
    setShowNameInput(false);
    setError("");
  };

  const handleBackToName = () => {
    setShowLengthSelection(false);
    setShowNameInput(true);
    setError("");
  };

  const handleBackToLength = () => {
    setShowLengthSelection(true);
    setError("");
  };

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
    formData.append("length", selectedLength);

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

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateScore = () => {
    if (questions.length === 0) return 0;
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
    setShowNameInput(true);
    setShowLengthSelection(false);
    setSelectedLength("");
    setDiscordSent(false);
    setCommentDiscordSent(false);
  };

  const uploadComment = async () => {
    if (commentDiscordSent) return;

    setIsSendingToCommentDiscord(true);
    try {
      const response = await fetch("/api/upload-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          comment: userComment,
        }),
      });

      if (response.ok) {
        setCommentDiscordSent(true);
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending to Discord:", error);
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSendingToCommentDiscord(false);
    }
  };

  const renderSetupSteps = () => {
    if (showHome) {
      return <Welcome onStart={handleHomeSubmit} />;
    }
    if (showNameInput) {
      return (
        <NameInput
          userName={userName}
          setUserName={setUserName}
          onSubmit={handleNameSubmit}
          onBack={handleBackToHome}
          error={error}
        />
      );
    }
    if (showLengthSelection) {
      return (
        <LengthSelection
          lengthOptions={lengthOptions}
          selectedLength={selectedLength}
          setSelectedLength={setSelectedLength}
          onSubmit={handleLengthSelection}
          onBack={handleBackToName}
          error={error}
        />
      );
    }
    return (
      <FileUpload
        onFileUpload={handleFileUpload}
        onBack={handleBackToLength}
        error={error}
      />
    );
  };

  const renderQuizContent = () => {
    if (showResults) {
      return (
        <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm">
          {!showReview ? (
            <ResultsView
              questions={questions}
              calculateScore={calculateScore}
              getScoreColor={getScoreColor}
              getScoreMessage={getScoreMessage}
              getCorrectAnswersCount={getCorrectAnswersCount}
              getIncorrectAnswersCount={getIncorrectAnswersCount}
              setShowReview={setShowReview}
              isSendingToDiscord={isSendingToDiscord}
              discordSent={discordSent}
              resetQuiz={resetQuiz}
              userComment={userComment}
              setUserComment={setUserComment}
              handleNameSubmit={handleNameSubmit}
              uploadComment={uploadComment}
              isSendingToCommentDiscord={isSendingToCommentDiscord}
              commentDiscordSent={commentDiscordSent}
            />
          ) : (
            <ReviewView
              questions={questions}
              getFilteredQuestions={getFilteredQuestions}
              reviewMode={reviewMode}
              setReviewMode={setReviewMode}
              getCorrectAnswersCount={getCorrectAnswersCount}
              getIncorrectAnswersCount={getIncorrectAnswersCount}
              setShowReview={setShowReview}
              selectedAnswers={selectedAnswers}
              isAnswerCorrect={isAnswerCorrect}
              resetQuiz={resetQuiz}
            />
          )}
        </div>
      );
    }

    return (
      <QuizView
        file={file}
        userName={userName}
        questions={questions}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        selectedAnswers={selectedAnswers}
        handleAnswerSelect={handleAnswerSelect}
        setShowResults={setShowResults}
        isLoading={isLoading}
        uploadProgress={uploadProgress}
        isQuizInProgress={isQuizInProgress}
      />
    );
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

        <div className="mx-auto max-w-4xl">
          {!file ? renderSetupSteps() : renderQuizContent()}
        </div>
      </div>
    </main>
  );
}
