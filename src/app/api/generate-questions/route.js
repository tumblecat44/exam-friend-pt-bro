import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const length = formData.get("length") || "medium"; // Default to medium if not provided

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds the 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 400 },
      );
    }

    // Check file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      );
    }

    try {
      // Convert file to blob
      const blob = new Blob([await file.arrayBuffer()], {
        type: "application/pdf",
      });
      console.log("PDF file loaded, size:", blob.size, "bytes");

      // Try multiple PDF loading strategies for better compatibility
      let docs = [];
      let loadingMethod = "default";

      try {
        // Method 1: Standard PDFLoader
        console.log("Attempting standard PDF loading...");
        const loader = new PDFLoader(blob, {
          splitPages: true,
        });
        docs = await loader.load();
        loadingMethod = "standard";
        console.log("Standard PDF loading successful, pages:", docs.length);
      } catch (error) {
        console.log("Standard PDF loading failed:", error.message);

        try {
          // Method 2: PDFLoader with minimal options for better compatibility
          console.log("Attempting PDF loading with minimal options...");
          const loader = new PDFLoader(blob, {
            splitPages: false,
          });
          docs = await loader.load();
          loadingMethod = "minimal";
          console.log("Minimal PDF loading successful, pages:", docs.length);
        } catch (error2) {
          console.log("Minimal PDF loading failed:", error2.message);

          try {
            // Method 3: PDFLoader with different chunking strategy
            console.log("Attempting PDF loading with different strategy...");
            const loader = new PDFLoader(blob, {
              splitPages: true,
            });
            docs = await loader.load();
            loadingMethod = "alternative";
            console.log(
              "Alternative PDF loading successful, pages:",
              docs.length,
            );
          } catch (error3) {
            console.log("All PDF loading methods failed");
            throw new Error(
              `PDF 처리에 실패했습니다. 피그마나 이미지 기반 PDF의 경우 텍스트 추출이 어려울 수 있습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.`,
            );
          }
        }
      }

      if (docs.length === 0) {
        throw new Error(
          "PDF에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF 파일인지 확인해주세요.",
        );
      }

      // Log the content of each page for debugging
      docs.forEach((doc, index) => {
        console.log(
          `Page ${index + 1} content length:`,
          doc.pageContent.length,
        );
        console.log(
          `Page ${index + 1} preview:`,
          doc.pageContent.substring(0, 100),
        );
      });

      // Check if content is mostly empty (common with image-based PDFs)
      const totalContentLength = docs.reduce(
        (sum, doc) => sum + doc.pageContent.length,
        0,
      );
      if (totalContentLength < 100) {
        throw new Error(
          "추출된 텍스트가 너무 짧습니다. 피그마나 이미지 기반 PDF의 경우 텍스트 추출이 어려울 수 있습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.",
        );
      }

      // Split text into chunks with adjusted parameters
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500, // Reduced chunk size
        chunkOverlap: 50, // Reduced overlap
        lengthFunction: (text) => text.length,
        separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
      });

      let splitDocs = await textSplitter.splitDocuments(docs);
      console.log("Text split into chunks:", splitDocs.length);

      if (splitDocs.length === 0) {
        // Try alternative splitting method if the first attempt fails
        console.log(
          "First splitting attempt failed, trying alternative method...",
        );
        const alternativeSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 200,
          chunkOverlap: 20,
          lengthFunction: (text) => text.length,
          separators: ["\n", ".", " ", ""],
        });

        const alternativeDocs = await alternativeSplitter.splitDocuments(docs);
        console.log("Alternative splitting result:", alternativeDocs.length);

        if (alternativeDocs.length === 0) {
          throw new Error(
            "텍스트를 청크로 분할할 수 없습니다. PDF 내용을 다시 확인해주세요.",
          );
        }

        splitDocs = alternativeDocs;
      }

      // Create vector store
      const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        }),
      );
      console.log("Vector store created");

      // Initialize OpenAI with stricter parameters
      const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,
        maxTokens: 500,
      });

      // Generate questions with duplicate prevention
      const questions = [];
      const usedContents = new Set(); // Track used content to prevent duplicates
      const usedQuestions = new Set(); // Track question text to prevent duplicates
      let attempts = 0;
      const maxAttempts = 50; // Increased attempts for better coverage

      // Calculate target questions based on length preference
      let targetQuestions;
      switch (length) {
        case "short":
          targetQuestions = Math.min(
            7,
            Math.max(5, Math.floor(splitDocs.length / 2)),
          );
          break;
        case "long":
          targetQuestions = Math.min(
            15,
            Math.max(10, Math.floor(splitDocs.length / 1.2)),
          );
          break;
        case "medium":
        default:
          targetQuestions = Math.min(
            10,
            Math.max(8, Math.floor(splitDocs.length / 1.5)),
          );
          break;
      }

      console.log(
        `Target questions: ${targetQuestions} (based on ${splitDocs.length} content chunks, length: ${length})`,
      );

      while (questions.length < targetQuestions && attempts < maxAttempts) {
        attempts++;
        console.log(
          `Attempt ${attempts}: Generating question ${questions.length + 1}/${targetQuestions}`,
        );

        // Get a random chunk of text for question generation
        const availableChunks = splitDocs.filter(
          (_, index) => !usedContents.has(index),
        );

        if (availableChunks.length === 0) {
          console.log(
            "No more unique content chunks available, trying to reuse with different approach",
          );
          // If no more unique chunks, try to generate from already used chunks with different prompts
          const randomChunk =
            splitDocs[Math.floor(Math.random() * splitDocs.length)];
          const content = randomChunk.pageContent;

          if (!content || content.trim().length === 0) {
            console.warn(`Empty content found, skipping...`);
            continue;
          }

          // Use a different prompt for reused content
          const prompt = `
당신은 전문적인 교육 평가 전문가입니다. 주어진 학습 자료를 바탕으로 학습자의 이해도를 정확히 측정할 수 있는 고품질 객관식 문제를 출제합니다.

[역할과 목표]
- 학습자가 핵심 개념을 제대로 이해했는지 평가하는 문제를 작성
- 단순한 암기가 아닌 이해력과 적용력을 측정하는 문제 구성
- 실제 교육 현장에서 사용할 수 있는 수준의 문제 출제

[문제 작성 원칙]
1. 핵심 개념 중심: 문서의 가장 중요한 개념, 원리, 관계를 묻는 문제
2. 이해력 측정: 단순 암기가 아닌 개념 이해와 적용 능력 평가
3. 명확성: 문제와 선택지가 명확하고 혼동의 여지가 없도록 작성
4. 균형감: 모든 선택지가 그럴듯하게 보이도록 구성
5. 다양성: 이전 문제와 다른 관점이나 측면을 다루는 문제

[내용]
${content}

[출력 형식]
아래 JSON 형식으로 정확히 출력하세요. JSON 외의 추가 텍스트는 절대 포함하지 마세요:
{
  "question": "핵심 개념을 묻는 명확한 문제",
  "options": [
    "그럴듯한 보기 1",
    "그럴듯한 보기 2", 
    "그럴듯한 보기 3",
    "그럴듯한 보기 4"
  ],
  "correctAnswer": "정답이 되는 보기"
}

[품질 기준]
1. 문제는 반드시 문서의 핵심 내용을 다뤄야 합니다
2. 선택지는 모두 합리적이고 그럴듯해야 합니다
3. 정답은 반드시 보기 중 하나와 정확히 일치해야 합니다
4. 모든 텍스트는 한글로 작성해주세요
5. 이전 문제와 완전히 다른 내용이나 관점으로 문제를 만들어주세요
6. 문제 난이도는 중간 정도로 설정해주세요

[주의사항]
- JSON 형식이 정확해야 합니다 (쉼표, 따옴표 등)
- 문제와 선택지가 자연스럽고 명확해야 합니다
- 너무 쉬운 문제나 너무 어려운 문제는 피해주세요
- 문서의 내용을 벗어나는 문제는 작성하지 마세요
`;

          try {
            const response = await model.invoke(prompt);
            console.log("Raw response for reused content:", response);

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error("No JSON object found in response");
              continue;
            }

            const jsonStr = jsonMatch[0];
            const questionData = JSON.parse(jsonStr);

            // Validate the question data
            if (
              !questionData.question ||
              !Array.isArray(questionData.options) ||
              questionData.options.length !== 4 ||
              !questionData.correctAnswer
            ) {
              console.error("Invalid question format:", questionData);
              continue;
            }

            // Check for duplicate questions
            const questionText = questionData.question.trim().toLowerCase();
            if (usedQuestions.has(questionText)) {
              console.log("Duplicate question detected, skipping...");
              continue;
            }

            // Ensure the correct answer is one of the options
            if (!questionData.options.includes(questionData.correctAnswer)) {
              console.error("Correct answer not in options:", questionData);
              continue;
            }

            // Validate that all fields are non-empty strings
            if (
              !questionData.question.trim() ||
              questionData.options.some((opt) => !opt.trim())
            ) {
              console.error("Empty fields found in question data");
              continue;
            }

            // Add to used sets and questions array
            usedQuestions.add(questionText);
            questions.push(questionData);
            console.log(
              `Question ${questions.length} generated successfully from reused content`,
            );
          } catch (error) {
            console.error(
              "Error processing question from reused content:",
              error,
            );
            continue;
          }
        } else {
          const randomIndex = Math.floor(
            Math.random() * availableChunks.length,
          );
          const content = availableChunks[randomIndex].pageContent;
          const originalIndex = splitDocs.indexOf(availableChunks[randomIndex]);

          if (!content || content.trim().length === 0) {
            console.warn(`Empty content found, skipping...`);
            usedContents.add(originalIndex);
            continue;
          }

          const prompt = `
간단하지만 효과적인 객관식 문제를 만들어주세요. 주어진 내용의 핵심을 파악하여 기본적인 이해를 확인하는 문제를 작성해주세요.

[목표]
- 문서의 중요한 개념이나 원리를 묻는 문제
- 학습자가 기본적인 이해를 했는지 확인하는 수준
- 명확하고 혼동의 여지가 없는 문제 구성

[내용]
${content}

[출력 형식]
JSON 형식으로 정확히 출력하세요:
{
  "question": "명확하고 간단한 문제",
  "options": ["보기1", "보기2", "보기3", "보기4"],
  "correctAnswer": "정답 보기"
}

[주의사항]
- 문제는 문서의 핵심 내용을 다뤄야 합니다
- 모든 선택지는 합리적이어야 합니다
- 정답은 반드시 보기 중 하나와 일치해야 합니다
- 한글로 작성해주세요
`;

          try {
            const response = await model.invoke(prompt);
            console.log("Raw response:", response);

            // Extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error("No JSON object found in response");
              usedContents.add(originalIndex);
              continue;
            }

            const jsonStr = jsonMatch[0];
            const questionData = JSON.parse(jsonStr);

            // Validate the question data
            if (
              !questionData.question ||
              !Array.isArray(questionData.options) ||
              questionData.options.length !== 4 ||
              !questionData.correctAnswer
            ) {
              console.error("Invalid question format:", questionData);
              usedContents.add(originalIndex);
              continue;
            }

            // Check for duplicate questions
            const questionText = questionData.question.trim().toLowerCase();
            if (usedQuestions.has(questionText)) {
              console.log("Duplicate question detected, skipping...");
              usedContents.add(originalIndex);
              continue;
            }

            // Ensure the correct answer is one of the options
            if (!questionData.options.includes(questionData.correctAnswer)) {
              console.error("Correct answer not in options:", questionData);
              usedContents.add(originalIndex);
              continue;
            }

            // Validate that all fields are non-empty strings
            if (
              !questionData.question.trim() ||
              questionData.options.some((opt) => !opt.trim())
            ) {
              console.error("Empty fields found in question data");
              usedContents.add(originalIndex);
              continue;
            }

            // Add to used sets and questions array
            usedContents.add(originalIndex);
            usedQuestions.add(questionText);
            questions.push(questionData);
            console.log(`Question ${questions.length} generated successfully`);
          } catch (error) {
            console.error("Error processing question:", error);
            usedContents.add(originalIndex);
            continue;
          }
        }
      }

      // Ensure minimum questions based on length preference
      const minQuestions = length === "short" ? 5 : length === "long" ? 10 : 8;
      if (questions.length < minQuestions) {
        console.log(
          `Only ${questions.length} questions generated, trying to generate more to reach minimum ${minQuestions}...`,
        );

        // Try to generate more questions with different approach
        const remainingAttempts = 30; // Increased for longer quizzes
        let additionalAttempts = 0;

        while (
          questions.length < minQuestions &&
          additionalAttempts < remainingAttempts
        ) {
          additionalAttempts++;

          // Use any available content chunk
          const randomChunk =
            splitDocs[Math.floor(Math.random() * splitDocs.length)];
          const content = randomChunk.pageContent;

          if (!content || content.trim().length === 0) {
            continue;
          }

          const prompt = `
간단하지만 효과적인 객관식 문제를 만들어주세요. 주어진 내용의 핵심을 파악하여 기본적인 이해를 확인하는 문제를 작성해주세요.

[목표]
- 문서의 중요한 개념이나 원리를 묻는 문제
- 학습자가 기본적인 이해를 했는지 확인하는 수준
- 명확하고 혼동의 여지가 없는 문제 구성

[내용]
${content}

[출력 형식]
JSON 형식으로 정확히 출력하세요:
{
  "question": "명확하고 간단한 문제",
  "options": ["보기1", "보기2", "보기3", "보기4"],
  "correctAnswer": "정답 보기"
}

[주의사항]
- 문제는 문서의 핵심 내용을 다뤄야 합니다
- 모든 선택지는 합리적이어야 합니다
- 정답은 반드시 보기 중 하나와 일치해야 합니다
- 한글로 작성해주세요
`;

          try {
            const response = await model.invoke(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) continue;

            const questionData = JSON.parse(jsonMatch[0]);

            if (
              questionData.question &&
              Array.isArray(questionData.options) &&
              questionData.options.length === 4 &&
              questionData.correctAnswer &&
              questionData.options.includes(questionData.correctAnswer)
            ) {
              const questionText = questionData.question.trim().toLowerCase();
              if (!usedQuestions.has(questionText)) {
                usedQuestions.add(questionText);
                questions.push(questionData);
                console.log(
                  `Additional question ${questions.length} generated`,
                );
              }
            }
          } catch (error) {
            console.error("Error generating additional question:", error);
            continue;
          }
        }
      }

      if (questions.length === 0) {
        throw new Error(
          "문제 생성에 실패했습니다. PDF 내용을 다시 확인하거나 다른 파일을 시도해주세요.",
        );
      }

      console.log(
        `Successfully generated ${questions.length} unique questions`,
      );

      return NextResponse.json({ questions });
    } catch (error) {
      console.error("Error in PDF processing:", error);

      // Provide specific error messages for common issues
      let errorMessage = error.message;
      if (
        error.message.includes("image-based PDF") ||
        error.message.includes("OCR")
      ) {
        errorMessage =
          "피그마나 이미지 기반 PDF는 텍스트 추출이 어렵습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.";
      } else if (error.message.includes("No content could be extracted")) {
        errorMessage =
          "PDF에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF 파일인지 확인해주세요.";
      } else if (error.message.includes("PDF 처리에 실패했습니다")) {
        errorMessage =
          "PDF 처리 중 오류가 발생했습니다. 다른 PDF 파일을 시도해주세요.";
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in request handling:", error);
    return NextResponse.json(
      { error: `요청 처리 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 },
    );
  }
}
