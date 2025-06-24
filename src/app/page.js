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

// 메인 홈 컴포넌트 - 퀴즈 애플리케이션의 전체 상태와 플로우를 관리
export default function Home() {
  // 파일 관련 상태
  const [file, setFile] = useState(null); // 업로드된 파일
  const [questions, setQuestions] = useState([]); // 생성된 퀴즈 문제들

  // 퀴즈 진행 관련 상태
  const [currentQuestion, setCurrentQuestion] = useState(0); // 현재 문제 인덱스
  const [selectedAnswers, setSelectedAnswers] = useState({}); // 사용자가 선택한 답안들

  // 화면 표시 관련 상태
  const [showResults, setShowResults] = useState(false); // 결과 화면 표시 여부
  const [showReview, setShowReview] = useState(false); // 리뷰 화면 표시 여부
  const [reviewMode, setReviewMode] = useState("all"); // 리뷰 모드: "all", "incorrect", "correct"

  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false); // 퀴즈 생성 중 로딩 상태
  const [uploadProgress, setUploadProgress] = useState(0); // 파일 업로드 진행률
  const [error, setError] = useState(""); // 에러 메시지

  // 사용자 정보
  const [userName, setUserName] = useState(""); // 사용자 이름
  const [userComment, setUserComment] = useState(""); // 사용자 코멘트

  // 설정 단계별 화면 표시 상태
  const [showHome, setShowHome] = useState(true); // 홈 화면 표시 여부
  const [showNameInput, setShowNameInput] = useState(false); // 이름 입력 화면 표시 여부
  const [showLengthSelection, setShowLengthSelection] = useState(false); // 문제 길이 선택 화면 표시 여부
  const [selectedLength, setSelectedLength] = useState(""); // 선택된 문제 길이

  // Discord 전송 관련 상태
  const [isSendingToDiscord, setIsSendingToDiscord] = useState(false); // Discord 전송 중 상태
  const [discordSent, setDiscordSent] = useState(false); // Discord 전송 완료 여부
  const [commentDiscordSent, setCommentDiscordSent] = useState(false); // 코멘트 Discord 전송 완료 여부
  const [isSendingToCommentDiscord, setIsSendingToCommentDiscord] =
    useState(false); // 코멘트 Discord 전송 중 상태

  // 파일 크기 제한 (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // 문제 길이 옵션 설정
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

  // 퀴즈 진행 중인지 확인하는 computed 값
  // 파일이 있고, 문제가 생성되었고, 결과 화면이 아니고, 로딩 중이 아닐 때
  const isQuizInProgress =
    file && questions.length > 0 && !showResults && !isLoading;

  // 퀴즈 진행 중 페이지 이탈 시 경고 메시지 표시
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isQuizInProgress) {
        e.preventDefault();
        e.returnValue =
          "퀴즈 진행 중입니다. 페이지를 나가면 답안이 모두 사라집니다. 정말 나가시겠습니까?";
        return "퀴즈 진행 중입니다. 페이지를 나가면 답안이 모두 사라집니다. 정말 나가시겠습니까?";
      }
    };

    // 퀴즈 진행 중일 때만 이벤트 리스너 등록
    if (isQuizInProgress) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isQuizInProgress]);

  // 결과 화면 표시 시 자동으로 Discord에 결과 전송
  useEffect(() => {
    // 결과 화면이 표시되고, 아직 Discord에 전송하지 않았고, 사용자 이름과 문제가 있을 때
    if (showResults && !discordSent && userName && questions.length > 0) {
      // 1초 후에 자동으로 Discord에 전송
      const timer = setTimeout(() => {
        sendToDiscord();
      }, 1000); // 1초 지연

      // 컴포넌트 언마운트 시 타이머 클리어
      return () => clearTimeout(timer);
    }
  }, [showResults, discordSent, userName, questions.length]);

  // 홈 화면에서 시작 버튼 클릭 시 실행되는 함수
  const handleHomeSubmit = () => {
    setShowHome(false); // 홈 화면 숨기기
    setShowNameInput(true); // 이름 입력 화면 표시
    setError(""); // 에러 메시지 초기화
  };

  // 이름 입력 화면에서 다음 버튼 클릭 시 실행되는 함수
  const handleNameSubmit = () => {
    // 이름이 비어있거나 공백만 있는지 확인
    if (!userName.trim()) {
      setError("이름을 입력해주세요."); // 에러 메시지 설정
      return; // 함수 종료
    }
    setShowNameInput(false); // 이름 입력 화면 숨기기
    setShowLengthSelection(true); // 문제 길이 선택 화면 표시
    setError(""); // 에러 메시지 초기화
  };

  // 문제 길이 선택 화면에서 다음 버튼 클릭 시 실행되는 함수
  const handleLengthSelection = () => {
    // 문제 길이가 선택되지 않았는지 확인
    if (!selectedLength) {
      setError("문제 길이를 선택해주세요."); // 에러 메시지 설정
      return; // 함수 종료
    }
    setShowLengthSelection(false); // 문제 길이 선택 화면 숨기기
    setError(""); // 에러 메시지 초기화
  };

  // 이름 입력 화면에서 홈으로 돌아가기 버튼 클릭 시 실행되는 함수
  const handleBackToHome = () => {
    setShowHome(true); // 홈 화면 표시
    setShowNameInput(false); // 이름 입력 화면 숨기기
    setError(""); // 에러 메시지 초기화
  };

  // 문제 길이 선택 화면에서 이름 입력으로 돌아가기 버튼 클릭 시 실행되는 함수
  const handleBackToName = () => {
    setShowLengthSelection(false); // 문제 길이 선택 화면 숨기기
    setShowNameInput(true); // 이름 입력 화면 표시
    setError(""); // 에러 메시지 초기화
  };

  // 파일 업로드 화면에서 문제 길이 선택으로 돌아가기 버튼 클릭 시 실행되는 함수
  const handleBackToLength = () => {
    setShowLengthSelection(true); // 문제 길이 선택 화면 표시
    setError(""); // 에러 메시지 초기화
  };

  // 파일 업로드 처리 함수 (비동기)
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0]; // 업로드된 첫 번째 파일 가져오기
    setError(""); // 이전 에러 메시지 초기화

    // 파일이 선택되지 않은 경우 함수 종료
    if (!uploadedFile) return;

    // 파일 타입 검사 - PDF 파일만 허용
    if (uploadedFile.type !== "application/pdf") {
      setError("PDF 파일만 업로드 가능합니다."); // 에러 메시지 설정
      return; // 함수 종료
    }

    // 파일 크기 검사 - 최대 10MB까지 허용
    if (uploadedFile.size > MAX_FILE_SIZE) {
      const fileSizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(2); // 파일 크기를 MB 단위로 변환
      setError(`파일 크기가 10MB를 초과합니다. 현재 크기: ${fileSizeMB}MB`); // 에러 메시지 설정
      return; // 함수 종료
    }

    // 파일 업로드 시작 - 상태 설정
    setFile(uploadedFile); // 업로드된 파일 저장
    setIsLoading(true); // 로딩 상태 시작
    setUploadProgress(0); // 진행률 초기화

    // 업로드 진행률 시뮬레이션을 위한 인터벌 설정
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval); // 90%에 도달하면 인터벌 중지
          return 90; // 90%에서 멈춤 (실제 업로드 완료 시 100%로 설정)
        }
        return prev + 10; // 10%씩 증가
      });
    }, 200); // 200ms마다 실행

    // FormData 객체 생성하여 파일과 문제 길이 정보 추가
    const formData = new FormData();
    formData.append("file", uploadedFile); // 파일 추가
    formData.append("length", selectedLength); // 선택된 문제 길이 추가

    try {
      // API 엔드포인트에 POST 요청으로 파일 업로드 및 문제 생성 요청
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });

      // 응답을 JSON으로 파싱
      const data = await response.json();

      // 응답이 성공적이지 않은 경우 에러 처리
      if (!response.ok) {
        throw new Error(data.error || "문제 생성에 실패했습니다.");
      }

      // 생성된 문제가 없거나 빈 배열인 경우 에러 처리
      if (!data.questions || data.questions.length === 0) {
        throw new Error(
          "생성된 문제가 없습니다. 다른 PDF 파일을 시도해주세요.",
        );
      }

      // 성공적으로 문제가 생성된 경우
      setUploadProgress(100); // 진행률을 100%로 설정
      setTimeout(() => {
        setQuestions(data.questions); // 생성된 문제들 저장
        setIsLoading(false); // 로딩 상태 종료
      }, 500); // 0.5초 후에 실행하여 사용자에게 완료 피드백 제공
    } catch (error) {
      // 에러 발생 시 처리
      console.error("Error:", error); // 콘솔에 에러 로그 출력

      // 에러 발생 시 상태 초기화
      setFile(null); // 파일 상태 초기화
      setIsLoading(false); // 로딩 상태 종료
      setUploadProgress(0); // 진행률 초기화

      // 사용자 친화적인 에러 메시지 처리
      let errorMessage = error.message; // 기본 에러 메시지

      // 특정 에러 케이스별 맞춤 메시지 처리
      if (
        error.message.includes("피그마") ||
        error.message.includes("이미지 기반")
      ) {
        // 피그마나 이미지 기반 PDF 에러
        errorMessage =
          "피그마나 이미지 기반 PDF는 지원하지 않습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.";
      } else if (error.message.includes("텍스트를 추출할 수 없습니다")) {
        // 텍스트 추출 실패 에러
        errorMessage =
          "PDF에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF 파일인지 확인해주세요.";
      } else if (error.message.includes("파일 크기")) {
        // 파일 크기 에러 - 원본 메시지 유지
        errorMessage = error.message;
      } else if (error.message.includes("문제 생성에 실패")) {
        // 일반적인 문제 생성 실패 에러
        errorMessage =
          "문제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }

      setError(errorMessage); // 최종 에러 메시지 설정
    }
  };

  // 사용자가 특정 질문에 대해 선택한 답안을 상태로 저장하는 함수
  const handleAnswerSelect = (questionId, answer) => {
    // 이전 상태를 복사하고 해당 질문 ID에 대한 답안을 갱신
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // 점수를 계산하는 함수 (정답 수 / 전체 문항 수 * 100)
  const calculateScore = () => {
    if (questions.length === 0) return 0; // 문항이 없는 경우 0점 반환
    let correct = 0;
    questions.forEach((question, index) => {
      // 선택한 답이 정답과 일치하는 경우 correct 증가
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100; // 백분율로 점수 계산
  };

  // 점수에 따라 색상을 반환하는 함수 (TailwindCSS 클래스명 반환)
  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-600"; // 90점 이상은 초록색
    if (score >= 70) return "text-blue-600"; // 70점 이상은 파란색
    if (score >= 50) return "text-amber-600"; // 50점 이상은 주황색
    return "text-red-600"; // 그 이하는 빨간색
  };

  // 점수에 따라 메시지를 반환하는 함수
  const getScoreMessage = (score) => {
    if (score >= 90) return "완벽합니다!"; // 90점 이상
    if (score >= 70) return "잘했어요!"; // 70점 이상
    if (score >= 50) return "노력이 필요해요"; // 50점 이상
    return "더 공부해보세요"; // 그 이하는 재학습 권장
  };

  // 맞은 문제 수를 계산하는 함수
  const getCorrectAnswersCount = () => {
    return questions.filter(
      (_, index) => selectedAnswers[index] === questions[index].correctAnswer,
    ).length;
  };

  // 틀린 문제 수를 계산하는 함수
  const getIncorrectAnswersCount = () => {
    return questions.length - getCorrectAnswersCount(); // 전체 - 정답 수
  };

  // 특정 문제의 정답 여부를 판단하는 함수
  const isAnswerCorrect = (questionIndex) => {
    return (
      selectedAnswers[questionIndex] === questions[questionIndex].correctAnswer
    );
  };

  // 검토 모드에 따라 문항을 필터링해서 반환하는 함수
  const getFilteredQuestions = () => {
    switch (reviewMode) {
      case "incorrect": // 오답만 보기
        return questions.filter((_, index) => !isAnswerCorrect(index));
      case "correct": // 정답만 보기
        return questions.filter((_, index) => isAnswerCorrect(index));
      default: // 모두 보기
        return questions;
    }
  };

  // 시험 결과를 Discord 웹훅으로 전송하는 함수
  const sendToDiscord = async () => {
    if (discordSent) return; // 이미 전송되었으면 중복 방지

    setIsSendingToDiscord(true); // 전송 중 상태 설정
    try {
      const response = await fetch("/api/send-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName, // 사용자 이름
          score: calculateScore(), // 점수
          totalQuestions: questions.length, // 전체 문항 수
          correctAnswers: getCorrectAnswersCount(), // 정답 수
          incorrectAnswers: getIncorrectAnswersCount(), // 오답 수
          fileName: file.name, // 업로드한 파일 이름
        }),
      });

      if (response.ok) {
        setDiscordSent(true); // 전송 성공 처리
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending to Discord:", error); // 콘솔에 에러 출력
      setError("저장에 실패했습니다. 다시 시도해주세요."); // 사용자 에러 표시
    } finally {
      setIsSendingToDiscord(false); // 로딩 상태 해제
    }
  };

  // 퀴즈를 초기 상태로 리셋하는 함수
  const resetQuiz = () => {
    setFile(null); // 파일 초기화
    setQuestions([]); // 문항 초기화
    setCurrentQuestion(0); // 현재 질문 인덱스 초기화
    setSelectedAnswers({}); // 선택한 답변 초기화
    setShowResults(false); // 결과 화면 비활성화
    setShowReview(false); // 검토 모드 비활성화
    setReviewMode("all"); // 검토모드 초기값
    setError(""); // 에러 메시지 초기화
    setUserName(""); // 사용자 이름 초기화
    setShowNameInput(true); // 이름 입력화면 다시 보이기
    setShowLengthSelection(false); // 길이 선택 화면 비활성화
    setSelectedLength(""); // 선택한 길이 초기화
    setDiscordSent(false); // Discord 전송 상태 초기화
    setCommentDiscordSent(false); // 댓글 전송 상태 초기화
  };

  // 사용자 코멘트를 Discord로 업로드하는 함수
  const uploadComment = async () => {
    if (commentDiscordSent) return; // 중복 방지

    setIsSendingToCommentDiscord(true); // 전송 중 상태 설정
    try {
      const response = await fetch("/api/upload-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName, // 사용자 이름
          comment: userComment, // 입력한 코멘트
        }),
      });

      if (response.ok) {
        setCommentDiscordSent(true); // 전송 완료
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending to Discord:", error);
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSendingToCommentDiscord(false); // 로딩 상태 해제
    }
  };

  // 설정 단계별로 화면을 렌더링하는 함수
  const renderSetupSteps = () => {
    if (showHome) {
      return <Welcome onStart={handleHomeSubmit} />; // 시작화면
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
    // 파일 업로드 화면
    return (
      <FileUpload
        onFileUpload={handleFileUpload}
        onBack={handleBackToLength}
        error={error}
      />
    );
  };

  // 퀴즈 진행 및 결과, 검토 화면 렌더링
  const renderQuizContent = () => {
    if (showResults) {
      return (
        <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm">
          {!showReview ? (
            // 결과 화면
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
            // 리뷰(정답/오답 보기) 화면
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

    // 퀴즈 진행 중일 때 화면
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

  // 전체 컴포넌트의 루트 JSX 반환
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 배경 패턴 (SVG 원) */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 헤더 영역 */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-white shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            시험 친구 피티형
          </h1>
          <p className="text-lg text-slate-600">혼자서도 즐기는 문제 문답</p>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="mx-auto max-w-4xl">
          {!file ? renderSetupSteps() : renderQuizContent()}
        </div>
      </div>
    </main>
  );
}
