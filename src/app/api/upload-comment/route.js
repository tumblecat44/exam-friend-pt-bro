import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, comment } = await request.json();

    // Validate required fields
    if (!name || comment === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get Discord webhook URL from environment variable
    const webhookUrl = process.env.DISCORD_REVIEW_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Discord webhook URL is not configured");
      return NextResponse.json(
        { error: "Discord webhook is not configured" },
        { status: 500 },
      );
    }

    // Create Discord embed
    const embed = {
      title: "🎯 즐거운 고객의 소리",
      color: 0x10b981,
      fields: [
        {
          name: "👤 참가자",
          value: name,
          inline: true,
        },
        {
          name: "📝 의견",
          value: comment,
          inline: true,
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
