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

      // Generate questions
      const questions = [];
      let attempts = 0;
      const maxAttempts = 20;

      while (questions.length < 10 && attempts < maxAttempts) {
        attempts++;
        console.log(
          `Attempt ${attempts}: Generating question ${questions.length + 1}/10`,
        );

        // Get a random chunk of text for question generation
        const randomIndex = Math.floor(Math.random() * splitDocs.length);
        const content = splitDocs[randomIndex].pageContent;

        if (!content || content.trim().length === 0) {
          console.warn(
            `Empty content found at index ${randomIndex}, skipping...`,
          );
          continue;
        }

        const prompt = `
당신은 전문적인 시험 문제 출제자이며, 학습자가 문서의 핵심 개념을 정확히 이해했는지 평가하는 객관식 문제를 출제합니다.

[지시사항]
- 아래에 주어진 "내용"을 꼼꼼히 분석한 후, 학습자가 반드시 이해해야 할 핵심 개념, 용어 정의, 주요 원리, 인과관계 등을 기반으로 문제를 작성하세요.
- 단순한 암기나 사소한 정보(URL, 저자명 등)를 묻는 문제가 아니라, 실제 시험에서 유의미하게 출제될 수 있는 퀄리티 높은 문항을 작성해야 합니다.
- 문제와 선택지는 모두 문서의 흐름과 맥락을 고려하여 자연스럽고 명확하게 구성해주세요.

[내용]
${content}

[출력 형식]
아래 형식의 JSON 객체로 정확히 출력하세요. JSON 외의 추가 텍스트는 절대 포함하지 마세요:
{
  "question": "문제 내용",
  "options": [
    "보기 1",
    "보기 2",
    "보기 3",
    "보기 4"
  ],
  "correctAnswer": "정답 보기"
}

[추가 조건]
1. JSON은 반드시 올바른 형식을 갖춰야 하며, 쉼표 누락, 따옴표 오류 등이 없어야 합니다.
2. 문제와 선택지는 모두 자연스럽고, 혼동의 여지가 없도록 작성해야 합니다.
3. 정답은 반드시 보기 중 하나와 글자 단위로 완전히 일치해야 합니다.
4. 모든 텍스트는 반드시 한글로 작성해주세요.
5. 보기 항목은 모두 그럴듯해 보이도록 구성하고, 너무 눈에 띄는 오답은 피해주세요.
`;

        try {
          const response = await model.invoke(prompt);
          console.log("Raw response:", response);

          // Extract JSON from the response
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

          questions.push(questionData);
          console.log(`Question ${questions.length} generated successfully`);
        } catch (error) {
          console.error("Error processing question:", error);
          continue;
        }
      }

      if (questions.length === 0) {
        throw new Error(
          "문제 생성에 실패했습니다. PDF 내용을 다시 확인하거나 다른 파일을 시도해주세요.",
        );
      }

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
