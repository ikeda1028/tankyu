const DEFAULT_MODEL = "gpt-4.1-mini";

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 700);
}

function normalizeList(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item).slice(0, 80)).filter(Boolean).slice(0, limit)
    : [];
}

function normalizeNumber(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function normalizePlaces(value, limit = 6) {
  if (!Array.isArray(value)) return [];
  return value
    .map((place) => {
      if (typeof place === "string") {
        return {
          name: normalizeText(place).slice(0, 80),
          type: "関係場所",
          reason: "観察・聞き取りの候補",
          searchHint: normalizeText(place).slice(0, 80),
          lat: null,
          lng: null,
        };
      }
      return {
        name: normalizeText(place?.name).slice(0, 80),
        type: normalizeText(place?.type, "関係場所").slice(0, 40),
        reason: normalizeText(place?.reason, "観察・聞き取りの候補").slice(0, 140),
        searchHint: normalizeText(place?.searchHint || place?.name).slice(0, 100),
        lat: normalizeNumber(place?.lat, -90, 90),
        lng: normalizeNumber(place?.lng, -180, 180),
      };
    })
    .filter((place) => place.name)
    .slice(0, limit);
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

function normalizeThemeAnswer(data, query) {
  return {
    answer: normalizeText(data.answer, `「${query}」を身近な事象から観察し、背景、構造、別分野、実装へ問いを広げる探究テーマです。`).slice(0, 360),
    keywords: normalizeList(data.keywords, 10),
    places: normalizePlaces(data.places, 6),
    nextQuestions: normalizeList(data.nextQuestions, 5),
  };
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
    const query = normalizeText(body.query).slice(0, 80);
    if (!query) {
      response.status(400).json({ error: "query is required" });
      return;
    }

    const payload = {
      query,
      grade: normalizeText(body.grade, "中高生"),
      region: normalizeText(body.region, "日本"),
      interests: normalizeList(body.interests, 10),
      localPlaces: normalizeList(body.localPlaces, 8),
      selectedPlace: body.selectedPlace
        ? {
            name: normalizeText(body.selectedPlace.name).slice(0, 80),
            type: normalizeText(body.selectedPlace.type).slice(0, 40),
            reason: normalizeText(body.selectedPlace.reason).slice(0, 140),
            searchHint: normalizeText(body.selectedPlace.searchHint).slice(0, 100),
            lat: normalizeNumber(body.selectedPlace.lat, -90, 90),
            lng: normalizeNumber(body.selectedPlace.lng, -180, 180),
          }
        : null,
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
          "あなたは中高生の探究学習メンターです。検索語を、本人がワクワクできる問いに変換してください。回答では、なぜ面白いテーマなのか、身近に観察できる事象、関係する場所、次に行くとよい場所、中高生ができる小さな実験を必ず含めます。文章はやさしく、少し冒険が始まる感じにしてください。説教っぽくせず、本人の好奇心を押し出してください。安全で年齢に適した内容にし、断定しすぎず、返答はJSONだけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次の検索語に対して、探究的な回答を作ってください。

JSON形式:
{
  "answer": "中高生向けに260文字以内。なぜ面白いテーマなのか、身近に観察できる事象、次に行くとよい場所、小さな実験を、冒険が始まるようなやさしい文章で書く",
  "keywords": ["関連キーワード 最大10件"],
  "places": [
    {
      "name": "場所名",
      "type": "場所の種類",
      "reason": "なぜこの探究語と関係するか",
      "searchHint": "Google Mapで探す時の検索語",
      "lat": 緯度の概算またはnull,
      "lng": 経度の概算またはnull
    }
  ],
  "nextQuestions": ["次に立てる問い 最大5件"]
}

場所情報の条件:
- placesは最大6件
- 地域が分かる場合だけ日本国内の概算緯度経度を入れる
- 分からない場合はlat/lngをnullにする
- selectedPlaceがある場合は、その場所で何を観察・聞き取りできるかをanswerに反映する

入力:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: 900,
      }),
    });

    const responseJson = await openAiResponse.json();
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI API request failed",
      });
      return;
    }

    response.status(200).json(normalizeThemeAnswer(parseJsonObject(extractOutputText(responseJson)), query));
  } catch (error) {
    response.status(500).json({ error: error.message || "探究回答を生成できませんでした" });
  }
}
