import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      name,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      fileName,
    } = await request.json();

    // Validate required fields
    if (!name || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get Discord webhook URL from environment variable
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Discord webhook URL is not configured");
      return NextResponse.json(
        { error: "Discord webhook is not configured" },
        { status: 500 },
      );
    }

    // Create Discord embed
    const embed = {
      title: "🎯 퀴즈 결과 알림",
      color: getScoreColor(score),
      fields: [
        {
          name: "👤 참가자",
          value: name,
          inline: true,
        },
        {
          name: "📊 점수",
          value: `${Math.round(score)}점`,
          inline: true,
        },
        {
          name: "📝 평가",
          value: getScoreMessage(score),
          inline: true,
        },
        {
          name: "📋 문제 정보",
          value: `총 ${totalQuestions}문제 • 정답 ${correctAnswers}개 • 오답 ${incorrectAnswers}개`,
          inline: false,
        },
        {
          name: "📄 파일명",
          value: fileName || "알 수 없음",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "시험 친구 피티형",
      },
    };

    // Send to Discord
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to send to Discord:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        { error: "Failed to send to Discord" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending to Discord:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function getScoreColor(score) {
  if (score >= 90) return 0x10b981; // Green
  if (score >= 70) return 0x3b82f6; // Blue
  if (score >= 50) return 0xf59e0b; // Yellow
  return 0xef4444; // Red
}

function getScoreMessage(score) {
  if (score >= 90) return "완벽합니다! 🎉";
  if (score >= 70) return "잘했어요! 👍";
  if (score >= 50) return "노력이 필요해요 💪";
  return "더 공부해보세요 📚";
}
