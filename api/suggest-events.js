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

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeFutureDate(value, today) {
  const date = normalizeText(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return date >= today ? date : "";
}

function normalizeUrl(value) {
  const url = normalizeText(value).slice(0, 500);
  return /^https?:\/\//i.test(url) ? url : "";
}

function normalizeEvent(event, index) {
  const eventType = event.eventType === "limited" ? "limited" : "permanent";
  const lat = Number(event.lat);
  const lng = Number(event.lng);
  const today = new Date().toISOString().slice(0, 10);
  const startDate = eventType === "limited" ? normalizeFutureDate(event.startDate, today) : "";
  const endDate = eventType === "limited" ? normalizeFutureDate(event.endDate, today) : "";
  const sourceUrl = normalizeUrl(event.sourceUrl);

  return {
    title: normalizeText(event.title, `探究ポイント ${index + 1}`).slice(0, 48),
    impact: normalizeText(event.impact, "地域課題・探究学習").slice(0, 64),
    description: normalizeText(event.description, "中高生が事象に出会い、問いを広げるイベントです。"),
    tags: normalizeList(event.tags, 4),
    keywords: normalizeList(event.keywords, 6),
    explorationIndex: clamp(event.explorationIndex, 50, 95),
    locationName: normalizeText(event.locationName, "地域フィールド").slice(0, 80),
    eventType,
    startDate,
    endDate,
    lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : null,
    lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : null,
    questionPath: normalizeList(event.questionPath, 5).slice(0, 5),
    reason: normalizeText(event.reason, "現在のワクワクから一歩先へ広げやすい候補です。").slice(0, 160),
    sourceUrl,
    sourceTitle: normalizeText(event.sourceTitle, "実在確認ページ").slice(0, 80),
    sourceType: ["official", "venue", "municipality", "maps", "other"].includes(event.sourceType)
      ? event.sourceType
      : "other",
    verificationNote: normalizeText(event.verificationNote, "Web検索で実在確認").slice(0, 140),
  };
}

function isVerifiedRealEvent(event) {
  if (!event.sourceUrl) return false;
  if (!event.title || !event.locationName) return false;
  return true;
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
  setCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
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
    const today = new Date().toISOString().slice(0, 10);
    const count = clamp(body.count || 3, 3, 30);
    const payload = {
      count,
      grade: normalizeText(body.grade, "中高生"),
      region: normalizeText(body.region, "日本"),
      motivation: clamp(body.motivation, 1, 100),
      sparks: normalizeText(body.sparks),
      interests: normalizeList(body.interests, 10),
      existingEvents: normalizeList(body.existingEvents, 40),
      completedEvents: normalizeList(body.completedEvents, 8),
      searchWord: normalizeText(body.searchWord).slice(0, 100),
      themeFocus: normalizeText(body.themeFocus).slice(0, 160),
      eventTypeFocus: ["permanent", "limited", "mixed"].includes(body.eventTypeFocus) ? body.eventTypeFocus : "mixed",
      locationPrecision: ["region", "specific", "none"].includes(body.locationPrecision) ? body.locationPrecision : "region",
      diversityFocus: ["balanced", "nearby", "wide"].includes(body.diversityFocus) ? body.diversityFocus : "balanced",
      extraPrompt: normalizeText(body.extraPrompt).slice(0, 300),
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
          "あなたは中高生向け探究ポイントの推薦プランナーです。必ずWeb検索を使い、実在確認できるイベント、施設、展示、博物館、科学館、公共スポット、自治体・大学・NPO等の公式情報に基づく候補だけを返します。架空のイベント名、存在確認できない開催日、推測だけの会場は絶対に含めません。安全で年齢に適した内容にし、返答はJSONだけにしてください。",
        tools: [
          {
            type: "web_search",
            user_location: {
              type: "approximate",
              country: "JP",
              region: payload.region || "Japan",
            },
          },
        ],
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次の生徒プロフィールから、探究ポイント候補を${count}件作ってください。

条件:
- 今日の日付は ${today}
- 中高生が参加できる
- 出会いは実在するイベントまたは実在する常設スポット
- 地図上に置ける探究ポイントとして作る
- 探究値は「事象に出会って、どの程度遠くまで探究できるか」で伸びる
- 常設か期間限定かを必ず入れる
- 期間限定イベントの日付は、公式ページ等で ${today} 以降の開催が確認できる場合だけ入れる。確認できない場合は候補にしない
- 常設スポットは、公式サイト・自治体・大学・施設ページ・Google Maps等で存在が確認できる場所だけにする
- 各候補に sourceUrl を必ず入れる。公式ページ、施設ページ、自治体ページ、大学ページ、NPOページ、またはGoogle Mapsで確認できるURLにする
- sourceUrl が見つからない候補は返さない
- locationName は実在する施設名・会場名・住所にする
- 緯度経度は確認できる範囲で入れる。推測しかできない場合はnullでもよいが、sourceUrlは必須
- 既存イベントと重複しない
- 検索ワードが指定されている場合は、全候補をその検索ワードから広げる
- 似たテーマに偏らず、環境、福祉、防災、文化、科学、地域経済、テクノロジーなどに分散する
- テーマの方向性が指定されている場合は優先する
- 種類指定が permanent の場合は常設中心、limited の場合は期間限定中心、mixed の場合は混ぜる
- 位置情報指定が specific の場合はできるだけ具体的な場所と概算緯度経度を入れる
- 位置情報指定が none の場合は緯度経度nullでもよい
- 分散指定が nearby の場合は地域内・近場を多めに、wide の場合は少し遠い越境先も含める
- 追加条件がある場合は安全性を保ちながら反映する

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
      "reason": "なぜこの生徒に合うか",
      "sourceUrl": "実在確認に使ったURL。必須",
      "sourceTitle": "出典ページ名",
      "sourceType": "official / venue / municipality / maps / other",
      "verificationNote": "何を根拠に実在と判断したか"
    }
  ]
}

プロフィール:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: Math.min(8000, 700 + count * 520),
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
    const events = (Array.isArray(parsed.events) ? parsed.events : [])
      .map(normalizeEvent)
      .filter(isVerifiedRealEvent)
      .slice(0, count);
    response.status(200).json({ events });
  } catch (error) {
    response.status(500).json({ error: error.message || "AI候補を生成できませんでした" });
  }
}
