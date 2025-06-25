// Next.js에서 API 응답을 반환할 때 사용하는 헬퍼 객체를 불러옵니다.
import { NextResponse } from "next/server";

// POST 요청이 들어왔을 때 실행되는 비동기 함수입니다.
// 보통 사용자가 폼을 제출할 때 서버에 데이터를 전송하는 데 사용됩니다.
export async function POST(request) {
  try {
    // 요청(request) 본문에서 JSON 데이터를 파싱합니다.
    // 예를 들어, { name: "홍길동", comment: "정말 유용했어요!" } 형태일 수 있습니다.
    const { name, comment } = await request.json();

    // 필수 필드 검증: 이름(name)이나 의견(comment)이 비어 있으면 오류 응답 반환
    if (!name || comment === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" }, // 클라이언트에 전달할 에러 메시지
        { status: 400 }, // HTTP 상태 코드: 400 = Bad Request
      );
    }

    // Discord Webhook URL을 환경변수에서 가져옵니다.
    // .env.local 파일에 DISCORD_REVIEW_WEBHOOK_URL=... 로 설정되어 있어야 합니다.
    const webhookUrl = process.env.DISCORD_REVIEW_WEBHOOK_URL;

    // webhook URL이 설정되지 않은 경우 (배포 설정 오류 가능성)
    if (!webhookUrl) {
      console.error("Discord webhook URL is not configured"); // 서버 로그에 에러 출력
      return NextResponse.json(
        { error: "Discord webhook is not configured" },
        { status: 500 }, // 서버 내부 오류
      );
    }

    // Discord 메시지 형식: embed 형태로 구성
    // embed는 Discord에서 깔끔한 카드 형태로 메시지를 보여줄 수 있게 해줍니다.
    const embed = {
      title: "🎯 즐거운 고객의 소리", // 메시지 제목
      color: 0x10b981, // 메시지 색상 (녹색 계열, tailwind emerald-500 색상 코드)
      fields: [
        {
          name: "👤 참가자", // 필드 제목
          value: name, // 참가자 이름
          inline: true, // 다른 필드와 나란히 정렬됨
        },
        {
          name: "📝 의견", // 필드 제목
          value: comment, // 사용자 의견
          inline: true, // 나란히 정렬
        },
      ],
      timestamp: new Date().toISOString(), // 메시지에 표시할 시간 (현재 시간)
      footer: {
        text: "시험 친구 피티형", // 하단에 표시할 푸터 텍스트 (작성자 정보 등)
      },
    };

    // Discord 웹훅 API로 POST 요청을 보냅니다.
    // 이 요청을 통해 실제로 Discord 채널에 메시지가 전송됩니다.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON 형식으로 보낼 것임을 명시
      },
      body: JSON.stringify({
        embeds: [embed], // embed 배열로 전송 (Discord는 배열 형태 요구)
      }),
    });

    // 요청 실패 시 (예: 404, 500 등)
    if (!response.ok) {
      console.error(
        "Failed to send to Discord:", // 서버 로그에 실패 정보 출력
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        { error: "Failed to send to Discord" }, // 클라이언트에 에러 메시지 전달
        { status: 500 }, // 서버 오류
      );
    }

    // 정상적으로 Discord 전송 완료 → 클라이언트에 성공 메시지 반환
    return NextResponse.json({ success: true });

  } catch (error) {
    // try 블록 내에서 예기치 않은 오류 발생 시 (ex: request.json() 실패 등)
    console.error("Error sending to Discord:", error); // 서버 로그에 상세 오류 출력
    return NextResponse.json(
      { error: "Internal server error" }, // 클라이언트에 에러 메시지 전달
      { status: 500 }, // HTTP 500 = 서버 내부 오류
    );
  }
}
