// Next.js 서버 환경에서 응답 객체를 생성하기 위해 NextResponse를 가져옵니다. API 라우트에서 응답을 보낼 때 사용됩니다.
import { NextResponse } from "next/server";
// LangChain 커뮤니티에서 제공하는 PDF 파일 로더를 가져옵니다. 파일 시스템의 PDF를 읽어 텍스트로 변환하는 데 사용됩니다.
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// LangChain에서 OpenAI 모델을 사용하기 위한 클래스를 가져옵니다.
import { OpenAI } from "@langchain/openai";
// LangChain에서 텍스트를 재귀적으로 분할하는 클래스를 가져옵니다. 긴 텍스트를 의미 있는 작은 조각(청크)으로 나눕니다.
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// LangChain에서 인메모리(in-memory) 벡터 저장소를 사용하기 위한 클래스를 가져옵니다. 텍스트 청크를 벡터로 변환하여 메모리에 저장하고 검색하는 데 사용됩니다.
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// LangChain에서 OpenAI의 임베딩 모델을 사용하기 위한 클래스를 가져옵니다. 텍스트를 숫자 벡터로 변환(임베딩)하는 역할을 합니다.
import { OpenAIEmbeddings } from "@langchain/openai";

// 업로드할 수 있는 파일의 최대 크기를 10MB로 제한합니다.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB를 바이트(byte) 단위로 표현한 값입니다.

// POST 요청을 처리하는 비동기 함수를 정의합니다. Next.js API 라우트의 표준 방식입니다.
export async function POST(request) {
  // 전체 요청 처리 과정에서 발생할 수 있는 예기치 않은 오류를 잡기 위한 try-catch 블록입니다.
  try {
    // 요청(request)에서 FormData를 비동기적으로 가져옵니다. 파일 업로드와 같은 multipart/form-data를 처리합니다.
    const formData = await request.formData();
    // FormData에서 'file'이라는 이름의 필드 값을 가져옵니다. 이것이 업로드된 파일입니다.
    const file = formData.get("file");
    // FormData에서 'length' 필드 값을 가져옵니다. 만약 값이 없으면 기본값으로 'medium'을 사용합니다.
    const length = formData.get("length") || "medium";

    // 파일이 업로드되지 않았는지 확인합니다.
    if (!file) {
      // 파일이 없으면 400 (Bad Request) 상태 코드와 함께 오류 메시지를 JSON 형식으로 반환합니다.
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 파일 크기를 확인합니다.
    if (file.size > MAX_FILE_SIZE) {
      // 파일 크기가 최대 제한(10MB)을 초과하면 400 상태 코드와 함께 오류 메시지를 반환합니다.
      return NextResponse.json(
        {
          error: `File size exceeds the 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 400 },
      );
    }

    // 파일 유형을 확인합니다.
    if (file.type !== "application/pdf") {
      // 파일 유형이 PDF가 아니면 400 상태 코드와 함께 오류 메시지를 반환합니다.
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // 환경 변수에서 OpenAI API 키가 설정되어 있는지 확인합니다.
    if (!process.env.OPENAI_API_KEY) {
      // API 키가 없으면 서버 콘솔에 오류를 기록합니다.
      console.error("OpenAI API key is not set");
      // 500 (Internal Server Error) 상태 코드와 함께 클라이언트에게 설정 오류 메시지를 반환합니다.
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      );
    }

    // PDF 처리 및 OpenAI API 호출 과정에서 발생할 수 있는 오류를 잡기 위한 내부 try-catch 블록입니다.
    try {
      // 파일을 Blob 객체로 변환합니다. PDFLoader가 처리할 수 있는 형식입니다.
      const blob = new Blob([await file.arrayBuffer()], {
        type: "application/pdf",
      });
      // 변환된 Blob의 크기를 콘솔에 기록하여 확인합니다.
      console.log("PDF file loaded, size:", blob.size, "bytes");

      // PDF에서 추출된 문서(페이지)를 저장할 배열을 초기화합니다.
      let docs = [];
      // 어떤 PDF 로딩 방법이 성공했는지 기록하기 위한 변수입니다.
      let loadingMethod = "default";

      // 첫 번째 방법: 표준 PDFLoader를 사용하여 PDF 로딩을 시도합니다.
      try {
        console.log("Attempting standard PDF loading...");
        // PDFLoader 인스턴스를 생성합니다. blob을 입력으로 받고, 페이지별로 문서를 분할하도록 설정합니다.
        const loader = new PDFLoader(blob, {
          splitPages: true,
        });
        // PDF를 로드하고 텍스트를 추출합니다.
        docs = await loader.load();
        loadingMethod = "standard"; // 성공한 방법을 기록합니다.
        console.log("Standard PDF loading successful, pages:", docs.length);
      } catch (error) {
        // 첫 번째 방법이 실패하면 콘솔에 오류 메시지를 출력합니다.
        console.log("Standard PDF loading failed:", error.message);

        // 두 번째 방법: 최소한의 옵션으로 PDF 로딩을 다시 시도하여 호환성을 높입니다.
        try {
          console.log("Attempting PDF loading with minimal options...");
          // 이번에는 페이지를 분할하지 않고 전체 문서를 하나로 로드합니다.
          const loader = new PDFLoader(blob, {
            splitPages: false,
          });
          docs = await loader.load();
          loadingMethod = "minimal"; // 성공한 방법을 기록합니다.
          console.log("Minimal PDF loading successful, pages:", docs.length);
        } catch (error2) {
          // 두 번째 방법도 실패하면 콘솔에 오류 메시지를 출력합니다.
          console.log("Minimal PDF loading failed:", error2.message);

          // 세 번째 방법: 다른 전략으로 PDF 로딩을 다시 시도합니다.
          try {
            console.log("Attempting PDF loading with different strategy...");
            // 다시 페이지 분할 옵션을 켜서 시도합니다. (내부 로직이 다를 수 있어 시도해볼 가치가 있습니다.)
            const loader = new PDFLoader(blob, {
              splitPages: true,
            });
            docs = await loader.load();
            loadingMethod = "alternative"; // 성공한 방법을 기록합니다.
            console.log(
              "Alternative PDF loading successful, pages:",
              docs.length,
            );
          } catch (error3) {
            // 모든 PDF 로딩 방법이 실패하면 최종적으로 오류를 발생시킵니다.
            console.log("All PDF loading methods failed");
            throw new Error(
              `PDF 처리에 실패했습니다. 피그마나 이미지 기반 PDF의 경우 텍스트 추출이 어려울 수 있습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.`,
            );
          }
        }
      }

      // 모든 로딩 시도 후에도 추출된 문서가 하나도 없는지 확인합니다.
      if (docs.length === 0) {
        // 텍스트를 추출할 수 없으면 오류를 발생시킵니다.
        throw new Error(
          "PDF에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF 파일인지 확인해주세요.",
        );
      }

      // 디버깅을 위해 각 페이지의 내용 길이를 콘솔에 기록합니다.
      docs.forEach((doc, index) => {
        console.log(
          `Page ${index + 1} content length:`,
          doc.pageContent.length,
        );
        // 각 페이지 내용의 앞부분 100글자를 미리보기로 출력합니다.
        console.log(
          `Page ${index + 1} preview:`,
          doc.pageContent.substring(0, 100),
        );
      });

      // 추출된 전체 텍스트의 길이를 계산합니다.
      const totalContentLength = docs.reduce(
        (sum, doc) => sum + doc.pageContent.length,
        0,
      );
      // 전체 텍스트 길이가 100자 미만이면 이미지 기반 PDF로 간주하고 오류를 발생시킵니다.
      if (totalContentLength < 100) {
        throw new Error(
          "추출된 텍스트가 너무 짧습니다. 피그마나 이미지 기반 PDF의 경우 텍스트 추출이 어려울 수 있습니다. 텍스트가 포함된 PDF 파일을 사용해주세요.",
        );
      }

      // 텍스트를 작은 조각(청크)으로 나누기 위해 TextSplitter를 설정합니다.
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500, // 각 청크의 최대 크기를 500자로 줄입니다.
        chunkOverlap: 50, // 청크 간에 겹치는 글자 수를 50자로 줄입니다. (문맥 유지를 위함)
        lengthFunction: (text) => text.length, // 글자 수 계산 함수를 지정합니다.
        // 텍스트를 나눌 기준이 되는 구분자 목록입니다. 우선순위 순서대로 적용됩니다.
        separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
      });

      // 설정된 textSplitter를 사용하여 문서를 청크로 분할합니다.
      let splitDocs = await textSplitter.splitDocuments(docs);
      console.log("Text split into chunks:", splitDocs.length);

      // 만약 첫 번째 분할 시도로 청크가 하나도 생성되지 않았다면,
      if (splitDocs.length === 0) {
        console.log(
          "First splitting attempt failed, trying alternative method...",
        );
        // 다른 설정으로 대체 분할을 시도합니다. 청크 크기와 겹침을 더 작게 설정합니다.
        const alternativeSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 200,
          chunkOverlap: 20,
          lengthFunction: (text) => text.length,
          separators: ["\n", ".", " ", ""],
        });

        // 대체 분할기로 문서를 다시 분할합니다.
        const alternativeDocs = await alternativeSplitter.splitDocuments(docs);
        console.log("Alternative splitting result:", alternativeDocs.length);

        // 대체 방법으로도 분할된 청크가 없다면 오류를 발생시킵니다.
        if (alternativeDocs.length === 0) {
          throw new Error(
            "텍스트를 청크로 분할할 수 없습니다. PDF 내용을 다시 확인해주세요.",
          );
        }

        // 대체 방법으로 생성된 청크를 최종 결과로 사용합니다.
        splitDocs = alternativeDocs;
      }

      // 인메모리 벡터 저장소를 생성합니다.
      const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs, // 분할된 텍스트 청크들을
        new OpenAIEmbeddings({ // OpenAI 임베딩 모델을 사용하여
          openAIApiKey: process.env.OPENAI_API_KEY, // API 키를 제공하고
        }), // 벡터로 변환하여 메모리에 저장합니다.
      );
      console.log("Vector store created");

      // OpenAI 모델을 초기화합니다.
      const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY, // API 키를 설정합니다.
        temperature: 0.3, // 모델의 창의성을 낮춰(0에 가깝게) 일관성 있는 답변을 생성하도록 합니다.
        maxTokens: 500, // 생성될 응답의 최대 길이를 500 토큰으로 제한합니다.
      });

      // 생성된 질문들을 저장할 배열입니다.
      const questions = [];
      // 중복된 내용(청크)을 사용하지 않기 위해 사용된 청크의 인덱스를 추적하는 Set입니다.
      const usedContents = new Set();
      // 중복된 질문 생성을 방지하기 위해 생성된 질문 텍스트를 추적하는 Set입니다.
      const usedQuestions = new Set();
      // 질문 생성을 시도한 횟수입니다.
      let attempts = 0;
      // 최대 시도 횟수를 50번으로 늘려서 충분한 질문을 생성하도록 합니다.
      const maxAttempts = 50;

      // 사용자가 선택한 'length' 옵션에 따라 생성할 목표 질문 수를 계산합니다.
      let targetQuestions;
      switch (length) {
        case "short": // '짧게' 선택 시
          // 최소 5개, 최대 7개 또는 (청크 수 / 2)개의 질문을 목표로 합니다.
          targetQuestions = Math.min(
            7,
            Math.max(5, Math.floor(splitDocs.length / 2)),
          );
          break;
        case "long": // '길게' 선택 시
          // 최소 10개, 최대 15개 또는 (청크 수 / 1.2)개의 질문을 목표로 합니다.
          targetQuestions = Math.min(
            15,
            Math.max(10, Math.floor(splitDocs.length / 1.2)),
          );
          break;
        case "medium": // '중간' 또는 기본값
        default:
          // 최소 8개, 최대 10개 또는 (청크 수 / 1.5)개의 질문을 목표로 합니다.
          targetQuestions = Math.min(
            10,
            Math.max(8, Math.floor(splitDocs.length / 1.5)),
          );
          break;
      }

      // 계산된 목표 질문 수를 콘솔에 출력합니다.
      console.log(
        `Target questions: ${targetQuestions} (based on ${splitDocs.length} content chunks, length: ${length})`,
      );

      // 생성된 질문 수가 목표에 도달하거나 최대 시도 횟수를 초과할 때까지 반복합니다.
      while (questions.length < targetQuestions && attempts < maxAttempts) {
        attempts++; // 시도 횟수를 1 증가시킵니다.
        console.log(
          `Attempt ${attempts}: Generating question ${questions.length + 1}/${targetQuestions}`,
        );

        // 아직 사용되지 않은 텍스트 청크 목록을 필터링합니다.
        const availableChunks = splitDocs.filter(
          (_, index) => !usedContents.has(index),
        );

        // 사용 가능한 고유 청크가 더 이상 없는 경우
        if (availableChunks.length === 0) {
          console.log(
            "No more unique content chunks available, trying to reuse with different approach",
          );
          // 모든 고유 청크를 다 썼다면, 이미 사용된 청크 중에서 무작위로 하나를 선택하여 다시 질문을 생성합니다.
          const randomChunk =
            splitDocs[Math.floor(Math.random() * splitDocs.length)];
          const content = randomChunk.pageContent;

          // 선택된 청크의 내용이 비어있는지 확인합니다.
          if (!content || content.trim().length === 0) {
            console.warn(`Empty content found, skipping...`);
            continue; // 내용이 없으면 다음 시도로 넘어갑니다.
          }

          // 재사용된 콘텐츠에 대해서는 다른 프롬프트를 사용하여 새로운 관점의 질문을 유도합니다.
          const prompt = `
          당신은 전문적인 교육 평가 전문가입니다. 주어진 학습 자료를 바탕으로 학습자의 이해도를 정확히 측정할 수 있는 고품질 객관식 문제를 출제합니다.
          
          [역할과 목표]
          - 학습자가 핵심 개념을 정확히 이해했는지 평가하는 문제를 작성합니다.
          - 단순 암기보다 이해력과 적용 능력을 측정할 수 있어야 합니다.
          - 문제는 실제 교육 현장에서 사용 가능한 수준의 정확도와 품질을 갖추어야 합니다.
          
          [문제 작성 원칙]
          1. 핵심 개념 중심: 문서에서 가장 중요한 개념, 원리, 구조, 흐름 등을 기반으로 질문하세요.
          2. 이해력 측정: 단순 사실 확인이 아니라 개념의 의미, 차이점, 원인-결과 관계 등을 묻는 문제를 구성하세요.
          3. 명확성: 문제 문장과 선택지는 혼동이 없고 자연스러운 문장으로 구성되어야 합니다.
          4. 균형감: 선택지 4개 모두 그럴듯하게 보여야 하며, 정답은 논리적으로 명확해야 합니다.
          5. 다양성: 이전에 작성된 문제와 완전히 다른 개념, 관점, 표현으로 문제를 작성하세요.
          6. 난이도: 문제의 난이도는 중간 수준으로 설정해주세요 (지나치게 단순하거나 복잡하지 않게).
          
          [문제 유형 관련 지침]
          - "보기 중 ( )에 들어갈 알맞은 말은?" 형태의 문제는 보기 문장을 반드시 제공해야 하며, ( 보기 번호 )로 빈칸 위치를 명확히 표시해야 합니다.
            예: "시스템의 상태를 나타내는 ( 보기 2 )는 프로세스 동기화에 사용된다."
          - **이미지, 그래프, 그림 등이 있어야만 풀 수 있는 문제는 절대 출제하지 마세요.**
          
          [내용]
          ${content}
          
          [출력 형식]
          다음 JSON 형식으로 정확히 출력하세요. JSON 외의 텍스트는 절대 포함하지 마세요:
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
          1. 문제는 반드시 문서의 핵심 내용을 다뤄야 합니다.
          2. 선택지는 모두 논리적으로 그럴듯해야 합니다.
          3. 정답은 보기 중 하나와 정확히 일치해야 하며, 오탈자가 없어야 합니다.
          4. 모든 텍스트는 한글로 자연스럽게 작성하세요.
          5. JSON 형식은 정확하게 유지해야 하며, 쉼표나 따옴표 오류가 없어야 합니다.
          6. 문서의 내용을 벗어나거나, 학습자가 문제만으로 풀 수 없는 형태는 금지합니다.
          
          [주의사항]
          - JSON 외의 추가 설명, 해설, 문장은 출력하지 마세요.
          - “보기에 들어갈 말은?” 형태는 반드시 해당 문맥 문장을 함께 제공해야 합니다.
          - “이미지가 있어야 풀 수 있는 문제”는 출제하지 마세요.
          - 질문과 보기가 모두 문법적으로 매끄럽고 혼동되지 않아야 합니다.
          `;
          

          try {
            // OpenAI 모델에 프롬프트를 보내 응답을 요청합니다.
            const response = await model.invoke(prompt);
            console.log("Raw response for reused content:", response);

            // 모델의 응답에서 JSON 객체 부분만 추출합니다. (모델이 가끔 불필요한 텍스트를 포함할 수 있기 때문)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error("No JSON object found in response");
              continue; // JSON이 없으면 다음 시도로 넘어갑니다.
            }

            const jsonStr = jsonMatch[0]; // 추출된 JSON 문자열
            const questionData = JSON.parse(jsonStr); // JSON 문자열을 객체로 변환합니다.

            // 생성된 질문 데이터의 형식이 올바른지 검증합니다.
            if (
              !questionData.question ||
              !Array.isArray(questionData.options) ||
              questionData.options.length !== 4 ||
              !questionData.correctAnswer
            ) {
              console.error("Invalid question format:", questionData);
              continue; // 형식이 올바르지 않으면 다음 시도로 넘어갑니다.
            }

            // 질문 텍스트를 소문자로 변환하고 공백을 제거하여 중복 여부를 확인합니다.
            const questionText = questionData.question.trim().toLowerCase();
            if (usedQuestions.has(questionText)) {
              console.log("Duplicate question detected, skipping...");
              continue; // 중복된 질문이면 다음 시도로 넘어갑니다.
            }

            // 정답이 보기 목록에 포함되어 있는지 확인합니다.
            if (!questionData.options.includes(questionData.correctAnswer)) {
              console.error("Correct answer not in options:", questionData);
              continue; // 정답이 보기에 없으면 다음 시도로 넘어갑니다.
            }

            // 질문, 보기, 정답 필드가 비어있지 않은지 확인합니다.
            if (
              !questionData.question.trim() ||
              questionData.options.some((opt) => !opt.trim())
            ) {
              console.error("Empty fields found in question data");
              continue; // 비어있는 필드가 있으면 다음 시도로 넘어갑니다.
            }

            // 모든 검증을 통과하면, 질문을 중복 목록에 추가하고
            usedQuestions.add(questionText);
            // 최종 질문 배열에 추가합니다.
            questions.push(questionData);
            console.log(
              `Question ${questions.length} generated successfully from reused content`,
            );
          } catch (error) {
            // JSON 파싱이나 기타 처리 중 오류가 발생하면 콘솔에 기록하고 다음 시도로 넘어갑니다.
            console.error(
              "Error processing question from reused content:",
              error,
            );
            continue;
          }
        } else {
          // 사용 가능한 고유 청크가 있는 경우,
          // 그 중 하나를 무작위로 선택합니다.
          const randomIndex = Math.floor(
            Math.random() * availableChunks.length,
          );
          const content = availableChunks[randomIndex].pageContent;
          // 원래 splitDocs 배열에서의 인덱스를 기록해 둡니다.
          const originalIndex = splitDocs.indexOf(availableChunks[randomIndex]);

          // 선택된 청크의 내용이 비어있는지 확인합니다.
          if (!content || content.trim().length === 0) {
            console.warn(`Empty content found, skipping...`);
            usedContents.add(originalIndex); // 사용한 것으로 처리하고
            continue; // 다음 시도로 넘어갑니다.
          }

          // 질문 생성을 위한 프롬프트를 정의합니다.
          const prompt = `
당신은 교육 콘텐츠 기반으로 고품질 객관식 문제를 설계하는 전문가입니다. 아래의 학습 자료를 바탕으로 핵심 개념을 확인할 수 있는 **간단하지만 효과적인 객관식 문제**를 한 개 작성해주세요.

[문제 작성 목적]
- 문서의 중요한 개념이나 원리를 묻는 문제를 생성합니다.
- 학습자가 기본적인 이해를 했는지 확인할 수 있도록 구성합니다.
- 문제와 선택지는 혼동의 여지가 없이 명확해야 합니다.

[문제 유형 규칙]
- 문제는 일반형 또는 빈칸형(보기에 들어갈 말은?)으로 작성할 수 있습니다.
- 빈칸형 문제의 경우 반드시 **문맥 문장을 포함**하여, 보기 번호 자리에 ( 보기 번호 ) 형식으로 표시해야 합니다.  
  예시:  
  "프로세스 간 공유 자원을 관리하기 위해 ( 보기 2 )가 사용된다."

[중요 제약 조건]
- **사진, 그래프, 이미지가 있어야만 풀 수 있는 문제는 절대로 출제하지 마세요.**
- 학습자가 **문제의 텍스트만 보고** 답을 유추할 수 있어야 합니다.
- 너무 쉬운 문제나, 너무 모호한 문제는 작성하지 마세요.

[내용]
${content}

[출력 형식]
정확히 아래 JSON 형식으로 출력하세요. JSON 이외의 텍스트는 절대 포함하지 마세요:
{
  "question": "명확하고 간단한 문제 (또는 문맥 포함 문장)",
  "options": [
    "보기 1 (논리적인 오답 또는 정답)",
    "보기 2",
    "보기 3",
    "보기 4"
  ],
  "correctAnswer": "정답 보기 (options 중 정확히 일치)"
}

[검토 기준]
1. 문제는 문서의 **핵심 개념**을 기반으로 작성해야 합니다.
2. 선택지는 모두 타당하고, 그럴듯하게 보여야 합니다.
3. 정답은 반드시 options 중 하나와 정확히 일치해야 합니다.
4. 모든 문장은 한글로 자연스럽고 명확하게 작성해야 합니다.
5. JSON 구조는 올바른 문법으로 작성해야 하며, 쉼표·따옴표 오류 없이 출력되어야 합니다.

[주의사항]
- **“보기에 들어갈 말은?” 문제일 경우, 문맥 없이 보기만 제공하는 문제는 금지**합니다.
- **이미지 없이 문제 텍스트만으로도 학습자가 풀 수 있어야 합니다.**
- 해설, 정답 설명, 추가 텍스트는 출력하지 마세요.
`;


          try {
            // OpenAI 모델에 프롬프트를 보내 응답을 요청합니다.
            const response = await model.invoke(prompt);
            console.log("Raw response:", response);

            // 모델 응답에서 JSON 객체 부분만 추출합니다.
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error("No JSON object found in response");
              usedContents.add(originalIndex); // 사용한 것으로 처리하고
              continue; // 다음 시도로 넘어갑니다.
            }

            const jsonStr = jsonMatch[0]; // 추출된 JSON 문자열
            const questionData = JSON.parse(jsonStr); // JSON 문자열을 객체로 변환합니다.

            // 생성된 질문 데이터의 형식이 올바른지 검증합니다.
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

            // 질문 텍스트의 중복 여부를 확인합니다.
            const questionText = questionData.question.trim().toLowerCase();
            if (usedQuestions.has(questionText)) {
              console.log("Duplicate question detected, skipping...");
              usedContents.add(originalIndex);
              continue;
            }

            // 정답이 보기 목록에 포함되어 있는지 확인합니다.
            if (!questionData.options.includes(questionData.correctAnswer)) {
              console.error("Correct answer not in options:", questionData);
              usedContents.add(originalIndex);
              continue;
            }

            // 질문, 보기, 정답 필드가 비어있지 않은지 확인합니다.
            if (
              !questionData.question.trim() ||
              questionData.options.some((opt) => !opt.trim())
            ) {
              console.error("Empty fields found in question data");
              usedContents.add(originalIndex);
              continue;
            }

            // 모든 검증을 통과하면, 이 청크를 사용한 것으로 표시하고,
            usedContents.add(originalIndex);
            // 질문을 중복 목록에 추가하고,
            usedQuestions.add(questionText);
            // 최종 질문 배열에 추가합니다.
            questions.push(questionData);
            console.log(`Question ${questions.length} generated successfully`);
          } catch (error) {
            // JSON 파싱이나 기타 처리 중 오류가 발생하면 콘솔에 기록하고 다음 시도로 넘어갑니다.
            console.error("Error processing question:", error);
            usedContents.add(originalIndex);
            continue;
          }
        }
      }

      // 루프가 끝난 후, 생성된 질문 수가 최소 요구량보다 적은지 확인합니다.
      const minQuestions = length === "short" ? 5 : length === "long" ? 10 : 8;
      if (questions.length < minQuestions) {
        console.log(
          `Only ${questions.length} questions generated, trying to generate more to reach minimum ${minQuestions}...`,
        );

        // 최소 질문 수를 채우기 위해 추가 생성을 시도합니다.
        const remainingAttempts = 30; // 추가 시도 횟수
        let additionalAttempts = 0;

        // 최소 질문 수에 도달하거나 추가 시도 횟수를 다 쓸 때까지 반복합니다.
        while (
          questions.length < minQuestions &&
          additionalAttempts < remainingAttempts
        ) {
          additionalAttempts++;

          // 사용 가능한 아무 청크나 무작위로 선택합니다.
          const randomChunk =
            splitDocs[Math.floor(Math.random() * splitDocs.length)];
          const content = randomChunk.pageContent;

          // 내용이 비어있으면 건너뜁니다.
          if (!content || content.trim().length === 0) {
            continue;
          }

          // 간단한 질문 생성을 위한 프롬프트입니다.
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
            // 모델을 호출하고 응답에서 JSON을 추출합니다.
            const response = await model.invoke(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) continue;

            const questionData = JSON.parse(jsonMatch[0]);

            // 생성된 데이터가 유효하고 중복되지 않은 경우에만 추가합니다.
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
            // 오류 발생 시 콘솔에 기록하고 계속 진행합니다.
            console.error("Error generating additional question:", error);
            continue;
          }
        }
      }

      // 모든 과정이 끝난 후, 생성된 질문이 하나도 없으면 오류를 발생시킵니다.
      if (questions.length === 0) {
        throw new Error(
          "문제 생성에 실패했습니다. PDF 내용을 다시 확인하거나 다른 파일을 시도해주세요.",
        );
      }

      // 최종적으로 생성된 고유 질문의 수를 콘솔에 기록합니다.
      console.log(
        `Successfully generated ${questions.length} unique questions`,
      );

      // 성공적으로 생성된 질문 배열을 JSON 형식으로 클라이언트에게 반환합니다.
      return NextResponse.json({ questions });
    } catch (error) {
      // PDF 처리 및 문제 생성 과정(내부 try 블록)에서 오류가 발생한 경우
      console.error("Error in PDF processing:", error);

      // 일반적인 오류에 대해 사용자에게 친화적인 메시지를 제공합니다.
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

      // 500 상태 코드와 함께 처리된 오류 메시지를 반환합니다.
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    // 요청 처리 자체(외부 try 블록)에서 오류가 발생한 경우
    console.error("Error in request handling:", error);
    // 500 상태 코드와 함께 일반적인 서버 오류 메시지를 반환합니다.
    return NextResponse.json(
      { error: `요청 처리 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 },
    );
  }
}