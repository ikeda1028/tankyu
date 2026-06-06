const DEFAULT_MODEL = "gpt-4.1-mini";

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 500);
}

function normalizeList(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item)).filter(Boolean).slice(0, limit)
    : [];
}

function normalizeEvent(event, index) {
  const eventType = event.eventType === "limited" ? "limited" : "permanent";
  const lat = Number(event.lat);
  const lng = Number(event.lng);

  return {
    title: normalizeText(event.title, `探究イベント ${index + 1}`).slice(0, 48),
    impact: normalizeText(event.impact, "地域課題・探究学習").slice(0, 64),
    description: normalizeText(event.description, "中高生が事象に出会い、問いを広げるイベントです。"),
    tags: normalizeList(event.tags, 4),
    keywords: normalizeList(event.keywords, 6),
    explorationIndex: clamp(event.explorationIndex, 50, 95),
    locationName: normalizeText(event.locationName, "地域フィールド").slice(0, 80),
    eventType,
    startDate: eventType === "limited" ? normalizeText(event.startDate).slice(0, 10) : "",
    endDate: eventType === "limited" ? normalizeText(event.endDate).slice(0, 10) : "",
    lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : null,
    lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : null,
    questionPath: normalizeList(event.questionPath, 5).slice(0, 5),
    reason: normalizeText(event.reason, "現在のワクワクから一歩先へ広げやすい候補です。").slice(0, 160),
  };
}

function extractOutputText(responseJson) {
  if (responseJson.output_text) return responseJson.output_text;
  const textItems = responseJson.output
    ?.flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text" || item.text)
    .map((item) => item.text)
    .filter(Boolean);
  return textItems?.join("\n") || "";
}

function parseJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSONを読み取れませんでした");
    return JSON.parse(match[0]);
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const body = request.body || {};
    const payload = {
      grade: normalizeText(body.grade, "中高生"),
      region: normalizeText(body.region, "日本"),
      motivation: clamp(body.motivation, 1, 100),
      sparks: normalizeText(body.sparks),
      interests: normalizeList(body.interests, 10),
      existingEvents: normalizeList(body.existingEvents, 10),
      completedEvents: normalizeList(body.completedEvents, 8),
    };

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions:
          "あなたは中高生向け探究イベントの推薦プランナーです。実在イベント検索ではなく、学校・地域で企画できる候補イベントを作ります。安全で年齢に適した内容にし、特定個人情報や過度に危険な行為は含めません。返答はJSONだけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次の生徒プロフィールから、候補イベントを3件作ってください。

条件:
- 中高生が参加できる
- 出会いはイベント
- 探究値は「事象に出会って、どの程度遠くまで探究できるか」で伸びる
- 常設か期間限定かを必ず入れる
- 緯度経度は地域が推測できる場合だけ日本国内の概算を入れる。難しい場合はnull
- 既存イベントと重複しない

JSON形式:
{
  "events": [
    {
      "title": "48文字以内",
      "impact": "社会課題",
      "description": "内容",
      "tags": ["最大4件"],
      "keywords": ["最大6件"],
      "explorationIndex": 50-95,
      "locationName": "開催場所",
      "eventType": "permanent または limited",
      "startDate": "YYYY-MM-DD または空文字",
      "endDate": "YYYY-MM-DD または空文字",
      "lat": 数値またはnull,
      "lng": 数値またはnull,
      "questionPath": ["事実", "背景", "構造", "越境", "実装"],
      "reason": "なぜこの生徒に合うか"
    }
  ]
}

プロフィール:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: 1400,
      }),
    });

    const responseJson = await openAiResponse.json();
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI API request failed",
      });
      return;
    }

    const parsed = parseJsonObject(extractOutputText(responseJson));
    const events = (Array.isArray(parsed.events) ? parsed.events : []).slice(0, 3).map(normalizeEvent);
    response.status(200).json({ events });
  } catch (error) {
    response.status(500).json({ error: error.message || "AI候補を生成できませんでした" });
  }
}
