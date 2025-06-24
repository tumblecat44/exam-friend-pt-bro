import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
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
      console.log("PDF file loaded, size:", blob.size);

      // Load PDF with specific options
      const loader = new PDFLoader(blob, {
        splitPages: true,
      });

      const docs = await loader.load();
      console.log("PDF processed, number of pages:", docs.length);

      if (docs.length === 0) {
        throw new Error("No content could be extracted from the PDF");
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
          throw new Error("No text chunks could be created from the PDF");
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
          당신은 전문적인 시험 문제 출제자입니다. 주어진 내용을 바탕으로 객관식 문제를 만들어주세요.
          
          내용: ${content}
          
          다음 형식의 JSON 객체로 응답해주세요. 반드시 완전한 JSON 형식을 지켜주세요:
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
          
          주의사항:
          1. 반드시 완전한 JSON 형식을 지켜주세요
          2. 모든 텍스트는 한글로 작성해주세요
          3. 정답은 반드시 보기 중 하나와 정확히 일치해야 합니다
          4. JSON 형식 외의 추가 텍스트는 포함하지 마세요
          5. 문제와 보기는 명확하고 이해하기 쉽게 작성해주세요
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
          "No questions were generated successfully after multiple attempts",
        );
      }

      return NextResponse.json({ questions });
    } catch (error) {
      console.error("Error in PDF processing:", error);
      return NextResponse.json(
        { error: `Error processing PDF: ${error.message}` },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in request handling:", error);
    return NextResponse.json(
      { error: `Error handling request: ${error.message}` },
      { status: 500 },
    );
  }
}
