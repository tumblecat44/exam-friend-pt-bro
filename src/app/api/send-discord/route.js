// Next.js에서 서버 API 응답을 처리할 때 사용하는 유틸리티입니다.
import { NextResponse } from "next/server";

// 이 함수는 클라이언트가 POST 방식으로 요청을 보냈을 때 실행됩니다.
// 예: 퀴즈 결과를 제출하고 Discord로 알림을 보내기 위한 용도입니다.
export async function POST(request) {
  try {
    // 클라이언트가 보낸 JSON 데이터를 추출합니다.
    // 예시 데이터 형태:
    // {
    //   name: "홍길동",
    //   score: 85,
    //   totalQuestions: 10,
    //   correctAnswers: 8,
    //   incorrectAnswers: 2,
    //   fileName: "퀴즈_1.pdf"
    // }
    const {
      name,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      fileName,
    } = await request.json();

    // 필수 값이 누락되었는지 검증합니다.
    // name, score, totalQuestions는 꼭 필요하므로 없으면 에러 응답
    if (!name || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: "Missing required fields" }, // 사용자에게 알려줄 메시지
        { status: 400 }, // HTTP 400: 잘못된 요청 (Bad Request)
      );
    }

    // 환경변수에서 Discord Webhook URL을 가져옵니다.
    // .env.local 파일에 DISCORD_WEBHOOK_URL이 정의되어 있어야 함
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // 만약 환경변수가 설정되지 않았다면 서버 내부 오류로 간주하고 로그 출력
    if (!webhookUrl) {
      console.error("Discord webhook URL is not configured"); // 서버 콘솔에 오류 기록
      return NextResponse.json(
        { error: "Discord webhook is not configured" },
        { status: 500 }, // HTTP 500: 서버 내부 오류
      );
    }

    // Discord에 보낼 메시지 형식인 embed 객체를 구성합니다.
    // Discord에서는 메시지를 보기 좋게 embed 형태로 꾸밀 수 있습니다.
    const embed = {
      title: "🎯 퀴즈 결과 알림", // 메시지 제목
      color: getScoreColor(score), // 점수에 따라 색상 변경 (아래 함수 참고)
      fields: [
        {
          name: "👤 참가자", // 필드 제목
          value: name,        // 참가자 이름
          inline: true,       // 다른 필드와 나란히 보여줌
        },
        {
          name: "📊 점수",
          value: `${Math.round(score)}점`, // 정수로 반올림하여 점수 표시
          inline: true,
        },
        {
          name: "📝 평가",
          value: getScoreMessage(score), // 점수에 따른 메시지 (예: "잘했어요!")
          inline: true,
        },
        {
          name: "📋 문제 정보",
          value: `총 ${totalQuestions}문제 • 정답 ${correctAnswers}개 • 오답 ${incorrectAnswers}개`,
          inline: false, // 한 줄 전체를 차지하게 설정
        },
        {
          name: "📄 파일명",
          value: fileName || "알 수 없음", // 파일명이 없을 경우 "알 수 없음"으로 표시
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(), // 현재 시간을 ISO 형식으로 표시
      footer: {
        text: "시험 친구 피티형", // 메시지 하단에 표시될 문구
      },
    };

    // 실제로 Discord 서버로 embed 메시지를 전송합니다.
    const response = await fetch(webhookUrl, {
      method: "POST", // POST 방식으로 데이터 전송
      headers: {
        "Content-Type": "application/json", // JSON 형식임을 명시
      },
      body: JSON.stringify({
        embeds: [embed], // embed는 배열 형태로 전달해야 합니다.
      }),
    });

    // Discord에서 정상적으로 응답하지 않았을 경우 (ex: 404, 500 오류 등)
    if (!response.ok) {
      console.error(
        "Failed to send to Discord:", // 서버 콘솔에 상세 오류 출력
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        { error: "Failed to send to Discord" },
        { status: 500 }, // 서버 내부 오류 반환
      );
    }

    // 모든 과정이 성공적으로 끝났을 경우 클라이언트에게 성공 응답
    return NextResponse.json({ success: true });

  } catch (error) {
    // 예외 발생 (예: JSON 파싱 실패, 네트워크 에러 등)
    console.error("Error sending to Discord:", error); // 서버 로그에 에러 출력
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }, // HTTP 500: 내부 오류 응답
    );
  }
}

/////////////////////////////////////////
// 점수에 따라 메시지 색상을 다르게 설정해주는 함수
function getScoreColor(score) {
  if (score >= 90) return 0x10b981; // 초록색 (매우 우수)
  if (score >= 70) return 0x3b82f6; // 파란색 (우수)
  if (score >= 50) return 0xf59e0b; // 노란색 (보통)
  return 0xef4444;                  // 빨간색 (부족)
}

/////////////////////////////////////////
// 점수에 따라 격려 또는 피드백 메시지를 제공하는 함수
function getScoreMessage(score) {
  if (score >= 90) return "완벽합니다! 🎉";       // 90점 이상
  if (score >= 70) return "잘했어요! 👍";         // 70점 이상
  if (score >= 50) return "노력이 필요해요 💪";   // 50점 이상
  return "더 공부해보세요 📚";                   // 50점 미만
}
