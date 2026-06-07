const DEFAULT_MODEL = "gpt-4.1-mini";

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 700);
}

function normalizeList(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item).slice(0, 80)).filter(Boolean).slice(0, limit)
    : [];
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
    places: normalizeList(data.places, 6),
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
          "あなたは中高生の探究学習を支援するメンターです。検索語を、観察できる事象、背景、構造、越境先、小さな実装に広げます。安全で年齢に適した内容にし、断定しすぎず、実際に足を運べる場所の種類も示します。返答はJSONだけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次の検索語に対して、探究的な回答を作ってください。

JSON形式:
{
  "answer": "中高生向けに220文字以内。検索語がどんな探究テーマになり、何を観察し、どこまで問いを広げられるかを書く",
  "keywords": ["関連キーワード 最大10件"],
  "places": ["関係する場所 最大6件。固有名詞でなく、学校・地域で訪問できる場所の種類を中心にする"],
  "nextQuestions": ["次に立てる問い 最大5件"]
}

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
