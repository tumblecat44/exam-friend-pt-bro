"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);

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

        setQuestions(data.questions);
      } catch (error) {
        console.error("Error:", error);
        alert(`문제 생성 중 오류가 발생했습니다: ${error.message}`);
        setFile(null);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-blue-800">
          시험 친구 피티형
        </h1>

        {!file ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mb-6">
              <Upload className="mx-auto h-16 w-16 text-blue-500" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold">
              PDF 파일을 업로드하세요
            </h2>
            <p className="mb-6 text-gray-600">
              학습지를 PDF로 업로드하면 자동으로 문제가 생성됩니다.
            </p>
            <label className="cursor-pointer rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600">
              PDF 선택
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            {!showResults ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-blue-500" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <span className="text-gray-500">
                    문제 {currentQuestion + 1} / {questions.length}
                  </span>
                </div>

                {questions.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">
                      {questions[currentQuestion].question}
                    </h3>
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map(
                        (option, index) => (
                          <label
                            key={index}
                            className="flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50"
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
                              className="mr-3"
                            />
                            {option}
                          </label>
                        ),
                      )}
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={() => setCurrentQuestion((prev) => prev - 1)}
                        disabled={currentQuestion === 0}
                        className="px-4 py-2 text-gray-600 disabled:opacity-50"
                      >
                        이전
                      </button>
                      {currentQuestion === questions.length - 1 ? (
                        <button
                          onClick={() => setShowResults(true)}
                          className="rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600"
                        >
                          결과 확인
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentQuestion((prev) => prev + 1)}
                          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                        >
                          다음
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-600">문제를 생성하는 중입니다...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="mb-4 text-2xl font-semibold">결과</h2>
                <p className="mb-6 text-3xl font-bold text-blue-600">
                  {calculateScore()}점
                </p>
                <button
                  onClick={() => {
                    setFile(null);
                    setQuestions([]);
                    setCurrentQuestion(0);
                    setSelectedAnswers({});
                    setShowResults(false);
                  }}
                  className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
